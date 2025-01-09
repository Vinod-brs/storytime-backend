import express from "express";
import { 
    createUser,
    verifyEmail, 
    resendVerifyEmail,
    login,
    generateSpotifyRefreshToken,
    getUserProfile,
    updateUserProfile,
    updatePreferredLanguage,
    updatePassword,
    forgotPassword,
    resetPassword,
    resetPasswordView,
    saveSpotifyStory,
    removeSpotifyStory,
    getSpotifyStories
 } from "../controllers/userController.js";
import { checkToken } from "../middleware/authMiddleware.js";

const router = express.Router();
    
    router.post("/register", createUser);
    router.get("/verifyEmail/:verifyToken", verifyEmail);
    router.get("/resend/:token", resendVerifyEmail);
    router.post("/login", login);
    router.get("/refreshtoken", checkToken, generateSpotifyRefreshToken);
    router.get("/profile", checkToken, getUserProfile);
    router.post("/profile", checkToken, updateUserProfile);
    router.post("/preferredlanguage", checkToken, updatePreferredLanguage);
    router.post("/updatepassword", checkToken, updatePassword);
    router.post("/forgotpassword", forgotPassword);
    router.post("/resetpassword/", resetPassword);
    router.get("/resetpassword/:token", resetPasswordView);
    router.post("/savestory", checkToken, saveSpotifyStory);
    router.post("/removestory", checkToken, removeSpotifyStory);
    router.get("/library", checkToken, getSpotifyStories);

export default router;