import {Router} from 'express';
import { createCourse, deleteCourse, getAllCourses ,getLecturesByCourseID, updateCourse} from '../controllers/course.controller.js'
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const Courserouter = new Router();

Courserouter.get('/',getAllCourses);
Courserouter.post('/',upload.single('thumbnail'),createCourse);

Courserouter.put('/:id',updateCourse);
Courserouter.delete('/:id',deleteCourse);
Courserouter.get('/:id',isLoggedIn,getLecturesByCourseID);



export default Courserouter;