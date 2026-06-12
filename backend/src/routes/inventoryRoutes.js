const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.use(authenticateToken);

router.get('/', inventoryController.getInventory);
router.get('/low', inventoryController.getLowStock);
router.put('/:productId', inventoryController.updateStock);

module.exports = router;
