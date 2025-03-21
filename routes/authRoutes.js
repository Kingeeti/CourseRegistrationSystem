import express from "express"
import { studentLogin, adminLogin } from "../controllers/authController.js"

const router = express.Router()

router.post("/student/login", studentLogin)
router.post("/admin/login", adminLogin)

export default router

