Course Registration System
Project Overview
This project is a Course Registration System designed for both students and administrators.

Students can log in, browse available courses, register for courses, and manage their schedules.
Administrators can log in, add or remove courses, manage seat availability, and generate reports.
The system is built using Node.js, Express.js, MongoDB, and JavaScript for the backend, with a frontend using HTML, CSS, and JavaScript.

Features

Student Features:
Login: Students log in using their roll number (pre-existing in the database).
Course Registration: Students can register for courses if seats are available.
Real-Time Seat Availability: The system updates seat availability dynamically.
Interactive Weekly Calendar: Students can view their schedules and avoid conflicts.
Course Filtering: Students can filter courses by department, time, days, and seat availability.
Prerequisite Checking: The system verifies prerequisites before allowing registration.
Session Persistence: Students' course selections persist throughout their session.

Admin Features:
Login: Admins log in using a username and password.
Course Management: Admins can add, update, or delete courses and set prerequisites.
Student Management: Admins can view and override student registrations if necessary.
Seat Management: Admins can adjust available seats for courses.
Reports: Generate reports for registered students, available courses, and prerequisite completion.

Technology Stack
Backend:
Node.js - JavaScript runtime
Express.js - Backend framework
MongoDB - NoSQL database
Mongoose - MongoDB ORM
JWT (JSON Web Token) - Authentication
dotenv - Environment variable management

Frontend:
HTML, CSS, JavaScript - UI and interactivity
Fetch API - Handles API requests
LocalStorage - Stores session data

Installation & Setup
1. Clone the Repository
Download the project files from the repository using Git and navigate into the project directory.

2. Install Dependencies
Run npm install to install the required packages and dependencies.

3. Set Up Environment Variables
Create a .env file in the root directory and add the necessary configurations, including the MongoDB connection string, JWT secret key, and server port. If using MongoDB Atlas, replace the local connection string with the Atlas connection string.

4. Start the MongoDB Server
Ensure MongoDB is running before starting the application. If using a local MongoDB instance, start it using mongod. If using MongoDB Atlas, confirm that the connection string in the .env file is correct.

5. Run the Server
Start the backend server using node server.js. For development mode with automatic restarts, use nodemon server.js after installing nodemon globally.

6. Access the Application
Once the server is running, open http://localhost:5000 in a web browser to access the application.

