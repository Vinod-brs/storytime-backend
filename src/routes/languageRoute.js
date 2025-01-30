import express from "express";
import { getLanguages, addLanguages, updateLanguages, deleteLanguages } from "../controllers/languageController.js";
import { checkToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getLanguages)


//------------------------ ADMIN CONTROLS ------------------------

router.post("/", checkToken, addLanguages)
router.put("/", checkToken, updateLanguages)
router.delete("/", checkToken, deleteLanguages)

export default router;