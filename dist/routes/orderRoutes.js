"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/branches', authMiddleware_1.authenticateToken, orderController_1.getBranches);
router.get('/menu', authMiddleware_1.authenticateToken, orderController_1.getMenuItems);
router.post('/orders', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['WAITER', 'CASHIER', 'MANAGER', 'ADMIN']), orderController_1.placeOrder);
router.get('/orders', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['WAITER', 'CASHIER', 'CHEF', 'MANAGER', 'HQ_MANAGER', 'ADMIN']), orderController_1.getOrders);
router.patch('/orders/:id/status', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['CHEF', 'MANAGER', 'ADMIN']), orderController_1.updateOrderStatus);
router.patch('/orders/:id/payment', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['CASHIER', 'MANAGER', 'ADMIN']), orderController_1.processPayment);
router.get('/sales', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['ADMIN', 'HQ_MANAGER', 'MANAGER', 'CASHIER']), orderController_1.getBranchSales);
router.get('/inventory', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['ADMIN', 'HQ_MANAGER', 'MANAGER', 'CHEF']), orderController_1.getBranchInventory);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map