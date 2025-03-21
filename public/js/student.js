document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("userRole")
  
    if (!token || userRole !== "student") {
      window.location.href = "/"
      return
    }
  
    // Set user info
    document.getElementById("student-name").textContent = localStorage.getItem("userName")
    document.getElementById("student-roll").textContent = `Roll: ${localStorage.getItem("userRollNumber")}`
  
    // Logout button
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userName")
      localStorage.removeItem("userRollNumber")
      window.location.href = "/"
    })
  
    // Tab switching
    const tabBtns = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach((b) => b.classList.remove("active"))
        tabContents.forEach((c) => c.classList.remove("active"))
  
        // Add active class to clicked button and corresponding content
        btn.classList.add("active")
        const tabId = `${btn.dataset.tab}-tab`
        document.getElementById(tabId).classList.add("active")
      })
    })
  
    // Global variables
    let allCourses = []
    let registeredCourses = []
    const departments = new Set()
  
    // Fetch student profile and courses
    async function fetchData() {
      try {
        // Fetch student profile
        const profileResponse = await fetch("/api/student/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile")
        }
  
        const profileData = await profileResponse.json()
        registeredCourses = profileData.registeredCourses
  
        // Fetch all courses
        const coursesResponse = await fetch("/api/student/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
  
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses")
        }
  
        const coursesData = await coursesResponse.json()
        allCourses = coursesData
  
        // Extract departments for filter
        allCourses.forEach((course) => {
          departments.add(course.department)
        })
  
        // Populate department filter
        const departmentFilter = document.getElementById("department-filter")
        departments.forEach((dept) => {
          const option = document.createElement("option")
          option.value = dept
          option.textContent = dept
          departmentFilter.appendChild(option)
        })
  
        // Render courses and schedule
        renderAvailableCourses()
        renderSchedule()
      } catch (error) {
        console.error("Error fetching data:", error)
        alert("Failed to load data. Please try again.")
      }
    }
  
    // Render available courses
    function renderAvailableCourses() {
      const coursesContainer = document.getElementById("available-courses-list")
      coursesContainer.innerHTML = ""
  
      // Apply filters
      const departmentFilter = document.getElementById("department-filter").value
      const levelFilter = document.getElementById("level-filter").value
      const dayFilter = document.getElementById("day-filter").value
      const timeFilter = document.getElementById("time-filter").value
      const seatsFilter = document.getElementById("seats-filter").value
  
      const filteredCourses = allCourses.filter((course) => {
        // Department filter
        if (departmentFilter && course.department !== departmentFilter) {
          return false
        }
  
        // Level filter
        if (levelFilter && course.courseLevel != levelFilter) {
          return false
        }
  
        // Day filter
        if (dayFilter && !course.timeSlots.some((slot) => slot.day === dayFilter)) {
          return false
        }
  
        // Time filter
        if (timeFilter) {
          const hasMatchingTime = course.timeSlots.some((slot) => {
            const startTime = new Date(`1970-01-01T${slot.startTime}`)
            const startHour = startTime.getHours()
  
            if (timeFilter === "morning" && startHour >= 8 && startHour < 12) {
              return true
            } else if (timeFilter === "afternoon" && startHour >= 12 && startHour < 17) {
              return true
            } else if (timeFilter === "evening" && startHour >= 17 && startHour < 21) {
              return true
            }
            return false
          })
  
          if (!hasMatchingTime) {
            return false
          }
        }
  
        // Seats filter
        if (seatsFilter === "available" && course.availableSeats <= 0) {
          return false
        }
  
        return true
      })
  
      if (filteredCourses.length === 0) {
        coursesContainer.innerHTML = '<div class="no-results">No courses match your filters</div>'
        return
      }
  
      filteredCourses.forEach((course) => {
        const isRegistered = registeredCourses.some((c) => c._id === course._id)
  
        const courseCard = document.createElement("div")
        courseCard.className = "course-card"
        courseCard.dataset.id = course._id
  
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
  
        const courseTime = document.createElement("div")
        courseTime.className = "course-time"
        courseTime.textContent = course.timeSlots
          .map((slot) => `${slot.day} ${slot.startTime.substring(0, 5)}-${slot.endTime.substring(0, 5)}`)
          .join(", ")
  
        courseCard.appendChild(courseHeader)
        courseCard.appendChild(courseTitle)
        courseCard.appendChild(courseInfo)
        courseCard.appendChild(courseTime)
  
        if (isRegistered) {
          courseCard.classList.add("registered")
          const registeredBadge = document.createElement("div")
          registeredBadge.className = "registered-badge"
          registeredBadge.textContent = "Registered"
          courseCard.appendChild(registeredBadge)
        }
  
        courseCard.addEventListener("click", () => {
          showCourseDetails(course, isRegistered)
        })
  
        coursesContainer.appendChild(courseCard)
      })
    }
  
    // Render weekly schedule
    function renderSchedule() {
      // Clear all day slots
      document.getElementById("monday-slots").innerHTML = ""
      document.getElementById("tuesday-slots").innerHTML = ""
      document.getElementById("wednesday-slots").innerHTML = ""
      document.getElementById("thursday-slots").innerHTML = ""
      document.getElementById("friday-slots").innerHTML = ""
  
      // Clear registered courses list
      const registeredCoursesList = document.getElementById("registered-courses-list")
      registeredCoursesList.innerHTML = "<h3>Registered Courses</h3>"
  
      if (registeredCourses.length === 0) {
        const noCourses = document.createElement("div")
        noCourses.className = "no-courses"
        noCourses.textContent = "No courses registered yet"
        registeredCoursesList.appendChild(noCourses)
        return
      }
  
      // Create a map to check for time conflicts
      const timeSlotMap = {}
  
      registeredCourses.forEach((course) => {
        // Add to registered courses list
        const courseItem = document.createElement("div")
        courseItem.className = "registered-course-item"
        courseItem.innerHTML = `
          <div><strong>${course.courseCode}</strong> - ${course.title}</div>
          <div>${course.credits} Credits | ${course.department}</div>
        `
        courseItem.addEventListener("click", () => {
          showCourseDetails(course, true)
        })
        registeredCoursesList.appendChild(courseItem)
  
        // Add to weekly calendar
        course.timeSlots.forEach((slot) => {
          const dayId = slot.day.toLowerCase()
          const daySlots = document.getElementById(`${dayId}-slots`)
  
          const startTime = new Date(`1970-01-01T${slot.startTime}`)
          const endTime = new Date(`1970-01-01T${slot.endTime}`)
  
          const startHour = startTime.getHours()
          const startMinute = startTime.getMinutes()
          const durationMinutes = (endTime - startTime) / (1000 * 60)
  
          const top = (startHour - 8) * 60 + startMinute
          const height = durationMinutes
  
          // Check for conflicts
          const timeKey = `${dayId}-${top}-${height}`
          let hasConflict = false
  
          if (timeSlotMap[timeKey]) {
            hasConflict = true
          } else {
            timeSlotMap[timeKey] = course._id
          }
  
          const courseSlot = document.createElement("div")
          courseSlot.className = `course-slot ${hasConflict ? "course-slot-conflict" : ""}`
          courseSlot.style.top = `${top}px`
          courseSlot.style.height = `${height}px`
          courseSlot.innerHTML = `
            <div class="slot-course-code">${course.courseCode}</div>
            <div class="slot-course-title">${course.title}</div>
          `
  
          courseSlot.addEventListener("click", () => {
            showCourseDetails(course, true)
          })
  
          daySlots.appendChild(courseSlot)
        })
      })
    }
  
    // Show course details in modal
    function showCourseDetails(course, isRegistered) {
      const modal = document.getElementById("course-details-modal")
      const modalTitle = document.getElementById("modal-course-title")
      const modalDetails = document.getElementById("modal-course-details")
      const registerBtn = document.getElementById("register-course-btn")
      const dropBtn = document.getElementById("drop-course-btn")
  
      modalTitle.textContent = `${course.courseCode} - ${course.title}`
  
      // Format prerequisites
      let prerequisitesText = "None"
      if (course.prerequisites && course.prerequisites.length > 0) {
        prerequisitesText = course.prerequisites.map((prereq) => `${prereq.courseCode} - ${prereq.title}`).join("<br>")
      }
  
      modalDetails.innerHTML = `
        <p><strong>Department:</strong> ${course.department}</p>
        <p><strong>Level:</strong> ${course.courseLevel}</p>
        <p><strong>Credits:</strong> ${course.credits}</p>
        <p><strong>Available Seats:</strong> ${course.availableSeats}/${course.totalSeats}</p>
        <p><strong>Description:</strong> ${course.description}</p>
        <p><strong>Prerequisites:</strong><br>${prerequisitesText}</p>
        <p><strong>Schedule:</strong><br>
          ${course.timeSlots
            .map((slot) => `${slot.day} ${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`)
            .join("<br>")}
        </p>
      `
  
      // Show/hide appropriate buttons
      if (isRegistered) {
        registerBtn.style.display = "none"
        dropBtn.style.display = "block"
      } else {
        registerBtn.style.display = "block"
        dropBtn.style.display = "none"
      }
  
      // Register button event
      registerBtn.onclick = async () => {
        try {
          const response = await fetch("/api/student/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId: course._id }),
          })
  
          const data = await response.json()
  
          if (response.ok) {
            alert("Course registered successfully")
            modal.style.display = "none"
            fetchData() // Refresh data
          } else {
            alert(data.message || "Failed to register for course")
          }
        } catch (error) {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        }
      }
  
      // Drop button event
      dropBtn.onclick = async () => {
        try {
          const response = await fetch("/api/student/drop", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId: course._id }),
          })
  
          const data = await response.json()
  
          if (response.ok) {
            alert("Course dropped successfully")
            modal.style.display = "none"
            fetchData() // Refresh data
          } else {
            alert(data.message || "Failed to drop course")
          }
        } catch (error) {
          console.error("Error:", error)
          alert("An error occurred. Please try again.")
        }
      }
  
      // Show modal
      modal.style.display = "block"
  
      // Close modal
      const closeModal = document.querySelector(".close-modal")
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
  
    // Filter events
    document.getElementById("department-filter").addEventListener("change", renderAvailableCourses)
    document.getElementById("level-filter").addEventListener("change", renderAvailableCourses)
    document.getElementById("day-filter").addEventListener("change", renderAvailableCourses)
    document.getElementById("time-filter").addEventListener("change", renderAvailableCourses)
    document.getElementById("seats-filter").addEventListener("change", renderAvailableCourses)
  
    // Reset filters
    document.getElementById("reset-filters-btn").addEventListener("click", () => {
      document.getElementById("department-filter").value = ""
      document.getElementById("level-filter").value = ""
      document.getElementById("day-filter").value = ""
      document.getElementById("time-filter").value = ""
      document.getElementById("seats-filter").value = ""
      renderAvailableCourses()
    })
  
    // Initial data fetch
    fetchData()
  })
  
  