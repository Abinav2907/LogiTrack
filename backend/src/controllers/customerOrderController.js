const CustomerOrder = require("../models/CustomerOrder");
const Order = require("../models/Order");

exports.getAllOrders = async (req, res) => {
  try {
    // Only return orders for the authenticated customer
    const userId = req.user && (req.user._id || req.user.id);
    console.log(
      `getAllOrders called by userId=${userId} search=${req.query.search || ""}`,
    );
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const search = (req.query.search || "").toString().trim().toLowerCase();

    // Load orders for this customer and populate product info so frontend
    // can search by product name if requested.
    let orders = await Order.find({ customerId: userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    if (search) {
      // Filter orders where any item's product name matches the search term
      orders = orders.filter((order) => {
        const items = order.items || [];
        return items.some((it) => {
          const name =
            (it.product && (it.product.name || it.product.title)) || "";
          return name.toLowerCase().includes(search);
        });
      });
    }

    const mappedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      customerName: order.customerName,
      amount: order.totalPrice,
      // Normalize status for frontend consistency: map 'completed' -> 'delivered'
      status: (() => {
        const s = String(order.status || "").toLowerCase();
        if (s === "completed") return "delivered";
        return s;
      })(),
      date: order.createdAt,
      items: (order.items || []).map((it) => ({
        product: (it.product && (it.product.name || it.product.title)) || null,
        quantity: it.quantity,
        price: it.price,
      })),
    }));

    res.status(200).json({ success: true, data: mappedOrders });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await CustomerOrder.findById(req.params.id).populate(
      "items.product",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch order", error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    console.log("=== CUSTOMER ORDER CREATION START ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      orderId,
      customerName,
      status,
      amount,
      date,
      items,
      shippingAddress,
    } = req.body;

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
    });

    console.log("Creating order document:", JSON.stringify(newOrder, null, 2));
    const savedOrder = await newOrder.save();
    console.log(
      "Order saved successfully:",
      JSON.stringify(savedOrder, null, 2),
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("CUSTOMER ORDER CREATION ERROR:", error.message);
    console.error("Full error:", error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await CustomerOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update order", error: error.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await CustomerOrder.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete order", error: error.message });
  }
};
