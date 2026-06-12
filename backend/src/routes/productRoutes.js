const authenticateToken = require("../middleware/authenticateToken");
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.use(authenticateToken);

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
