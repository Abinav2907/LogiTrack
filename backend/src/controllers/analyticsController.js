const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/product");

// Aggregated analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

    const revenueAgg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.ownerId": ownerObjectId,
          status: { $in: ["processing", "shipped", "delivered"] },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$orderRevenue" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const { totalRevenue = 0, totalOrders = 0 } = revenueAgg[0] || {};

    const now = new Date();
    const last30Start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const prev30Start = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Agg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.ownerId": ownerObjectId,
          createdAt: { $gte: last30Start },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$orderRevenue" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const prev30Agg = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.ownerId": ownerObjectId,
          createdAt: { $gte: prev30Start, $lt: last30Start },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderRevenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$orderRevenue" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const lastRevenue = last30Agg[0]?.revenue || 0;
    const prevRevenue = prev30Agg[0]?.revenue || 0;
    let growth = 0;
    if (prevRevenue === 0) growth = lastRevenue === 0 ? 0 : 100;
    else growth = ((lastRevenue - prevRevenue) / prevRevenue) * 100;

    const lowStockCount = await Product.countDocuments({
      ownerId: ownerObjectId,
      $expr: { $lt: ["$stock", "$minStock"] },
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        salesGrowthPercent: Number(growth.toFixed(2)),
        lowStockCount,
        last30Revenue: lastRevenue,
        prev30Revenue: prevRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};
