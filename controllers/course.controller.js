import path from "path";
import Course from "../models/course.models.js";
import AppError from "../utils/error.util.js";
import cloudnairy from 'cloudinary';
import fs from 'fs/promises'


const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: "All Courses",
            courses,
        });
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};

const getLecturesByCourseID = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);

        if (!course) {
            return next(new AppError("Course not exits", 500));
        }

        res.status(200).json({
            success: true,
            message: "Succesfully get lectures",
            lectures: course.lectures,
        })

    } catch (error) {
        return next(new AppError(error.message, 400));

    }
};
const createCourse = async (req, res, next) => {
    try {
        const { title, description, category, createdBy } = req.body;

        if (!title || !description || !category || !createdBy) {
            return next(new AppError("All fields are mandatory", 400));
        }

        const course = await Course.create({
            title,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: 'dumy',
                secure_url: "dumy"
            }
        });

        if (!course) {
            return next(new AppError("course not created", 400));
        }

        if (req.file) {
            const result = await cloudnairy.v2.uploader.upload(req.file.path, {
                folder: 'lms'
            });
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
            }
            fs.rm(`uploads/${req.file.filename}`);
        }
        await course.save();

        res.status(200).json({
            success: true,
            message: "course created successfully",
            course
        })
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};
const updateCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body,
            },
            {
                runValidators: true
            }
        )

        if (!course) {
            return next(new AppError('course not fetch', 400));
        }

        res.status(200).json({
            success: true,
            message: "course updated succesfully",
            course
        })


    } catch (error) {
        return next(new AppError(error.message, 500));

    }
};
const deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return next(new AppError('course not fetch', 400));
        }
        await course.deleteOne();

        res.status(200).json({
            success: true,
            message: 'course is deleted'
        })


    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const addLectureToCourseById = async (req, res, next) => {
    const { title, description } = req.body;
    const { id } = req.params;

    console.log("Starting addLectureToCourseById...");

    if (!title || !description) {
        return next(new AppError('Title and Description are required', 400));
    }

    let course;
    try {
        course = await Course.findById(id);
        console.log("Course found:", course);
    } catch (error) {
        console.error("Error finding course:", error);
        return next(new AppError('Invalid course id or course not found.', 400));
    }

    if (!course) {
        return next(new AppError('Invalid course id or course not found.', 400));
    }

    let lectureData = { title, description };

    // Run only if user sends a file
    if (req.file) {
        try {
            console.log("Uploading file to Cloudinary...");
            const result = await cloudnairy.v2.uploader.upload(req.file.path, {
                folder: 'lms', // Save files in a folder named lms
                chunk_size: 50000000, // 50 MB size
                resource_type: 'video',
            });
            console.log("File uploaded to Cloudinary:", result);

            // If success
            if (result) {
                // Set the public_id and secure_url in array
                lectureData.public_id = result.public_id;
                lectureData.secure_url = result.secure_url;
            }

            // After successful upload remove the file from local storage
            await fs.unlink(req.file.path);
            console.log("Local file removed:", req.file.filename);
        } catch (error) {
            console.error("Error during file upload or removal:", error);

            // Empty the uploads directory without deleting the uploads directory
            const files = await fs.readdir('uploads/');
            for (const file of files) {
                await fs.unlink(path.join('uploads/', file));
            }

            // Send the error message
            return next(
                new AppError(
                    error.message || 'File not uploaded, please try again',
                    400
                )
            );
        }
    } else {
        // Ensure lectureData has empty values for these fields if no file is uploaded
        lectureData.public_id = '';
        lectureData.secure_url = '';
    }

    // Add the lecture to the course
    course.lectures.push(lectureData);

    try {
        await course.save();
        console.log("Lecture added and course saved.");

        res.status(200).json({
            success: true,
            message: 'Lecture added successfully',
            course,
        });
    } catch (error) {
        console.error("Error saving course:", error);
        return next(new AppError('Failed to save the course', 500));
    }

    console.log("addLectureToCourseById completed.");
};
const removeLectureFromCourse = async (req, res, next) => {
    // Grabbing the courseId and lectureId from req.query
    const { courseId, lectureId } = req.query;

    console.log(courseId);

    // Checking if both courseId and lectureId are present
    if (!courseId) {
        return next(new AppError('Course ID is required', 400));
    }

    if (!lectureId) {
        return next(new AppError('Lecture ID is required', 400));
    }

    // Find the course uding the courseId
    const course = await Course.findById(courseId);

    // If no course send custom message
    if (!course) {
        return next(new AppError('Invalid ID or Course does not exist.', 404));
    }

    // Find the index of the lecture using the lectureId
    const lectureIndex = course.lectures.findIndex(
        (lecture) => lecture._id.toString() === lectureId.toString()
    );

    // If returned index is -1 then send error as mentioned below
    if (lectureIndex === -1) {
        return next(new AppError('Lecture does not exist.', 404));
    }

    // Delete the lecture from cloudinary
    await cloudnairy.v2.uploader.destroy(
        course.lectures[lectureIndex].public_id,
        {
            resource_type: 'video',
        }
    );

    // Remove the lecture from the array
    course.lectures.splice(lectureIndex, 1);

    // update the number of lectures based on lectres array length
    course.numbersOfLectures = course.lectures.length;

    // Save the course object
    await course.save();

    // Return response
    res.status(200).json({
        success: true,
        message: 'Course lecture removed successfully',
    });
};


export {
    getAllCourses,
    getLecturesByCourseID,
    createCourse,
    updateCourse,
    deleteCourse,
    addLectureToCourseById,
    removeLectureFromCourse
}