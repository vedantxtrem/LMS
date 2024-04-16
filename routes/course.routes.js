import {Router} from 'express';
import { createCourse, deleteCourse, getAllCourses ,getLecturesByCourseID, updateCourse} from '../controllers/course.controller.js'
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const Courserouter = new Router();

Courserouter.get('/',getAllCourses);

Courserouter.post('/',isLoggedIn,authorizedRoles('ADMIN'),upload.single('thumbnail'),createCourse);

Courserouter.put('/:id',isLoggedIn,authorizedRoles('ADMIN'),updateCourse);

Courserouter.delete('/:id',isLoggedIn,authorizedRoles('ADMIN'),deleteCourse);

Courserouter.get('/:id',isLoggedIn,getLecturesByCourseID);



export default Courserouter;