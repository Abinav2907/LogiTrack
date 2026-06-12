const Product = require('../models/Product');

// Fetch inventory overview
exports.getInventory = async (req, res, next) => {
  try {
    const products = await Product.find({ ownerId: req.user.id }).select(
      'name stock minStock price category',
    );
    const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
    res.json({ success: true, count: products.length, totalItems, data: products });
  } catch (err) {
    next(err);
  }
};

// Fetch low stock items
exports.getLowStock = async (req, res, next) => {
  try {
    const low = await Product.find({
      ownerId: req.user.id,
      $expr: { $lt: ['$stock', '$minStock'] },
    }).select('name stock minStock');
    res.json({ success: true, count: low.length, data: low });
  } catch (err) {
    next(err);
  }
};

// Update stock levels (set or delta)
exports.updateStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { set, delta } = req.body;
    const product = await Product.findOne({ _id: productId, ownerId: req.user.id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (typeof set === 'number') {
      if (set < 0) return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
      product.stock = set;
    } else if (typeof delta === 'number') {
      product.stock += delta;
      if (product.stock < 0) product.stock = 0;
    } else {
      return res.status(400).json({ success: false, message: 'set or delta required' });
    }

    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
