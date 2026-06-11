import { Router } from 'express';
import {
  getBranches,
  getMenuItems,
  placeOrder,
  getOrders,
  updateOrderStatus,
  processPayment
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

export default router;
