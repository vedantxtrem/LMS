import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'


config();

const app = express();

app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', function (req, res) {
    res.send('/pong')
})

// routes of 3 modules

app.use('/api/v1/user',userRoutes)

app.all('*', (req, res) => {
    res.status(404).send('OPPS! 404 NOT FOUND');
})
export default app;