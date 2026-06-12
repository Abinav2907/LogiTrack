const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, images, category, sku, tags, stock, minStock } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const product = new Product({name,description,price,images,category,sku,tags,stock,minStock,ownerId:req.user.id});
    await product.save();

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// Get list of products with optional query filters
exports.getProducts = async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, inStock } = req.query;
    const filter = {};

    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...(filter.price || {}), $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...(filter.price || {}), $lte: Number(maxPrice) };
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const products = await Product.find({...filter,ownerId: req.user.id,isActive: true,}).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    next(err);
  }
};

// Get single product by id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      ownerId: req.user.id,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = req.body;
    // Prevent setting negative stock
    if (updates.stock != null && updates.stock < 0) {
      return res.status(400).json({ success: false, message: 'Stock cannot be negative' });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      updates,
      { new: true, runValidators: true },
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

// Delete product (soft-delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // soft delete to preserve history
    product.isActive = false;
    await product.save();

    res.json({ success: true, message: 'Product removed' });
  } catch (err) {
    next(err);
  }
};
