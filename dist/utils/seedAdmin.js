"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("./hash");
const prisma = new client_1.PrismaClient();
const seedAdminUser = async () => {
    try {
        const firstBranch = await prisma.branch.findFirst({ orderBy: { createdAt: 'asc' } });
        const branchId = firstBranch?.id || null;
        const predefinedUsers = [
            { username: 'admin', password: 'admin1', role: 'ADMIN', branchId: null },
            { username: 'hqmanager', password: 'hqmanager1', role: 'HQ_MANAGER', branchId: null },
            { username: 'manager', password: 'manager1', role: 'MANAGER', branchId },
            { username: 'cashier', password: 'cashier1', role: 'CASHIER', branchId },
            { username: 'chef', password: 'chef1', role: 'CHEF', branchId },
            { username: 'waiter', password: 'waiter1', role: 'WAITER', branchId },
        ];
        for (const user of predefinedUsers) {
            const exists = await prisma.user.findUnique({ where: { username: user.username } });
            if (!exists) {
                const hashedPassword = await (0, hash_1.hashPassword)(user.password);
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
            }
            else {
                if (!exists.branchId && user.branchId && user.role !== 'ADMIN' && user.role !== 'HQ_MANAGER') {
                    await prisma.user.update({
                        where: { username: user.username },
                        data: { branchId: user.branchId }
                    });
                    console.log(`✅ Updated ${user.username} with branchId: ${user.branchId}`);
                }
                else {
                    console.log(`ℹ️ ${user.role} user already exists: ${user.username}`);
                }
            }
        }
    }
    catch (error) {
        console.error('Error seeding users:', error);
    }
};
exports.seedAdminUser = seedAdminUser;
//# sourceMappingURL=seedAdmin.js.map