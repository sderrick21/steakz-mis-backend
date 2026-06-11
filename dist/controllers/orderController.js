"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedBranchesAndMenu = exports.processPayment = exports.updateOrderStatus = exports.getOrders = exports.placeOrder = exports.getMenuItems = exports.getBranches = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getBranches = async (_req, res) => {
    try {
        const branches = await prisma_1.default.branch.findMany({
            where: { isActive: true },
            select: { id: true, name: true, address: true }
        });
        res.json(branches);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching branches' });
    }
};
exports.getBranches = getBranches;
const getMenuItems = async (_req, res) => {
    try {
        const items = await prisma_1.default.menuItem.findMany({
            where: { isAvailable: true },
            include: { category: { select: { name: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching menu items' });
    }
};
exports.getMenuItems = getMenuItems;
const placeOrder = async (req, res) => {
    try {
        const { branchId, tableNumber, orderType, items, notes } = req.body;
        const waiterId = req.user.id;
        if (!branchId || !items || !items.length) {
            res.status(400).json({ message: 'branchId and items are required' });
            return;
        }
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const menuItem = await prisma_1.default.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (!menuItem) {
                res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
                return;
            }
            const unitPrice = Number(menuItem.price);
            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;
            orderItems.push({
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPrice,
                totalPrice,
                specialInstructions: item.specialInstructions || null
            });
        }
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const order = await prisma_1.default.order.create({
            data: {
                orderNumber,
                branchId,
                waiterCashierId: waiterId,
                status: 'PENDING',
                orderType: orderType || 'DINE_IN',
                tableNumber: tableNumber || null,
                totalAmount,
                paymentStatus: 'PENDING',
                notes: notes || null,
                orderedAt: new Date(),
                orderItems: { create: orderItems }
            },
            include: {
                orderItems: { include: { menuItem: { select: { name: true } } } },
                branch: { select: { name: true } }
            }
        });
        res.status(201).json({ message: 'Order placed successfully', order });
    }
    catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Error placing order' });
    }
};
exports.placeOrder = placeOrder;
const getOrders = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const { branchId, status } = req.query;
        let where = {};
        if (branchId)
            where.branchId = branchId;
        if (status)
            where.status = status;
        if (role === 'WAITER') {
            where.waiterCashierId = userId;
        }
        const orders = await prisma_1.default.order.findMany({
            where,
            include: {
                orderItems: { include: { menuItem: { select: { name: true, price: true } } } },
                branch: { select: { name: true } },
                waiterCashier: { select: { username: true } }
            },
            orderBy: { orderedAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};
exports.getOrders = getOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            return;
        }
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        const updateData = { status };
        if (status === 'CONFIRMED')
            updateData.confirmedAt = new Date();
        if (status === 'PREPARING')
            updateData.preparedAt = new Date();
        if (status === 'SERVED')
            updateData.servedAt = new Date();
        const updated = await prisma_1.default.order.update({
            where: { id },
            data: updateData,
            include: {
                orderItems: { include: { menuItem: { select: { name: true } } } },
                branch: { select: { name: true } }
            }
        });
        res.json({ message: 'Order status updated', order: updated });
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const processPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod } = req.body;
        const validMethods = ['CASH', 'CARD', 'DIGITAL_WALLET'];
        if (!validMethods.includes(paymentMethod)) {
            res.status(400).json({ message: `Invalid payment method. Must be: ${validMethods.join(', ')}` });
            return;
        }
        const order = await prisma_1.default.order.findUnique({ where: { id } });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.paymentStatus === 'PAID') {
            res.status(400).json({ message: 'Order already paid' });
            return;
        }
        const updated = await prisma_1.default.order.update({
            where: { id },
            data: {
                paymentStatus: 'PAID',
                paymentMethod,
                status: 'SERVED'
            },
            include: {
                orderItems: { include: { menuItem: { select: { name: true } } } },
                branch: { select: { name: true } }
            }
        });
        res.json({ message: 'Payment processed successfully', order: updated });
    }
    catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};
