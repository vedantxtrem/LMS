import {Router} from 'express';
import { getAllCourses ,getLecturesByCourseID} from '../controllers/course.controller.js'

const Courserouter = new Router();

Courserouter.get('/',getAllCourses);
Courserouter.get('/:id',getLecturesByCourseID);

export default Courserouter;