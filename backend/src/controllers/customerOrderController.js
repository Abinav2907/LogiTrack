const CustomerOrder = require("../models/CustomerOrder")
const Order = require("../models/Order")

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    const mappedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      customerName: order.customerName,
      amount: order.totalPrice,
      status: order.status,
      date: order.createdAt,
    }))

    res.status(200).json(mappedOrders)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message })
  }
}

exports.getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id).populate("items.product")
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    res.status(200).json(order)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error: error.message })
  }
}

exports.createOrder = async (req, res) => {
  try {
    console.log("=== CUSTOMER ORDER CREATION START ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { orderId, customerName, status, amount, date, items, shippingAddress } = req.body

    console.log("Parsed values:");
    console.log("  orderId:", orderId);
    console.log("  customerName:", customerName);
    console.log("  items:", JSON.stringify(items, null, 2));
    console.log("  shippingAddress:", shippingAddress);

    const newOrder = new CustomerOrder({
      orderId,
      customerName,
      status,
      amount,
      date,
      items,
      shippingAddress,
    })

    console.log("Creating order document:", JSON.stringify(newOrder, null, 2));
    const savedOrder = await newOrder.save()
    console.log("Order saved successfully:", JSON.stringify(savedOrder, null, 2));
    
    res.status(201).json(savedOrder)
  } catch (error) {
    console.error("CUSTOMER ORDER CREATION ERROR:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message })
  }
}

exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json(updatedOrder)
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error: error.message })
  }
}

exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id)
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" })
    }
    res.status(200).json({ message: "Order deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error: error.message })
  }
}
