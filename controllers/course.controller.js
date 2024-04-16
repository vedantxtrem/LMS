import Course from "../models/course.models.js";
import AppError from "../utils/error.util.js";
import cloudnairy from 'cloudinary';
import fs from 'fs/promises'

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
const createCourse = async(req,res,next)=>{
   try {
    const {title,description,category,createdBy} = req.body;

    if(!title || !description || !category || !createdBy){
        return next(new AppError("All fields are mandatory",400));
    }

    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail:{
            public_id: 'dumy',
            secure_url: "dumy"
        }
    });

    if(!course){
        return next(new AppError("course not created",400));
    }

    if(req.file){
        const result = await cloudnairy.v2.uploader.upload(req.file.path,{
            folder:'lms'
        });
        if(result){
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
    }
    await course.save();

    res.status(200).json({
        success: true,
        message : "course created successfully",
        course
    })
   } catch (error) {
    return next(new AppError(error.message,500));
   }
};
const updateCourse = async (req,res,next)=>{
    try {
        const {id} = req.params;

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set : req.body,
            },
            {
                runValidators : true
            }
        )

        if(!course){
            return next(new AppError('course not fetch',400));
        }

        res.status(200).json({
            success : true,
            message : "course updated succesfully",
            course
        })

        
    } catch (error) {
    return next(new AppError(error.message,500));
        
    }
};
const deleteCourse = async (req,res,next)=>{
    try {
        const {id} = req.params;

        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('course not fetch',400));
        }
        await course.deleteOne();

        res.status(200).json({
            success : true,
            message : 'course is deleted'
        })

        
    } catch (error) {
        return next(new AppError(error.message,500));    
    }
};

const addLectureToCourseById = async(req,res,next)=>{
    try {

        const {title,description} = req.body;
        const {id} = req.params;

        if(!title || !description ){
            return next(new AppError("All fields are mandatory",400));
        }

        const course = await Course.findById(id);
        if(!course){
            return next(new AppError('course not fetch',400));
        }

        const lectureData = {
            title,
            description,
            lectures : {
                public_id: 'dumy',
                secure_url: "dumy"
            }
        }

        if(req.file){
            try{
            const result = await cloudnairy.v2.uploader.upload(req.file.path,{
                folder:'lms'
            });
            if(result){
                lectureData.lectures.public_id = result.public_id;
                lectureData.lectures.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
            }catch(e){
                next(
                    new AppError(e.message,500)
                )
            }
        }

        course.lectures.push(lectureData);
        course.numbersOfLectures = course.lectures.length;
        await course.save();

        res.status(200).json({
            success: true,
            message : "lectures added",
            course
        })

        
    } catch (error) {
        return next(new AppError(error.message,500));    
    }
}

export {
    getAllCourses,
    getLecturesByCourseID,
    createCourse,
    updateCourse,
    deleteCourse,
    addLectureToCourseById
}