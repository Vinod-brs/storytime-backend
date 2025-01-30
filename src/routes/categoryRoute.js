import express from "express";

import { getCategories, addCategories, updateCategories, deleteCategories } from "../controllers/categoryController.js";
import { checkToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/", checkToken, getCategories);


//------------------------ ADMIN CONTROLS ------------------------

router.post("/", checkToken, addCategories);
router.put("/", checkToken, updateCategories);
router.delete("/", checkToken, deleteCategories);

export default router;