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
                role: 'ADMIN',
            },
            {
                username: 'hqmanager',
                password: 'hqmanager1',
                role: 'HQ_MANAGER',
            },
            {
                username: 'manager',
                password: 'manager1',
                role: 'MANAGER',
            },
            {
                username: 'cashier',
                password: 'cashier1',
                role: 'CASHIER',
            },
            {
                username: 'chef',
                password: 'chef1',
                role: 'CHEF',
            },
            {
                username: 'waiter',
                password: 'waiter1',
                role: 'WAITER',
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