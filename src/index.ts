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
const port = 3000; // Change to 3000 for frontend compatibility

// Middleware
app.use(cors()); // Add CORS support
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