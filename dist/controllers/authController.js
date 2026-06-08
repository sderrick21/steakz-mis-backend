"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
const hash_1 = require("../utils/hash");
dotenv_1.default.config();
const signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const existingUser = await prisma_1.default.user.findUnique({ where: { username } });
    if (existingUser)
        return res.status(400).json({ message: 'Username already taken' });
    const hashedPassword = await (0, hash_1.hashPassword)(password);
    const user = await prisma_1.default.user.create({
        data: {
            username,
            password: hashedPassword,
            role: 'CUSTOMER',
            isActive: true
        },
    });
    res.status(201).json({ message: 'User created', user: { id: user.id, username: user.username, role: user.role } });
};
exports.signup = signup;
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    const user = await prisma_1.default.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            password: true,
            role: true,
            branchId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });
    if (!user)
        return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await (0, hash_1.comparePassword)(password, user.password);
    if (!valid)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        token,
        user: userWithoutPassword
    });
};
exports.login = login;
//# sourceMappingURL=authController.js.map