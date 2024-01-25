import { Router } from "express";
import { signup ,login ,logout, getProfile } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.post('/Signup',upload.single("avatar"),signup);
router.post('/login',login);
router.post('/logout',logout);
router.post('/me',isLoggedIn,getProfile);


export default router;