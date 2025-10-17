# SHRM - Strategic Human Resource Management System

A comprehensive full-stack Human Resource Management System built with Next.js, Express.js, and MongoDB. This application provides end-to-end HR management capabilities including employee management, project tracking, attendance monitoring, payroll processing, and organizational hierarchy management.

## 🚀 Features Overview

### 🏢 **Core HR Management**
- **Employee Management**: Complete employee lifecycle management with detailed profiles
- **Department Management**: Organize employees into departments with hierarchical structure
- **Organization Management**: Multi-organization support with role-based access
- **User Authentication**: Secure login/logout with role-based permissions

### 📊 **Dashboard & Analytics**
- **Admin Dashboard**: Comprehensive overview with key metrics and charts
- **Real-time Statistics**: Employee count, active projects, department metrics
- **Interactive Charts**: Attendance trends, project status distribution, performance metrics
- **Data Visualization**: Monthly performance tracking with responsive charts

### 👥 **Employee & Workforce Management**
- **Employee Profiles**: Detailed employee information with contact details, documents
- **Role Management**: Manager, Employee, Intern, Head, Admin role assignments
- **Hierarchy Management**: Organizational structure with manager-subordinate relationships
- **Member Directory**: Searchable employee directory with filtering options

### 📋 **Project Management**
- **Project Creation & Tracking**: Full project lifecycle management
- **Team Assignment**: Assign employees, managers, and interns to projects
- **Progress Monitoring**: Track completion percentage and project status
- **Client Management**: Associate projects with clients and manage requirements
- **Department Integration**: Link projects with relevant departments

### ⏰ **Attendance & Time Tracking**
- **Punch In/Out System**: Digital attendance tracking with timestamps
- **Break Management**: Track different types of breaks (lunch, short breaks)
- **Attendance Analytics**: Generate attendance reports and trends
- **Real-time Status**: Monitor who's currently active/present

### 💰 **Payroll & Financial Management**
- **Payroll Processing**: Automated payroll calculations and adjustments
- **Salary Management**: Individual salary tracking and modifications
- **Budget Tracking**: Department-wise budget allocation and monitoring
- **Financial Reporting**: Generate payroll reports and financial summaries

### 📧 **Communication & Notifications**
- **Email System**: Internal messaging and communication
- **Notification Management**: System-wide notifications and alerts
- **Mail Integration**: Send automated emails for various HR processes

### 🎯 **Task & Performance Management**
- **Task Assignment**: Create and assign tasks to team members
- **Task Responses**: Track task completion and feedback
- **Performance Metrics**: Monitor individual and team performance
- **Productivity Tracking**: Analyze work patterns and efficiency

### 📊 **Reporting & Data Management**
- **Comprehensive Reports**: Generate various HR reports
- **Data Export**: Export data in multiple formats
- **Data Synchronization**: Keep data consistent across modules
- **File Management**: Upload and manage employee documents

### 🔍 **Recruitment & Onboarding**
- **Candidate Management**: Track recruitment process
- **Application Processing**: Handle job applications and interviews
- **Onboarding Workflows**: Streamlined new employee onboarding

## 🛠 Tech Stack

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom JWT-based authentication
- **File Upload**: Cloudinary integration
- **Email**: Nodemailer for email services
- **Environment**: dotenv for configuration

### **Database Schema**
- **Users**: Employee profiles and authentication
- **Organizations**: Multi-tenant organization management
- **Departments**: Department structure and hierarchy
- **Projects**: Project management and tracking
- **Attendance**: Time tracking and attendance records
- **Tasks**: Task management and responses
- **Payroll**: Salary and payroll processing
- **Notifications**: System notifications and alerts

## 📁 Project Structure

```
shrm/
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/
│   │   │   │   └── admin/
│   │   │   │       └── IT/           # Admin Dashboard Routes
│   │   │   │           ├── overview/    # Dashboard
│   │   │   │           ├── departments/ # Department Management
│   │   │   │           ├── projects/    # Project Management
│   │   │   │           ├── members/     # Employee Management
│   │   │   │           ├── hierarchy/   # Org Hierarchy
│   │   │   │           ├── task/        # Task Management
│   │   │   │           └── emails/      # Email System
│   │   │   └── globals.css
│   │   ├── components/       # Reusable UI Components
│   │   ├── lib/             # Utilities and Configurations
│   │   └── types/           # TypeScript Type Definitions
│   ├── public/              # Static Assets
│   └── package.json
│
└── backend/                 # Express.js Backend API
    ├── config/              # Database and Service Configurations
    │   ├── database.js      # MongoDB Connection
    │   ├── cloudinary.js    # File Upload Configuration
    │   └── mailer.js        # Email Service Configuration
    ├── controllers/         # API Route Handlers
    │   ├── authController.js
    │   ├── employeeController.js
    │   ├── departmentController.js
    │   ├── projectController.js
    │   ├── attendanceController.js
    │   ├── payrollController.js
    │   └── [other controllers]
    ├── models/              # MongoDB Data Models
    │   ├── userModel.js
    │   ├── departmentModel.js
    │   ├── projectModel.js
    │   ├── attendanceModel.js
    │   └── [other models]
    ├── routes/              # API Route Definitions
    ├── middleware/          # Custom Middleware
    ├── services/           # Business Logic Services
    └── server.js           # Application Entry Point
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/Vanshahuja1/shrm.git
cd shrm
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file with the following variables:
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Start the backend server
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install

# Start the development server
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

## 📊 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### **Employee Management**
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### **Department Management**
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department
- `GET /api/departments/:id` - Get department by ID
- `PUT /api/departments/:id` - Update department
- `GET /api/departments/org/:orgId` - Get departments by organization

### **Project Management**
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### **Attendance System**
- `GET /api/attendance/hr/:hrId` - Get today's attendance
- `GET /api/attendance/employee/:id` - Get employee attendance
- `POST /api/attendance/punch-in/:id` - Employee punch in
- `POST /api/attendance/punch-out/:id` - Employee punch out

### **Payroll Management**
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll
- `PUT /api/payroll/:id` - Update payroll
- `GET /api/payroll/employee/:id` - Get employee payroll

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different access levels for different roles
- **Data Validation**: Server-side input validation and sanitization
- **CORS Protection**: Cross-origin request security
- **Environment Variables**: Sensitive data protection
- **Password Hashing**: Secure password storage with bcrypt

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Theme**: Consistent color scheme
- **Interactive Charts**: Dynamic data visualization
- **Smooth Animations**: Framer Motion animations
- **Loading States**: User feedback during data loading
- **Error Handling**: Graceful error handling and user feedback
- **Search & Filtering**: Advanced search and filter capabilities

## 📱 Mobile Responsiveness

- Fully responsive design that works on all device sizes
- Mobile-optimized sidebar navigation
- Touch-friendly interface elements
- Optimized charts and tables for mobile viewing

## 🔄 Data Flow

1. **Authentication**: Users authenticate through JWT tokens
2. **Role-Based Routing**: Different interfaces based on user roles
3. **Real-time Updates**: Live data updates across the application
4. **Data Synchronization**: Consistent data across all modules
5. **Error Handling**: Comprehensive error handling and recovery

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
npm run build
# Deploy to Vercel or your preferred platform
```

### **Backend (Railway/Render)**
```bash
# Set environment variables in your deployment platform
# Deploy using Git integration or manual deployment
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

