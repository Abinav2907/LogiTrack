const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// File logging for debugging
const logToFile = (message) => {
  const logPath = path.join(__dirname, '../../order-debug.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
};

// Helper to generate orderId
const generateOrderId = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, items } = req.body;
    logToFile("=== ORDER CREATION START ===");
    logToFile(`User ID: ${userId}`);
    logToFile(`Items: ${JSON.stringify(items, null, 2)}`);
    console.log("=== ORDER CREATION START ===");
    console.log("User ID:", userId);
    console.log("Items:", JSON.stringify(items, null, 2));

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      logToFile("VALIDATION ERROR: Missing userId or items");
      console.log("VALIDATION ERROR: Missing userId or items");
      return res.status(400).json({ success: false, message: 'userId and items are required' });
    }

    const user = await User.findById(userId);
    logToFile(`Customer lookup: ${user ? 'FOUND' : 'NOT FOUND'}`);
    console.log("Customer:", user);
    if (!user) {
      logToFile("USER NOT FOUND - returning 404");
      console.log("USER NOT FOUND");
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate products and calculate total
    let total = 0;
    const orderItems = [];

    for (const it of items) {
      const { productId, quantity } = it;
      logToFile(`Processing item: productId=${productId}, quantity=${quantity}`);
      console.log("Processing item - Product selected:", productId, "Quantity:", quantity);
      
      if (!productId || !quantity || quantity < 1) {
        logToFile("INVALID ITEM - productId or quantity missing");
        console.log("INVALID ITEM - productId or quantity missing");
        return res.status(400).json({ success: false, message: 'Invalid item in order' });
      }

      const product = await Product.findById(productId);
      logToFile(`Product lookup result: ${product ? product.name : 'NOT FOUND'}`);
      console.log("Product lookup result:", product ? product.name : "NOT FOUND");
      
      if (!product) {
        logToFile(`PRODUCT NOT FOUND for ID: ${productId}`);
        console.log("PRODUCT NOT FOUND for ID:", productId);
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (product.stock < quantity) {
        logToFile(`INSUFFICIENT STOCK for ${product.name}: ${product.stock} < required ${quantity}`);
        console.log("INSUFFICIENT STOCK:", product.stock, "< required:", quantity);
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      // reduce stock
      product.stock -= quantity;
      await product.save();
      logToFile(`Stock reduced for product ${product.name}: new stock=${product.stock}`);
      console.log("Stock reduced for product:", product.name, "New stock:", product.stock);

      const price = product.price;
      total += price * quantity;
      orderItems.push({ product: product._id, quantity, price });
    }

    logToFile(`Creating order; total=${total}, customerName=${user.fullName}, items=${JSON.stringify(orderItems)}`);
    console.log("Creating order with:");
    console.log("  orderId:", generateOrderId());
    console.log("  customerName:", user.fullName);
    console.log("  items:", JSON.stringify(orderItems, null, 2));
    console.log("  totalPrice:", total);

    const order = new Order({
      orderId: generateOrderId(),
      customerName: user.fullName,
      items: orderItems,
      totalPrice: total,
    });

    logToFile(`Order document before save: ${JSON.stringify(order.toObject())}`);
    console.log("Order document before save:", JSON.stringify(order, null, 2));
    const savedOrder = await order.save();
    logToFile(`Order saved successfully: ${JSON.stringify(savedOrder.toObject())}`);
    console.log("Order saved successfully:", JSON.stringify(savedOrder, null, 2));

    res.status(201).json({ success: true, data: savedOrder });
  } catch (err) {
    logToFile(`ORDER CREATION ERROR: ${err.message}`);
    logToFile(`Error details: ${JSON.stringify({ message: err.message, stack: err.stack }, null, 2)}`);
    console.error("ORDER CREATION ERROR:", err.message);
    console.error("Error details:", err);
    next(err);
  }
};

// Get all orders
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('items.product', 'name price images');

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

// Get business owner orders
exports.getBusinessOrders = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price images ownerId');

    const businessOrders = orders.filter((order) =>
      Array.isArray(order.items) &&
      order.items.some(
        (item) =>
          item.product &&
          String(item.product.ownerId) === String(ownerId),
      ),
    );

    res.json({
      success: true,
      count: businessOrders.length,
      data: businessOrders,
    });
  } catch (err) {
    next(err);
  }
};

// Get order by id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Basic state transition enforcement
    const transitions = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };

    if (!transitions[order.status].includes(status) && order.status !== status) {
      return res.status(400).json({ success: false, message: `Cannot change status from ${order.status} to ${status}` });
    }

    order.status = status;
    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// Delete order (and optionally restock if not delivered)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If order not delivered, return stock
    if (order.status !== 'delivered') {
      for (const it of order.items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock: it.quantity } });
      }
    }

    await order.remove();
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};
