"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const seedAdmin_1 = require("./utils/seedAdmin");
const orderController_1 = require("./controllers/orderController");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';
app.use((0, cors_1.default)({ origin: allowedOrigin, credentials: true }));
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.send('Steakz MIS API is running!');
});
app.use('/api/users', userRoutes_1.default);
app.post('/api/seed', async (_req, res) => {
    await (0, seedAdmin_1.seedAdminUser)();
    await (0, orderController_1.seedBranchesAndMenu)();
    res.json({ message: 'Seed completed successfully' });
});
app.use('/api/posts', postRoutes_1.default);
app.use('/api/comments', commentRoutes_1.default);
app.use('/auth', authRoutes_1.default);
app.use('/api', orderRoutes_1.default);
app.listen(port, async () => {
    await (0, seedAdmin_1.seedAdminUser)();
    await (0, orderController_1.seedBranchesAndMenu)();
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map