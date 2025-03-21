import express from "express"
import { getStudentProfile, getCourses, registerCourse, dropCourse } from "../controllers/studentController.js"
import { protect, student } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/profile", protect, student, getStudentProfile)
router.get("/courses", protect, student, getCourses)
router.post("/register", protect, student, registerCourse)
router.post("/drop", protect, student, dropCourse)

export default router

