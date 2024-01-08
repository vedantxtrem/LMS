import { Router } from "express";
import { signup ,login ,logout , getProfile } from "../controllers/user.controller.js";

const router = Router();

router.post('/Signup',signup);
router.post('/login',login);
router.post('/logout',signup);
router.post('/me',getProfile);


export default router;