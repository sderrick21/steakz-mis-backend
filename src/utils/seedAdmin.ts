import { PrismaClient } from '@prisma/client'
import { hashPassword } from './hash';

const prisma = new PrismaClient()

export const seedAdminUser = async () => {
  try {
    // Get the first branch to assign to branch-level staff
    const firstBranch = await prisma.branch.findFirst({ orderBy: { createdAt: 'asc' } });
    const branchId = firstBranch?.id || null;

    const predefinedUsers = [
      { username: 'admin',      password: 'admin1',      role: 'ADMIN' as any,      branchId: null },
      { username: 'hqmanager',  password: 'hqmanager1',  role: 'HQ_MANAGER' as any, branchId: null },
      { username: 'manager',    password: 'manager1',    role: 'MANAGER' as any,    branchId },
      { username: 'cashier',    password: 'cashier1',    role: 'CASHIER' as any,    branchId },
      { username: 'chef',       password: 'chef1',       role: 'CHEF' as any,       branchId },
      { username: 'waiter',     password: 'waiter1',     role: 'WAITER' as any,     branchId },
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
            branchId: user.branchId,
            isActive: true
          },
        });
        console.log(`✅ ${user.role} user created: ${user.username} (branch: ${user.branchId || 'none'})`);
      } else {
        // Update branchId if not set and user needs one
        if (!exists.branchId && user.branchId && user.role !== 'ADMIN' && user.role !== 'HQ_MANAGER') {
          await prisma.user.update({
            where: { username: user.username },
            data: { branchId: user.branchId }
          });
          console.log(`✅ Updated ${user.username} with branchId: ${user.branchId}`);
        } else {
          console.log(`ℹ️ ${user.role} user already exists: ${user.username}`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};
