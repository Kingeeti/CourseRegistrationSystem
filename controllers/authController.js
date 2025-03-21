import jwt from "jsonwebtoken"
import User from "../models/user.js"
import Student from "../models/student.js"
import Admin from "../models/admin.js"

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// Student login
const studentLogin = async (req, res) => {
  try {
    const { rollNumber } = req.body

    // Find student by roll number
    const student = await Student.findOne({ rollNumber }).populate("user")

    if (!student) {
      return res.status(401).json({ message: "Invalid roll number" })
    }

    // Generate token
    const token = generateToken(student.user._id)

    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      role: "student",
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user
    const user = await User.findOne({ username })

    if (!user || user.role !== "admin") {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if password matches 
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Find admin profile
    const admin = await Admin.findOne({ user: user._id })

    // Generate token
    const token = generateToken(user._id)

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}

export { studentLogin, adminLogin }

