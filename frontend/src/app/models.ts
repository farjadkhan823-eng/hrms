export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  department: string;
  salary: number;
  joiningDate: string;
  isActive: 'active' | 'inactive';
}

export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  punctuality: string;
  offReason: string | null;
  employee?: { id: number; name: string; department: string };
}

export interface SalaryRecord {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  baseSalary: number;
  totalDeductions: number;
  lateDeduction: number;
  absentDeduction: number;
  leaveDeduction: number;
  netSalary: number;
  details: {
    lateCount: number;
    absentCount: number;
    offWithoutLeaveCount: number;
    leaveCount: number;
    extraLeaveCount: number;
  };
  employee?: { name: string; department: string };
}

export interface DashboardData {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  totalSalary: number;
  todayAttendance: Attendance[];
}
