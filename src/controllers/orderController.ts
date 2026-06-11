import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ── GET all branches ──────────────────────────────────────────────────────────
export const getBranches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, address: true }
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches' });
  }
};

// ── GET menu items ────────────────────────────────────────────────────────────
export const getMenuItems = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
};

// ── WAITER: Place a new order ─────────────────────────────────────────────────
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId, tableNumber, orderType, items, notes } = req.body;
    const waiterId = req.user.id;

    if (!branchId || !items || !items.length) {
      res.status(400).json({ message: 'branchId and items are required' });
      return;
    }

    // Calculate total
    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
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

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
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
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

// ── GET orders (filtered by role) ─────────────────────────────────────────────
export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, id: userId } = req.user;
    const { branchId, status } = req.query;

    let where: any = {};

    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    // Waiters only see their own orders
    if (role === 'WAITER') {
      where.waiterCashierId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { menuItem: { select: { name: true, price: true } } } },
        branch: { select: { name: true } },
        waiterCashier: { select: { username: true } }
      },
      orderBy: { orderedAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// ── CHEF: Update order status ─────────────────────────────────────────────────
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const updateData: any = { status };
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'PREPARING') updateData.preparedAt = new Date();
    if (status === 'SERVED') updateData.servedAt = new Date();

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: { include: { menuItem: { select: { name: true } } } },
        branch: { select: { name: true } }
      }
    });

    res.json({ message: 'Order status updated', order: updated });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

// ── CASHIER: Process payment ──────────────────────────────────────────────────
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const validMethods = ['CASH', 'CARD', 'DIGITAL_WALLET'];
    if (!validMethods.includes(paymentMethod)) {
      res.status(400).json({ message: `Invalid payment method. Must be: ${validMethods.join(', ')}` });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (order.paymentStatus === 'PAID') {
      res.status(400).json({ message: 'Order already paid' });
      return;
    }

    const updated = await prisma.order.update({
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
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

// ── SEED: Add branches and menu items if none exist ───────────────────────────
export const seedBranchesAndMenu = async (): Promise<void> => {
  try {
    let branchCount = await prisma.branch.count();
    if (branchCount === 0) {
      const branches = await prisma.branch.createMany({
        data: [
          { name: 'Steakz Downtown', address: '1 High Street, London', phone: '020-1111-1111', email: 'downtown@steakz.co.uk' },
          { name: 'Steakz Uptown', address: '45 Park Lane, London', phone: '020-2222-2222', email: 'uptown@steakz.co.uk' },
          { name: 'Steakz Manchester', address: '10 Piccadilly, Manchester', phone: '0161-333-3333', email: 'manchester@steakz.co.uk' },
        ]
      });
      console.log(`✅ Seeded ${branches.count} branches`);
    } else {
      console.log(`ℹ️ Branches already exist`);
    }

    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      const steaks = await prisma.category.create({ data: { name: 'Steaks', sortOrder: 1 } });
      const sides = await prisma.category.create({ data: { name: 'Sides', sortOrder: 2 } });
      const drinks = await prisma.category.create({ data: { name: 'Drinks', sortOrder: 3 } });
      const desserts = await prisma.category.create({ data: { name: 'Desserts', sortOrder: 4 } });

      await prisma.menuItem.createMany({
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
    } else {
      console.log('ℹ️ Menu items already exist');
    }

    // Assign waiter and cashier to branches if not done
    const waiterUser = await prisma.user.findUnique({ where: { username: 'waiter' } });
    if (!waiterUser) {
      const branch = await prisma.branch.findFirst();
      if (branch) {
        const { hashPassword } = await import('../utils/hash');
        await prisma.user.create({
          data: {
            username: 'waiter',
            password: await hashPassword('waiter1'),
            role: 'WAITER' as any,
            branchId: branch.id,
            isActive: true
          }
        });
        console.log('✅ Waiter user created: waiter / waiter1');
      }
    } else {
      console.log('ℹ️ Waiter user already exists');
    }

    // Assign existing cashier to first branch
    const cashier = await prisma.user.findUnique({ where: { username: 'cashier' } });
    if (cashier && !cashier.branchId) {
      const branch = await prisma.branch.findFirst();
      if (branch) {
        await prisma.user.update({ where: { username: 'cashier' }, data: { branchId: branch.id } });
        console.log('✅ Cashier assigned to branch');
      }
    }

    // Assign existing chef to first branch
    const chef = await prisma.user.findUnique({ where: { username: 'chef' } });
    if (chef && !chef.branchId) {
      const branch = await prisma.branch.findFirst();
      if (branch) {
        await prisma.user.update({ where: { username: 'chef' }, data: { branchId: branch.id } });
        console.log('✅ Chef assigned to branch');
      }
    }

  } catch (error) {
    console.error('Error seeding branches/menu:', error);
  }
};
