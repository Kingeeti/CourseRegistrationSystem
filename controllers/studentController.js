import Student from "../models/student.js"
import Course from "../models/course.js"

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate("registeredCourses")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.json(student)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate("prerequisites")
    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Register for a course
const registerCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    if (course.availableSeats <= 0) {
      return res.status(400).json({ message: "No available seats" })
    }

    const student = await Student.findOne({ user: req.user._id })
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check if student is already registered for this course
    if (student.registeredCourses.includes(courseId)) {
      return res.status(400).json({ message: "Already registered for this course" })
    }

    // Check prerequisites
    for (const prereqId of course.prerequisites) {
      if (!student.registeredCourses.includes(prereqId)) {
        const prereq = await Course.findById(prereqId)
        return res.status(400).json({
          message: `Prerequisite not met: ${prereq.courseCode} - ${prereq.title}`,
        })
      }
    }

    // Check for time conflicts
    const studentCourses = await Course.find({ _id: { $in: student.registeredCourses } })

    for (const registeredCourse of studentCourses) {
      for (const registeredSlot of registeredCourse.timeSlots) {
        for (const newSlot of course.timeSlots) {
          if (registeredSlot.day === newSlot.day) {
            const registeredStart = new Date(`1970-01-01T${registeredSlot.startTime}`)
            const registeredEnd = new Date(`1970-01-01T${registeredSlot.endTime}`)
            const newStart = new Date(`1970-01-01T${newSlot.startTime}`)
            const newEnd = new Date(`1970-01-01T${newSlot.endTime}`)

            if (
              (newStart >= registeredStart && newStart < registeredEnd) ||
              (newEnd > registeredStart && newEnd <= registeredEnd) ||
              (newStart <= registeredStart && newEnd >= registeredEnd)
            ) {
              return res.status(400).json({
                message: `Time conflict with ${registeredCourse.courseCode} - ${registeredCourse.title}`,
              })
            }
          }
        }
      }
    }

    // Update course and student
    course.availableSeats -= 1
    course.registeredStudents.push(student._id)
    await course.save()

    student.registeredCourses.push(course._id)
    await student.save()

    res.json({ message: "Course registered successfully", course, student })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Drop a course
const dropCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const student = await Student.findOne({ user: req.user._id })
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Check if student is registered for this course
    if (!student.registeredCourses.includes(courseId)) {
      return res.status(400).json({ message: "Not registered for this course" })
    }

    // Update course and student
    course.availableSeats += 1
    course.registeredStudents = course.registeredStudents.filter((id) => id.toString() !== student._id.toString())
    await course.save()

    student.registeredCourses = student.registeredCourses.filter((id) => id.toString() !== courseId)
    await student.save()

    res.json({ message: "Course dropped successfully", course, student })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

export { getStudentProfile, getCourses, registerCourse, dropCourse }

