import express from "express"
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getStudents,
  overrideRegistration,
  getStudentsForCourse,
  getCoursesWithAvailableSeats,
  getStudentsMissingPrerequisites,
} from "../controllers/adminController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = express.Router()

router.get("/courses", protect, admin, getCourses)
router.post("/courses", protect, admin, createCourse)
router.put("/courses/:id", protect, admin, updateCourse)
router.delete("/courses/:id", protect, admin, deleteCourse)

router.get("/students", protect, admin, getStudents)
router.post("/override-registration", protect, admin, overrideRegistration)

// Reports
router.get("/reports/students-for-course/:courseId", protect, admin, getStudentsForCourse)
router.get("/reports/courses-with-seats", protect, admin, getCoursesWithAvailableSeats)
router.get("/reports/students-missing-prerequisites", protect, admin, getStudentsMissingPrerequisites)

export default router

