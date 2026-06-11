import { PrismaClient } from '@prisma/client'
import { hashPassword } from './hash';

const prisma = new PrismaClient()

export const seedAdminUser = async () => {
  try{
    // Predefined users for all roles except CUSTOMER
    const predefinedUsers = [
      {
        username: 'admin',
        password: 'admin1',
        role: 'ADMIN' as any,
      },
      {
        username: 'hqmanager',
        password: 'hqmanager1',
        role: 'HQ_MANAGER' as any,
      },
      {
        username: 'manager',
        password: 'manager1',
        role: 'MANAGER' as any,
      },
      {
        username: 'cashier',
        password: 'cashier1',
        role: 'CASHIER' as any,
      },
      {
        username: 'chef',
        password: 'chef1',
        role: 'CHEF' as any,
      },
      {
        username: 'waiter',
        password: 'waiter1',
        role: 'WAITER' as any,
      },
    ];

    for (const user of predefinedUsers) {
      const exists = await prisma.user.findUnique({ where: { username: user.username } });
      if (!exists) {
        const hashedPassword = await hashPassword(user.password);
        await prisma.user.create({
          data: {
            username: user.username,
            password: hashedPassword,
            role: user.role,
            isActive: true
          },
        });
        console.log(`✅ ${user.role} user created: ${user.username}`);
      } else {
        console.log(`ℹ️ ${user.role} user already exists: ${user.username}`);
      }
    }
  }
  catch (error) {
    console.error('Error seeding users:', error);
    return;
  }
};
