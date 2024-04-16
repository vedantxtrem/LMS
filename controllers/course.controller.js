import Course from "../models/course.models.js";
import AppError from "../utils/error.util.js";

const getAllCourses = async (req,res,next)=>{
    try {
        const course = await Course.find({}).select('-lectures');

        

        res.status(200).json({
            success : true,
            message : "All Courses",
            course,
        }); 
    } catch (error) {
        return next(new AppError(error.message,400));
    }
};

const getLecturesByCourseID = async (req,res,next)=>{
    try {
        const {id } = req.params;
        const course = await Course.findById(id);

        if(!course){
            return next(new AppError("Course not exits",500));
        }
        
        res.status(200).json({
            success: true,
            message : "Succesfully get lectures",
            lectures: course.lectures,
        })
        
    } catch (error) {
        return next(new AppError(error.message,400));
        
    }
};

export {
    getAllCourses,
    getLecturesByCourseID
}