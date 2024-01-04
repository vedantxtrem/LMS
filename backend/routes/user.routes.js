import { Router } from "express";

const router = Router();

router.post('/Signup',signup);
router.post('/login',login);
router.post('/logout',signup);
router.post('/me',getProfile);


export default router;