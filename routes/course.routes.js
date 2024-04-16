import {Router} from 'express';
import { getAllCourses ,getLecturesByCourseID} from '../controllers/course.controller.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const Courserouter = new Router();

Courserouter.get('/',getAllCourses);
Courserouter.get('/:id',isLoggedIn,getLecturesByCourseID);

export default Courserouter;