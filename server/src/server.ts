import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));

// Mount routes
app.use('/api/auth', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));