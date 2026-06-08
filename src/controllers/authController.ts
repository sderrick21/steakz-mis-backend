import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import dotenv from 'dotenv';
import { comparePassword, hashPassword } from '../utils/hash';

dotenv.config();

export const signup = async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Check for existing username
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) return res.status(400).json({ message: 'Username already taken' });

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: 'CUSTOMER', // Always assign CUSTOMER role on signup
      isActive: true
    },
  });

  res.status(201).json({ message: 'User created', user: { id: user.id, username: user.username, role: user.role } });
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true, // Add password to select for login check
      role: true,
      branchId: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await comparePassword(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  );

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    token,
    user: userWithoutPassword
  });
};