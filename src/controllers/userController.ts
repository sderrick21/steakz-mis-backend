import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword } from '../utils/hash';

// Get users based on role
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        // Get total count for pagination
        const totalCount = await prisma.user.count();

        const users = await prisma.user.findMany({
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
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// Get specific user's details
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({
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
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
};

// Admin-only: Create new user
export const adminCreateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, role, branchId } = req.body;
        // Input validation
        if (!username?.trim() || !password?.trim() || !role) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }
        // Check username uniqueness
        const existingUser = await prisma.user.findUnique({
            where: { username: username.trim() }
        });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
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
    } catch (error) {
        console.error('Error in adminCreateUser:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Admin-only: Update user details
export const adminUpdateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { password, role, branchId, isActive } = req.body;
        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Prepare update data
        const updateData: any = {};
        if (password?.trim()) updateData.password = await hashPassword(password);
        if (role) updateData.role = role;
        if (branchId !== undefined) updateData.branchId = branchId;
        if (isActive !== undefined) updateData.isActive = isActive;
        const updatedUser = await prisma.user.update({
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
    } catch (error) {
        console.error('Error in adminUpdateUser:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Admin-only: Delete user
export const adminDeleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true, role: true }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await prisma.user.delete({
            where: { id }
        });
        res.json({ 
            message: `User ${targetUser.username} and all associated data deleted successfully`
        });
    } catch (error) {
        console.error('Error in adminDeleteUser:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
