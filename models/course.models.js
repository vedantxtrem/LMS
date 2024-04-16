import {model , Schema} from 'mongoose';

const courseSchema = new Schema({
    title: {
        type : String,
        required : [true,'title is required'],
        minLength : [5,'Title must be atleast 5 characters'],
        maxLength: [59,'title should be less than 60 characters'],
        trim: true,
        unique: true,
    },
    description:{
        type : String,
        minLength : [8,'Title must be atleast 8 characters'],
        maxLength: [200,'title should be less than 200 characters'],
        trim: true,
    },
    category: {
        type : String,
        required : [true,'category is required'],

    },
    thumbnail:{
        public_id: {
            type: String,
            required: true,
        },
        secure_url:{
            type : String,
            required : true
        }
    },
    lectures: [
        {
            title : String,
            description:String,
            lectures:{
                public_id: {
                    type: String,
                    required : true
                    
                },
                secure_url:{
                    type : String,
                    required : true

                }
            }
        }
    ],
    numbersOfLectures:{
        type: Number,
        default : 0,
    },
    createdBy:{
        type: String,
        required : true
    }
},{
    timestamps: true
})

const Course = model('Course',courseSchema);

export default Course;