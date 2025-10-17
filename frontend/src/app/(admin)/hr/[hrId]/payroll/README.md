# Minimal Payroll Page - Frontend & Backend Integration

## Overview
This is a minimal payroll management page that integrates with the SHRM backend payroll system. The page provides essential payroll functionality including:

- View payroll periods
- Display employee payroll records
- Process payroll for active periods
- Generate individual payslips
- Show payroll summary statistics

## Features

### Frontend (`page.tsx`)
- **Clean Interface**: Minimal, responsive design using Tailwind CSS and shadcn/ui components
- **Real-time Data**: Fetches live data from backend APIs
- **Interactive Actions**: Process payroll, refresh data, and generate payslips
- **Error Handling**: Graceful error handling with user-friendly messages
- **Loading States**: Visual feedback during API calls

### Backend Integration
The page integrates with these backend endpoints:

1. **`GET /api/payroll/periods`** - Fetch payroll periods
2. **`GET /api/payroll/employees`** - Fetch employee payroll records
3. **`POST /api/payroll/process`** - Process payroll for a period
4. **`POST /api/payroll/generate-payslip`** - Generate individual payslips

## Key Components

### State Management
```typescript
const [payrollRecords, setPayrollRecords] = useState<EmployeePayroll[]>([]);
const [activePeriod, setActivePeriod] = useState<PayrollPeriod | null>(null);
const [loading, setLoading] = useState(false);
const [processing, setProcessing] = useState(false);
```

### Main Functions
- `fetchPayrollPeriods()`: Gets available payroll periods
- `fetchPayrollRecords()`: Retrieves employee payroll data
- `handleProcessPayroll()`: Processes payroll for the active period
- `handleGeneratePayslip()`: Downloads payslip as JSON file

### Data Display
- **Summary Cards**: Total employees, earnings, deductions, net payroll
- **Employee Table**: Comprehensive view of all employee payroll records
- **Status Badges**: Visual indicators for payroll status

## Usage

### Running the Application
1. **Backend**: Ensure backend server is running on `http://localhost:5000`
2. **Frontend**: Start the Next.js development server
3. **Navigation**: Go to `/hr/{hrId}/payroll` in your browser

### Key Actions
- **Refresh**: Reload payroll data from backend
- **Preview**: Same as refresh (shows current data)
- **Run Payroll**: Process payroll for the active period
- **Payslip**: Generate and download individual payslips

## Data Flow

1. **Page Load**: Fetches payroll periods and identifies active period
2. **Auto-fetch**: Automatically loads payroll records for active period
3. **User Actions**: All actions trigger API calls with proper error handling
4. **Updates**: Data refreshes automatically after successful operations

## Error Handling

- **Network Errors**: Console logging with user alerts
- **No Data States**: Informative empty states with guidance
- **Loading States**: Visual spinners and disabled buttons
- **API Failures**: Fallback error messages

## File Structure
```
frontend/src/app/(admin)/hr/[hrId]/payroll/
├── page.tsx                 # Main payroll page component
```

## Backend Dependencies
- Payroll models: `EmployeePayroll`, `PayrollPeriod`
- Controllers: `payrollController.js`
- Routes: `payrollRoutes.js`
- Authentication: `auth.js` middleware

## Technologies Used
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **HTTP Client**: Axios with custom instance
- **State**: React useState hooks
- **Effects**: React useEffect for lifecycle management

## Next Steps for Enhancement
1. Add real-time updates with WebSocket
2. Implement advanced filtering and search
3. Add export functionality (PDF, Excel)
4. Include payroll analytics and charts
5. Add bulk operations for multiple employees
6. Implement approval workflows

This minimal setup provides a solid foundation for payroll management while remaining simple and maintainable.
