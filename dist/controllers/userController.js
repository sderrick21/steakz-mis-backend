"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteUser = exports.adminUpdateUser = exports.adminCreateUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const hash_1 = require("../utils/hash");
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalCount = await prisma_1.default.user.count();
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        res.json({
            users,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(targetUser);
    }
    catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
};
exports.getUserById = getUserById;
const adminCreateUser = async (req, res) => {
    try {
        const { username, password, role, branchId } = req.body;
        if (!username?.trim() || !password?.trim() || !role) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { username: username.trim() }
        });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        const newUser = await prisma_1.default.user.create({
            data: {
                username: username.trim(),
                password: hashedPassword,
                role,
                branchId,
                isActive: true
            },
            select: {
                id: true,
                username: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    }
    catch (error) {
        console.error('Error in adminCreateUser:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};
exports.adminCreateUser = adminCreateUser;
const adminUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, role, branchId, isActive } = req.body;
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const updateData = {};
        if (password?.trim())
            updateData.password = await (0, hash_1.hashPassword)(password);
        if (role)
            updateData.role = role;
        if (branchId !== undefined)
            updateData.branchId = branchId;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        const updatedUser = await prisma_1.default.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                branchId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Error in adminUpdateUser:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};
exports.adminUpdateUser = adminUpdateUser;
const adminDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id },
            select: { id: true, username: true, role: true }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await prisma_1.default.user.delete({
            where: { id }
        });
        res.json({
            message: `User ${targetUser.username} and all associated data deleted successfully`
        });
    }
    catch (error) {
        console.error('Error in adminDeleteUser:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
exports.adminDeleteUser = adminDeleteUser;
//# sourceMappingURL=userController.js.map