exports.processPayment = processPayment;
const seedBranchesAndMenu = async () => {
    try {
        let branchCount = await prisma_1.default.branch.count();
        if (branchCount === 0) {
            const branches = await prisma_1.default.branch.createMany({
                data: [
                    { name: 'Steakz Downtown', address: '1 High Street, London', phone: '020-1111-1111', email: 'downtown@steakz.co.uk' },
                    { name: 'Steakz Uptown', address: '45 Park Lane, London', phone: '020-2222-2222', email: 'uptown@steakz.co.uk' },
                    { name: 'Steakz Manchester', address: '10 Piccadilly, Manchester', phone: '0161-333-3333', email: 'manchester@steakz.co.uk' },
                ]
            });
            console.log(`✅ Seeded ${branches.count} branches`);
        }
        else {
            console.log(`ℹ️ Branches already exist`);
        }
        const categoryCount = await prisma_1.default.category.count();
        if (categoryCount === 0) {
            const steaks = await prisma_1.default.category.create({ data: { name: 'Steaks', sortOrder: 1 } });
            const sides = await prisma_1.default.category.create({ data: { name: 'Sides', sortOrder: 2 } });
            const drinks = await prisma_1.default.category.create({ data: { name: 'Drinks', sortOrder: 3 } });
            const desserts = await prisma_1.default.category.create({ data: { name: 'Desserts', sortOrder: 4 } });
            await prisma_1.default.menuItem.createMany({
                data: [
                    { name: 'Ribeye Steak 250g', description: 'Prime ribeye, charcoal grilled', price: 32.50, categoryId: steaks.id, preparationTimeMinutes: 20 },
                    { name: 'Sirloin Steak 300g', description: 'Classic sirloin, cooked to order', price: 28.00, categoryId: steaks.id, preparationTimeMinutes: 18 },
                    { name: 'Fillet Steak 200g', description: 'Tender fillet, the finest cut', price: 42.00, categoryId: steaks.id, preparationTimeMinutes: 15 },
                    { name: 'T-Bone Steak 400g', description: 'The ultimate steak for two', price: 54.00, categoryId: steaks.id, preparationTimeMinutes: 25 },
                    { name: 'Truffle Fries', description: 'Hand-cut fries with truffle oil', price: 6.50, categoryId: sides.id, preparationTimeMinutes: 10 },
                    { name: 'Creamed Spinach', description: 'Wilted spinach in cream sauce', price: 5.00, categoryId: sides.id, preparationTimeMinutes: 8 },
                    { name: 'Garlic Mushrooms', description: 'Button mushrooms, garlic butter', price: 5.50, categoryId: sides.id, preparationTimeMinutes: 8 },
                    { name: 'House Red Wine (Glass)', description: 'Smooth Malbec from Argentina', price: 8.50, categoryId: drinks.id, preparationTimeMinutes: 2 },
                    { name: 'Sparkling Water', description: '500ml San Pellegrino', price: 3.50, categoryId: drinks.id, preparationTimeMinutes: 1 },
                    { name: 'Craft Beer', description: 'Local IPA on draught', price: 6.00, categoryId: drinks.id, preparationTimeMinutes: 2 },
                    { name: 'Chocolate Fondant', description: 'Warm fondant with vanilla ice cream', price: 9.00, categoryId: desserts.id, preparationTimeMinutes: 12 },
                    { name: 'Cheesecake', description: 'New York style with berry compote', price: 7.50, categoryId: desserts.id, preparationTimeMinutes: 5 },
                ]
            });
            console.log('✅ Seeded menu categories and items');
        }
        else {
            console.log('ℹ️ Menu items already exist');
        }
        const waiterUser = await prisma_1.default.user.findUnique({ where: { username: 'waiter' } });
        if (!waiterUser) {
            const branch = await prisma_1.default.branch.findFirst();
            if (branch) {
                const { hashPassword } = await Promise.resolve().then(() => __importStar(require('../utils/hash')));
                await prisma_1.default.user.create({
                    data: {
                        username: 'waiter',
                        password: await hashPassword('waiter1'),
                        role: 'WAITER',
                        branchId: branch.id,
                        isActive: true
                    }
                });
                console.log('✅ Waiter user created: waiter / waiter1');
            }
        }
        else {
            console.log('ℹ️ Waiter user already exists');
        }
        const cashier = await prisma_1.default.user.findUnique({ where: { username: 'cashier' } });
        if (cashier && !cashier.branchId) {
            const branch = await prisma_1.default.branch.findFirst();
            if (branch) {
                await prisma_1.default.user.update({ where: { username: 'cashier' }, data: { branchId: branch.id } });
                console.log('✅ Cashier assigned to branch');
            }
        }
        const chef = await prisma_1.default.user.findUnique({ where: { username: 'chef' } });
        if (chef && !chef.branchId) {
            const branch = await prisma_1.default.branch.findFirst();
            if (branch) {
                await prisma_1.default.user.update({ where: { username: 'chef' }, data: { branchId: branch.id } });
                console.log('✅ Chef assigned to branch');
            }
        }
    }
    catch (error) {
        console.error('Error seeding branches/menu:', error);
    }
};
exports.seedBranchesAndMenu = seedBranchesAndMenu;
//# sourceMappingURL=orderController.js.map