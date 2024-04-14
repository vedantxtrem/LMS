import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js'


config();

const app = express();

app.use(morgan('dev'))

app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());

app.use('/ping', (req,res)=>{
    res.send('/pong')
})
//module routes 
app.use('/api/v1/user',userRoutes)


app.all('*',(req,res)=>{
    res.status(404).send('OOPs 404 erorr Page not Found');
})

app.use(errorMiddleware)

export default app;
