document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("userRole")
  
    if (!token || userRole !== "admin") {
      window.location.href = "/"
      return
    }
  
    // Set user info
    document.getElementById("admin-name").textContent = localStorage.getItem("userName")
  
    // Logout button
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      window.location.href = "/"
    })
  
    // Navigation
    const navLinks = document.querySelectorAll(".nav-link")
    const sections = document.querySelectorAll(".admin-section")
  
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
  
        // Remove active class from all links and sections
        navLinks.forEach((l) => l.classList.remove("active"))
        sections.forEach((s) => s.classList.remove("active"))
  
        // Add active class to clicked link and corresponding section
        link.classList.add("active")
        const sectionId = `${link.dataset.section}-section`
        document.getElementById(sectionId).classList.add("active")
      })
    })
  
    // Global variables
    let allCourses = []
    let allStudents = []
  
    // Fetch courses and students
    async function fetchData() {
      try {
        // Fetch courses
        const coursesResponse = await fetch("/api/admin/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses")
        }
  
        allCourses = await coursesResponse.json()
  
        // Fetch students
        const studentsResponse = await fetch("/api/admin/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (!studentsResponse.ok) {
          throw new Error("Failed to fetch students")
        }
  
        allStudents = await studentsResponse.json()
  
        // Render data
        renderCourses()
        renderStudents()
        populateCourseSelect()
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Failed to load data. Please try again.")
      }
    }
  
    // Render courses
    function renderCourses() {
      const coursesList = document.getElementById("admin-courses-list")
      coursesList.innerHTML = ""
  
      if (allCourses.length === 0) {
        coursesList.innerHTML = '<div class="no-results">No courses found</div>'
        return
      }
  
      allCourses.forEach((course) => {
        const courseCard = document.createElement("div")
        courseCard.className = "course-card"
  
        const courseHeader = document.createElement("div")
        courseHeader.className = "course-header"
  
        const courseCode = document.createElement("div")
        courseCode.className = "course-code"
        courseCode.textContent = course.courseCode
  
        const courseSeats = document.createElement("div")
        courseSeats.className = "course-seats"
        courseSeats.textContent = `${course.availableSeats}/${course.totalSeats} seats`
  
        courseHeader.appendChild(courseCode)
        courseHeader.appendChild(courseSeats)
  
        const courseTitle = document.createElement("div")
        courseTitle.className = "course-title"
        courseTitle.textContent = course.title
  
        const courseInfo = document.createElement("div")
        courseInfo.className = "course-info"
        courseInfo.textContent = `${course.department} | ${course.courseLevel} Level | ${course.credits} Credits`
  
        const courseActions = document.createElement("div")
        courseActions.className = "course-actions"
  
        const editBtn = document.createElement("button")
        editBtn.className = "btn btn-outline"
        editBtn.textContent = "Edit"
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation()
          showCourseForm(course)
        })
  
        const deleteBtn = document.createElement("button")
        deleteBtn.className = "btn btn-danger"
        deleteBtn.textContent = "Delete"
        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation()
          if (confirm(`Are you sure you want to delete ${course.courseCode}?`)) {
            try {
              const response = await fetch(`/api/admin/courses/${course._id}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
  
              if (response.ok) {
                alert("Course deleted successfully")
                fetchData() // Refresh data
              } else {
                const data = await response.json()
                alert(data.message || "Failed to delete course")
              }
            } catch (error) {
              console.error("Error:", error)
              alert("An error occurred. Please try again.")
            }
          }
        })
  
        courseActions.appendChild(editBtn)
        courseActions.appendChild(deleteBtn)
  
        courseCard.appendChild(courseHeader)
        courseCard.appendChild(courseTitle)
        courseCard.appendChild(courseInfo)
        courseCard.appendChild(courseActions)
  
        coursesList.appendChild(courseCard)
      })
    }
  
    // Render students
    function renderStudents() {
      const studentsList = document.getElementById("admin-students-list")
      studentsList.innerHTML = ""
  
      if (allStudents.length === 0) {
        studentsList.innerHTML = '<div class="no-results">No students found</div>'
        return
      }
  
      allStudents.forEach((student) => {
        const studentCard = document.createElement("div")
        studentCard.className = "student-card"
  
        const studentName = document.createElement("div")
        studentName.className = "student-name"
        studentName.textContent = student.name
  
        const studentInfo = document.createElement("div")
        studentInfo.className = "student-info"
        studentInfo.textContent = `Roll: ${student.rollNumber} | Email: ${student.email}`
  
        const coursesCount = document.createElement("div")
        coursesCount.className = "courses-count"
        coursesCount.textContent = `${student.registeredCourses.length} courses registered`
  
        studentCard.appendChild(studentName)
        studentCard.appendChild(studentInfo)
        studentCard.appendChild(coursesCount)
  
        studentCard.addEventListener("click", () => {
          showStudentDetails(student)
        })
  
        studentsList.appendChild(studentCard)
      })
    }
  
    // Populate course select for reports
    function populateCourseSelect() {
      const courseSelect = document.getElementById("course-select-for-report")
      courseSelect.innerHTML = '<option value="">Select a Course</option>'
  
      allCourses.forEach((course) => {
        const option = document.createElement("option")
        option.value = course._id
        option.textContent = `${course.courseCode} - ${course.title}`
        courseSelect.appendChild(option)
      })
    }
  
    // Show course form modal
    function showCourseForm(course = null) {
      const modal = document.getElementById("course-form-modal")
      const formTitle = document.getElementById("course-form-title")
      const courseForm = document.getElementById("course-form")
      const courseId = document.getElementById("course-id")
      const courseCode = document.getElementById("course-code")
      const courseTitle = document.getElementById("course-title")
      const courseDepartment = document.getElementById("course-department")
      const courseLevel = document.getElementById("course-level")
      const courseDescription = document.getElementById("course-description")
      const courseCredits = document.getElementById("course-credits")
      const courseSeats = document.getElementById("course-seats")
      const prerequisitesContainer = document.getElementById("prerequisites-container")
      const timeSlotsContainer = document.getElementById("time-slots-container")
  
      // Reset form
      courseForm.reset()
      prerequisitesContainer.innerHTML = ""
      timeSlotsContainer.innerHTML = ""
  
      // Add one empty time slot
      addTimeSlot()
  
      // Populate prerequisites
      allCourses.forEach((c) => {
        if (!course || c._id !== course._id) {
          const checkboxDiv = document.createElement("div")
          checkboxDiv.className = "checkbox-item"
  
          const checkbox = document.createElement("input")
          checkbox.type = "checkbox"
          checkbox.id = `prereq-${c._id}`
          checkbox.name = "prerequisites"
          checkbox.value = c._id
  
          // Check if this course is a prerequisite
          if (course && course.prerequisites.some((p) => p._id === c._id)) {
            checkbox.checked = true
          }
  
          const label = document.createElement("label")
          label.htmlFor = `prereq-${c._id}`
          label.textContent = `${c.courseCode} - ${c.title}`
  
          checkboxDiv.appendChild(checkbox)
          checkboxDiv.appendChild(label)
          prerequisitesContainer.appendChild(checkboxDiv)
        }
      })
  
      // Set form title and values if editing
      if (course) {
        formTitle.textContent = "Edit Course"
        courseId.value = course._id
        courseCode.value = course.courseCode
        courseTitle.value = course.title
        courseDepartment.value = course.department
        courseLevel.value = course.courseLevel
        courseDescription.value = course.description
        courseCredits.value = course.credits
        courseSeats.value = course.totalSeats
  
        // Clear default time slot
        timeSlotsContainer.innerHTML = ""
  
        // Add existing time slots
        course.timeSlots.forEach((slot) => {
          addTimeSlot(slot)
        })
      } else {
        formTitle.textContent = "Add New Course"
        courseId.value = ""
      }
  
      // Show modal
      modal.style.display = "block"
  
      // Close modal
      const closeModal = modal.querySelector(".close-modal")
      closeModal.onclick = () => {
        modal.style.display = "none"
      }
  
      // Cancel button
      document.getElementById("cancel-course-btn").onclick = () => {
        modal.style.display = "none"
      }
  
      // Close modal when clicking outside
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = "none"
        }
      }
    }
  
    // Add time slot to form
    function addTimeSlot(slot = null) {
      const timeSlotsContainer = document.getElementById("time-slots-container")
  
      const timeSlotDiv = document.createElement("div")
      timeSlotDiv.className = "time-slot"
  
      const daySelect = document.createElement("select")
      daySelect.className = "day-select"
      daySelect.required = true
  
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  
      const defaultOption = document.createElement("option")
      defaultOption.value = ""
      defaultOption.textContent = "Select Day"
      daySelect.appendChild(defaultOption)
  
      days.forEach((day) => {
        const option = document.createElement("option")
        option.value = day
        option.textContent = day
        daySelect.appendChild(option)
      })
  
      const startTime = document.createElement("input")
      startTime.type = "time"
      startTime.className = "start-time"
      startTime.required = true
  
      const toSpan = document.createElement("span")
      toSpan.textContent = "to"
  
      const endTime = document.createElement("input")
      endTime.type = "time"
      endTime.className = "end-time"
      endTime.required = true
  
      const removeBtn = document.createElement("button")
      removeBtn.type = "button"
      removeBtn.className = "btn btn-outline remove-slot-btn"
      removeBtn.textContent = "Remove"
      removeBtn.addEventListener("click", () => {
        timeSlotDiv.remove()
      })
  
      // Set values if editing
      if (slot) {
        daySelect.value = slot.day
        startTime.value = slot.startTime
        endTime.value = slot.endTime
      }
  
      timeSlotDiv.appendChild(daySelect)
      timeSlotDiv.appendChild(startTime)
      timeSlotDiv.appendChild(toSpan)
      timeSlotDiv.appendChild(endTime)
      timeSlotDiv.appendChild(removeBtn)
  
      timeSlotsContainer.appendChild(timeSlotDiv)
    }
  
    // Show student details modal
    function showStudentDetails(student) {
      const modal = document.getElementById("student-details-modal")
      const studentName = document.getElementById("student-details-name")
      const studentInfo = document.getElementById("student-details-info")
      const studentCoursesList = document.getElementById("student-courses-list")
      const overrideCourseSelect = document.getElementById("override-course-select")
      const overrideBtn = document.getElementById("override-registration-btn")
  
      studentName.textContent = student.name
      studentInfo.textContent = `Roll: ${student.rollNumber} | Email: ${student.email}`
  
      // Populate registered courses
      studentCoursesList.innerHTML = ""
  
      if (student.registeredCourses.length === 0) {
        studentCoursesList.innerHTML = '<div class="no-courses">No courses registered</div>'
      } else {
        student.registeredCourses.forEach((course) => {
          const courseItem = document.createElement("div")
          courseItem.className = "course-item"
          courseItem.innerHTML = `
            <div><strong>${course.courseCode}</strong> - ${course.title}</div>
            <div>${course.credits} Credits | ${course.department}</div>
          `
          studentCoursesList.appendChild(courseItem)
        })
      }
  
      // Populate override course select
      overrideCourseSelect.innerHTML = '<option value="">Select a Course</option>'
  
      allCourses.forEach((course) => {
        // Skip courses the student is already registered for
        if (!student.registeredCourses.some((c) => c._id === course._id)) {
          const option = document.createElement("option")
          option.value = course._id
          option.textContent = `${course.courseCode} - ${course.title}`
          overrideCourseSelect.appendChild(option)
        }
      })
  
      // Override registration button
      overrideBtn.onclick = async () => {
        const courseId = overrideCourseSelect.value
  
        if (!courseId) {
          alert("Please select a course")
          return
        }
  
        try {
          const response = await fetch("/api/admin/override-registration", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              studentId: student._id,
              courseId,
            }),
          })
  
          const data = await response.json()
  
          if (response.ok) {
            alert("Registration override successful")
            modal.style.display = "none"
            fetchData() // Refresh data
          } else {
            alert(data.message || "Failed to override registration")
          }
        } catch (error) {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        }
      }
  
      // Show modal
      modal.style.display = "block"
  
      // Close modal
      const closeModal = modal.querySelector(".close-modal")
      closeModal.onclick = () => {
        modal.style.display = "none"
      }
  
      // Close modal when clicking outside
      window.onclick = (event) => {
        if (event.target === modal) {
          modal.style.display = "none"
        }
      }
    }
  
    // Course form submission
    document.getElementById("course-form").addEventListener("submit", async (e) => {
      e.preventDefault()
  
      const courseId = document.getElementById("course-id").value
      const courseCode = document.getElementById("course-code").value
      const title = document.getElementById("course-title").value
      const department = document.getElementById("course-department").value
      const courseLevel = document.getElementById("course-level").value
      const description = document.getElementById("course-description").value
      const credits = document.getElementById("course-credits").value
      const totalSeats = document.getElementById("course-seats").value
  
      // Get prerequisites
      const prerequisites = []
      document.querySelectorAll('input[name="prerequisites"]:checked').forEach((checkbox) => {
        prerequisites.push(checkbox.value)
      })
  
      // Get time slots
      const timeSlots = []
      document.querySelectorAll(".time-slot").forEach((slotDiv) => {
        const day = slotDiv.querySelector(".day-select").value
        const startTime = slotDiv.querySelector(".start-time").value
        const endTime = slotDiv.querySelector(".end-time").value
  
        if (day && startTime && endTime) {
          timeSlots.push({ day, startTime, endTime })
        }
      })
  
      const courseData = {
        courseCode,
        title,
        department,
        courseLevel,
        description,
        credits,
        prerequisites,
        timeSlots,
        totalSeats,
      }
  
      try {
        let response
  
        if (courseId) {
          // Update existing course
          response = await fetch(`/api/admin/courses/${courseId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
          })
        } else {
          // Create new course
          response = await fetch("/api/admin/courses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
          })
        }
  
        const data = await response.json()
  
        if (response.ok) {
          alert(courseId ? "Course updated successfully" : "Course created successfully")
          document.getElementById("course-form-modal").style.display = "none"
          fetchData() // Refresh data
        } else {
          alert(data.message || "Failed to save course")
        }
      } catch (error) {
        console.error("Error:", error)
        alert("An error occurred. Please try again.")
      }
    })
  
    // Add time slot button
    document.getElementById("add-slot-btn").addEventListener("click", () => {
      addTimeSlot()
    })
  
    // Add course button
    document.getElementById("add-course-btn").addEventListener("click", () => {
      showCourseForm()
    })
  
    // Generate reports
    document.querySelectorAll(".generate-report-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const reportType = btn.dataset.report
        const resultsContainer = document.getElementById(`${reportType}-results`)
  
        resultsContainer.innerHTML = '<div class="loading">Generating report...</div>'
  
        try {
          let response
  
          switch (reportType) {
            case "available-seats":
              response = await fetch("/api/admin/reports/courses-with-seats", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              break
  
            case "students-for-course":
              const courseId = document.getElementById("course-select-for-report").value
  
              if (!courseId) {
                resultsContainer.innerHTML = '<div class="error">Please select a course</div>'
                return
              }
  
              response = await fetch(`/api/admin/reports/students-for-course/${courseId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              break
  
            case "missing-prerequisites":
              response = await fetch("/api/admin/reports/students-missing-prerequisites", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              break
          }
  
          if (!response.ok) {
            throw new Error("Failed to generate report")
          }
  
          const data = await response.json()
  
          // Render report results
          resultsContainer.innerHTML = ""
  
          if (reportType === "available-seats") {
            if (data.length === 0) {
              resultsContainer.innerHTML = '<div class="no-results">No courses with available seats</div>'
            } else {
              const table = document.createElement("table")
              table.className = "report-table"
  
              table.innerHTML = `
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Title</th>
                    <th>Available Seats</th>
                    <th>Total Seats</th>
                  </tr>
                </thead>
                <tbody>
                  ${data
                    .map(
                      (course) => `
                    <tr>
                      <td>${course.courseCode}</td>
                      <td>${course.title}</td>
                      <td>${course.availableSeats}</td>
                      <td>${course.totalSeats}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              `
  
              resultsContainer.appendChild(table)
            }
          } else if (reportType === "students-for-course") {
            if (data.length === 0) {
              resultsContainer.innerHTML = '<div class="no-results">No students registered for this course</div>'
            } else {
              const table = document.createElement("table")
              table.className = "report-table"
  
              table.innerHTML = `
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  ${data
                    .map(
                      (student) => `
                    <tr>
                      <td>${student.rollNumber}</td>
                      <td>${student.name}</td>
                      <td>${student.email}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              `
  
              resultsContainer.appendChild(table)
            }
          } else if (reportType === "missing-prerequisites") {
            if (data.length === 0) {
              resultsContainer.innerHTML = '<div class="no-results">No students missing prerequisites</div>'
            } else {
              data.forEach((item) => {
                const studentDiv = document.createElement("div")
                studentDiv.className = "student-prereq-item"
  
                studentDiv.innerHTML = `
                  <h4>${item.student.name} (${item.student.rollNumber})</h4>
                  <ul>
                    ${item.missingPrerequisites
                      .map(
                        (missing) => `
                      <li>
                        For <strong>${missing.course.courseCode} - ${missing.course.title}</strong>, 
                        missing prerequisite: <strong>${missing.prerequisite.courseCode} - ${missing.prerequisite.title}</strong>
                      </li>
                    `,
                      )
                      .join("")}
                  </ul>
                `
  
                resultsContainer.appendChild(studentDiv)
              })
            }
          }
        } catch (error) {
          console.error("Error:", error)
          resultsContainer.innerHTML = '<div class="error">Failed to generate report</div>'
        }
      })
    })
  
    // Initial data fetch
    fetchData()
  })
  
  