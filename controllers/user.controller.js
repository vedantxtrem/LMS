
import User from "../models/user.models.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import crypto from 'crypto'
import sendEmail from "../utils/sendEmail.js";

const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000,// 7days
    httpOnly: true,
    secure: process.env.NODE_ENV
}

const register = async (req, res, next) => {

    const { fullName, email, password  } = req.body;

    if (!fullName || !email || !password) {
        return next(new AppError('All field are required', 400));
    }
    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('Email already exits', 400));
    }
    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://images.pexels.com/photos/998641/pexels-photo-998641.jpeg'
        }
    })
    if (!user) {
        return next(new AppError('user registration failed,try agin', 400));
    }
    //todo file upload;
   
    console.log('file details : ', req.file);
    if(req.file){
        
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder : "lms",
                width : 250,
                height : 250,
                gravity: 'faces',
                crop : 'fill'
            })
            if(result){
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                fs.rm(`uploads/${req.file.filename}`)
            }
        } catch (error) {
            return next(
                new AppError(error || 'File not upload try again',500)
            )
        }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOption)

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    })
}

const login = async (req, res, next) => {
    try {
       // Destructuring the necessary data from req object
  const { email, password } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!email || !password) {
    return next(new AppError('Email and Password are required', 400));
  }

  // Finding the user with the sent email
  const user = await User.findOne({ email }).select('+password');

  // If no user or sent password do not match then send generic response
  if (!(user && (await user.comparePassword(password)))) {
    return next(
      new AppError('Email or Password do not match or user does not exist', 401)
    );
  }

  // Generating a JWT token
  const token = await user.generateJWTToken();

  // Setting the password to undefined so it does not get sent in the response
  user.password = undefined;

  // Setting the token in the cookie with name token along with cookieOptions
  res.cookie('token', token, cookieOption);

  // If all good send the response to the frontend
  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    user,
  });
    } catch (error) {
        return next(new AppError(error.message,500));
    }
    
}

const logout = (req, res) => {
    res.cookie('token',null,{
        secure : true,
        maxAge : 0,
        httpOnly: true
    })
    res.status(200).json({
        success:true,
        message:"user logged out successfully"
    })
}

const getProfile = async (req, res) => {
    try {
        const userID = req.user.id;
        const user = await User.findById(userID);

        res.status(200).json({
            success: true,
            message: 'User details',
            user
        })
    } catch (error) {
        return next(new AppError('failed to fetch userdetail',500))
    }
}

const forgotPassword = async(req,res,next)=>{
    const {email} = req.body;
    if(!email){
        return next(new AppError('Email is required',400));
    }
    const user = await User.findOne({email});
    if(!user){
        return next(new AppError('Email not registered',400));
    }
    const resetToken = await user.generatePasswordResetToken();

    await user.save();

    const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    const subject = 'Forgot password'
    const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank"> Reset your password</a>`
    try{
        await sendEmail(email,subject,message);
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email}`
        })
    }catch(e){
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save();
        return next(new AppError(e.message,500))
    }

}

const resetPassword = async (req, res, next) => {
    // Extracting resetToken from req.params object
    const { resetToken } = req.params;
  
    // Extracting password from req.body object
    const { password } = req.body;
  
    // We are again hashing the resetToken using sha256 since we have stored our resetToken in DB using the same algorithm
    const forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
  
    // Check if password is not there then send response saying password is required
    if (!password) {
      return next(new AppError('Password is required', 400));
    }
  
    console.log(forgotPasswordToken);
  
    // Checking if token matches in DB and if it is still valid(Not expired)
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() }, // $gt will help us check for greater than value, with this we can check if token is valid or expired
    });
  
    // If not found or expired send the response
    if (!user) {
      return next(
        new AppError('Token is invalid or expired, please try again', 400)
      );
    }
  
    // Update the password if token is valid and not expired
    user.password = password;
  
    // making forgotPassword* valus undefined in the DB
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
  
    // Saving the updated user values
    await user.save();
  
    // Sending the response when everything goes good
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  };
  
  /**
   * @CHANGE_PASSWORD
   * @ROUTE @POST {{URL}}/api/v1/user/change-password
   * @ACCESS Private (Logged in users only)
   */
  const changePassword = async (req, res, next) => {
    // Destructuring the necessary data from the req object
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user; // because of the middleware isLoggedIn
  
    // Check if the values are there or not
    if (!oldPassword || !newPassword) {
      return next(
        new AppError('Old password and new password are required', 400)
      );
    }
  
    // Finding the user by ID and selecting the password
    const user = await User.findById(id).select('+password');
  
    // If no user then throw an error message
    if (!user) {
      return next(new AppError('Invalid user id or user does not exist', 400));
    }
  
    // Check if the old password is correct
    const isPasswordValid = await user.comparePassword(oldPassword);
  
    // If the old password is not valid then throw an error message
    if (!isPasswordValid) {
      return next(new AppError('Invalid old password', 400));
    }
  
    // Setting the new password
    user.password = newPassword;
  
    // Save the data in DB
    await user.save();
  
    // Setting the password undefined so that it won't get sent in the response
    user.password = undefined;
  
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  };
  
  /**
   * @UPDATE_USER
   * @ROUTE @POST {{URL}}/api/v1/user/update/:id
   * @ACCESS Private (Logged in user only)
   */
  const updateUser = async (req, res, next) => {
    // Destructuring the necessary data from the req object
    const { fullName } = req.body;
    const { id } = req.params;
  
    const user = await User.findById(id);
  
    if (!user) {
      return next(new AppError('Invalid user id or user does not exist'));
    }
  
    if (fullName) {
      user.fullName = fullName;
    }
  
    // Run only if user sends a file
    if (req.file) {
      // Deletes the old image uploaded by the user
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: 'lms', // Save files in a folder named lms
          width: 250,
          height: 250,
          gravity: 'faces', // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
          crop: 'fill',
        });
  
        // If success
        if (result) {
          // Set the public_id and secure_url in DB
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
  
          // After successful upload remove the file from local storage
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          new AppError(error || 'File not uploaded, please try again', 400)
        );
      }
    }
  
    // Save the user object
    await user.save();
  
    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
    });
  };

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    updateUser,
    changePassword
}