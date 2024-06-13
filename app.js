import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path'; // Import the path module
import errorMiddleware from './middlewares/error.middleware.js';

// Load environment variables
dotenv.config({
  path: './.env'
});

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Import all routes
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', miscRoutes);

// Server Status Check Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});

app.get('/', function(req, res) {
  console.log("cookie : ", req.cookies);
});

// Serve static files from the frontend build directory
const frontendBuildPath = path.join(path.resolve(), 'dist'); // Adjust the path if needed
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
});

// Default catch all route - 404
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!! 404 Page Not Found');
});

// Custom error handling middleware
app.use(errorMiddleware);

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;