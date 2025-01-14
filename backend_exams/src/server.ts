import express from 'express';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import authRouter from './routers/authRouter';
import examsRouter from './routers/examRouter';
import notificationsRouter from './routers/notificationsRouter';

import studentsRouter from './routers/studentsRouter';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/auth', authRouter);
app.use('/notifications', notificationsRouter);
app.use('/student', studentsRouter);
app.use('/exams', examsRouter);

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

export default app;