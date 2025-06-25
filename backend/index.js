import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize, setupRelationships } from './models/index.js';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoute.js';
import profileRoutes from './routes/profileRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js'; // Add this import
import path from 'path';
import { fileURLToPath } from 'url';
import gamificationRoutes from './routes/gamificationRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased payload limit
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('LearnX API is running');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        console.log('Connecting to DB at:', process.env.DATABASE_URL);
        await sequelize.authenticate();
        console.log('Database connected successfully!');
        
        setupRelationships(); // Initialize all model relationships
        
        await sequelize.sync({ alter: true });
        console.log('Database tables synchronized!');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();