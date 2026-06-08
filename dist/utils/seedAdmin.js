"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("./hash");
const prisma = new client_1.PrismaClient();
const seedAdminUser = async () => {
    try {
        const predefinedUsers = [
            {
                username: 'admin',
                password: 'admin1',
                role: client_1.UserRole.ADMIN,
            },
            {
                username: 'hqmanager',
                password: 'hqmanager1',
                role: client_1.UserRole.HQ_MANAGER,
            },
            {
                username: 'manager',
                password: 'manager1',
                role: client_1.UserRole.MANAGER,
            },
            {
                username: 'cashier',
                password: 'cashier1',
                role: client_1.UserRole.WAITER_CASHIER,
            },
            {
                username: 'chef',
                password: 'chef1',
                role: client_1.UserRole.CHEF,
            },
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
                        isActive: true
                    },
                });
                console.log(`✅ ${user.role} user created: ${user.username}`);
            }
            else {
                console.log(`ℹ️ ${user.role} user already exists: ${user.username}`);
            }
        }
    }
    catch (error) {
        console.error('Error seeding users:', error);
        return;
    }
};
exports.seedAdminUser = seedAdminUser;
//# sourceMappingURL=seedAdmin.js.map