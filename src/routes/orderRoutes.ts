import { Router } from 'express';
import {
  getBranches,
  getMenuItems,
  placeOrder,
  getOrders,
  updateOrderStatus,
  processPayment,
  getBranchSales,
  getBranchInventory
} from '../controllers/orderController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

// Public / all authenticated
router.get('/branches', authenticateToken, getBranches);
router.get('/menu', authenticateToken, getMenuItems);

// Orders
router.post('/orders', authenticateToken, authorizeRole(['WAITER', 'CASHIER', 'MANAGER', 'ADMIN']), placeOrder);
router.get('/orders', authenticateToken, authorizeRole(['WAITER', 'CASHIER', 'CHEF', 'MANAGER', 'HQ_MANAGER', 'ADMIN']), getOrders);
router.patch('/orders/:id/status', authenticateToken, authorizeRole(['CHEF', 'MANAGER', 'ADMIN']), updateOrderStatus);
router.patch('/orders/:id/payment', authenticateToken, authorizeRole(['CASHIER', 'MANAGER', 'ADMIN']), processPayment);

// Sales and inventory for managers
router.get('/sales', authenticateToken, authorizeRole(['ADMIN', 'HQ_MANAGER', 'MANAGER', 'CASHIER']), getBranchSales);
router.get('/inventory', authenticateToken, authorizeRole(['ADMIN', 'HQ_MANAGER', 'MANAGER', 'CHEF']), getBranchInventory);

export default router;
