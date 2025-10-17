// Sample data creation script for testing payroll without middleware
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { PayrollPeriod } = require('./models/payrollModel');
const User = require('./models/userModel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shrm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createSampleData = async () => {
  try {
    console.log('Creating sample payroll data...');

    // Create sample organization
    const organizationId = 'default-org';

    // Create sample payroll periods
    const periods = [
      {
        month: 7,
        year: 2025,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-31'),
        isActive: false,
        status: 'completed',
        organizationId
      },
      {
        month: 8,
        year: 2025,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-31'),
        isActive: true,
        status: 'current',
        organizationId
      },
      {
        month: 9,
        year: 2025,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-30'),
        isActive: false,
        status: 'upcoming',
        organizationId
      }
    ];

    // Delete existing periods for this organization
    await PayrollPeriod.deleteMany({ organizationId });
    console.log('Deleted existing payroll periods');

    // Create new periods
    const createdPeriods = await PayrollPeriod.insertMany(periods);
    console.log(`Created ${createdPeriods.length} payroll periods`);

    // Create sample employees if they don't exist
    const sampleEmployees = [
      {
        id: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        designation: 'Software Engineer',
        department: 'Engineering',
        joiningDate: new Date('2024-01-15'),
        organizationId
      },
      {
        id: 'EMP002',
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        designation: 'HR Manager',
        department: 'Human Resources',
        joiningDate: new Date('2023-06-10'),
        organizationId
      },
      {
        id: 'EMP003',
        name: 'Mike Johnson',
        email: 'mike.johnson@company.com',
        designation: 'Sales Executive',
        department: 'Sales',
        joiningDate: new Date('2024-03-20'),
        organizationId
      },
      {
        id: 'EMP004',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@company.com',
        designation: 'Designer',
        department: 'Design',
        joiningDate: new Date('2024-02-01'),
        organizationId
      }
    ];

    for (const empData of sampleEmployees) {
      const existingEmployee = await User.findOne({ id: empData.id });
      if (!existingEmployee) {
        const employee = new User(empData);
        await employee.save();
        console.log(`Created employee: ${empData.name}`);
      } else {
        console.log(`Employee ${empData.name} already exists`);
      }
    }

    console.log('Sample data creation completed!');
    console.log('\nTo test the payroll system:');
    console.log('1. GET /api/payroll/periods?organizationId=default-org');
    console.log('2. POST /api/payroll/process with body: { "periodId": "PERIOD_ID", "organizationId": "default-org" }');
    console.log('3. GET /api/payroll/employees?organizationId=default-org');

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleData();
