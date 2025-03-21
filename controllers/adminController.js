import Course from "../models/course.js"
import Student from "../models/student.js"

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate("prerequisites")
    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const createCourse = async (req, res) => {
  try {
    const { courseCode, title, department, courseLevel, description, credits, prerequisites, timeSlots, totalSeats } =
      req.body

    const courseExists = await Course.findOne({ courseCode })
    if (courseExists) {
      return res.status(400).json({ message: "Course already exists" })
    }

    const course = await Course.create({
      courseCode,
      title,
      department,
      courseLevel,
      description,
      credits,
      prerequisites: prerequisites || [],
      timeSlots,
      totalSeats,
      availableSeats: totalSeats,
      registeredStudents: [],
    })

    res.status(201).json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    const { courseCode, title, department, courseLevel, description, credits, prerequisites, timeSlots, totalSeats } =
      req.body

    course.courseCode = courseCode || course.courseCode
    course.title = title || course.title
    course.department = department || course.department
    course.courseLevel = courseLevel || course.courseLevel
    course.description = description || course.description
    course.credits = credits || course.credits
    course.prerequisites = prerequisites || course.prerequisites
    course.timeSlots = timeSlots || course.timeSlots

    if (totalSeats && totalSeats !== course.totalSeats) {
      const seatDifference = totalSeats - course.totalSeats
      course.totalSeats = totalSeats
      course.availableSeats += seatDifference

      if (course.availableSeats < 0) {
        course.availableSeats = 0
      }
    }

    const updatedCourse = await course.save()
    res.json(updatedCourse)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    await Student.updateMany({ registeredCourses: course._id }, { $pull: { registeredCourses: course._id } })

    await course.remove()
    res.json({ message: "Course removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).populate("registeredCourses")
    res.json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const overrideRegistration = async (req, res) => {
  try {
    const { studentId, courseId } = req.body

    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    if (student.registeredCourses.includes(courseId)) {
      return res.status(400).json({ message: "Student already registered for this course" })
    }

    student.registeredCourses.push(courseId)
    await student.save()

    course.registeredStudents.push(studentId)
    if (course.availableSeats > 0) {
      course.availableSeats -= 1
    }
    await course.save()

    res.json({ message: "Registration override successful", student, course })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const getStudentsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params

    const course = await Course.findById(courseId).populate("registeredStudents")

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json(course.registeredStudents)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const getCoursesWithAvailableSeats = async (req, res) => {
  try {
    const courses = await Course.find({ availableSeats: { $gt: 0 } })
    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

const getStudentsMissingPrerequisites = async (req, res) => {
  try {
    const students = await Student.find({}).populate("registeredCourses")
    const courses = await Course.find({}).populate("prerequisites")

    const studentsWithMissingPrereqs = []

    for (const student of students) {
      const missingPrereqs = []

      for (const courseId of student.registeredCourses) {
        const course = courses.find((c) => c._id.toString() === courseId.toString())

        if (course && course.prerequisites.length > 0) {
          for (const prereq of course.prerequisites) {
            if (!student.registeredCourses.some((c) => c.toString() === prereq._id.toString())) {
              missingPrereqs.push({
                course: {
                  _id: course._id,
                  courseCode: course.courseCode,
                  title: course.title,
                },
                prerequisite: {
                  _id: prereq._id,
                  courseCode: prereq.courseCode,
                  title: prereq.title,
                },
              })
            }
          }
        }
      }

      if (missingPrereqs.length > 0) {
        studentsWithMissingPrereqs.push({
          student: {
            _id: student._id,
            name: student.name,
            rollNumber: student.rollNumber,
          },
          missingPrerequisites: missingPrereqs,
        })
      }
    }

    res.json(studentsWithMissingPrereqs)
  } catch (error) {
    console.error(error)  
    res.status(500).json({ message: "Server Error" })
  }
}

export {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getStudents,
  overrideRegistration,
  getStudentsForCourse,
  getCoursesWithAvailableSeats,
  getStudentsMissingPrerequisites,
}

