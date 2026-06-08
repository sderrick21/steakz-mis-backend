import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from './hash';

const prisma = new PrismaClient()

export const seedAdminUser = async () => {
  try{
    // Predefined users for all roles except CUSTOMER
    const predefinedUsers = [
      {
        username: 'admin',
        password: 'admin1',
        role: UserRole.ADMIN,
      },
      {
        username: 'hqmanager',
        password: 'hqmanager1',
        role: UserRole.HQ_MANAGER,
      },
      {
        username: 'manager',
        password: 'manager1',
        role: UserRole.MANAGER,
      },
      {
        username: 'cashier',
        password: 'cashier1',
        role: UserRole.WAITER_CASHIER,
      },
      {
        username: 'chef',
        password: 'chef1',
        role: UserRole.CHEF,
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
