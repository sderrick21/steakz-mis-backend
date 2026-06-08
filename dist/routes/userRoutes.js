"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticateToken, userController_1.getAllUsers);
router.get('/:id', authMiddleware_1.authenticateToken, userController_1.getUserById);
router.use('/admin', authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(['ADMIN']));
router.post('/', userController_1.adminCreateUser);
router.put('/:id', userController_1.adminUpdateUser);
router.delete('/:id', userController_1.adminDeleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map