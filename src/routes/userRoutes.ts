import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    adminCreateUser,
    adminUpdateUser,
    adminDeleteUser
} from '../controllers/userController';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware';

const router = Router();

// Base routes - require authentication
router.get('/me', authenticateToken, async (req: any, res: any) => {
  const prisma = (await import('../utils/prisma')).default;
  const user = await prisma.user.findUnique({ 
    where: { id: req.user.id }, 
    select: { id: true, username: true, role: true, branchId: true } 
  });
  res.json(user);
});
router.get('/', authenticateToken, authorizeRole(['ADMIN', 'HQ_MANAGER', 'MANAGER']), getAllUsers);                // List users - Admin and Manager only
router.get('/:id', authenticateToken, authorizeRole(['ADMIN', 'HQ_MANAGER', 'MANAGER']), getUserById);            // View user details

// Admin routes - require authentication and admin role
router.use('/admin', authenticateToken, authorizeRole(['ADMIN']));  // Protect all admin routes

// Group all admin routes
router.post('/', adminCreateUser);         // Create new user
router.put('/:id', adminUpdateUser);       // Update user details
router.delete('/:id', adminDeleteUser);     // Delete user

export default router;
