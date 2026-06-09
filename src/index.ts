import express, { Request, Response } from 'express';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
import cors from 'cors';
import { seedAdminUser } from './utils/seedAdmin';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Homepage route
app.get('/', (_req: Request, res: Response) => {
    res.send('Welcome to the homepage!');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/auth', authRoutes);

// Start the server
app.listen(port, async () => {
    await seedAdminUser();
    console.log(`Server is running on http://localhost:${port}`);
});