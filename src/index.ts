import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import { seedAdminUser } from './utils/seedAdmin';
import { seedBranchesAndMenu } from './controllers/orderController';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send('Steakz MIS API is running!');
});

app.use('/api/users', userRoutes);

// Force seed endpoint - call once to ensure all data exists
app.post('/api/seed', async (_req: Request, res: Response) => {
    await seedAdminUser();
    await seedBranchesAndMenu();
    res.json({ message: 'Seed completed successfully' });
});
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/auth', authRoutes);
app.use('/api', orderRoutes);

app.listen(port, async () => {
    await seedAdminUser();
    await seedBranchesAndMenu();
    console.log(`Server is running on http://localhost:${port}`);
});
// Force seed endpoint
