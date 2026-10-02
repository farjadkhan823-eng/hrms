const prisma = require('../prisma');
const { todayStr, toDateOnly } = require('../utils/dateUtils');

exports.getStats = async () => {
  const today = toDateOnly(todayStr());
  const isSunday = today.getUTCDay() === 0;

  const totalEmployees = await prisma.employee.count({ where: { role: 'employee' } });
  const activeEmployees = await prisma.employee.count({ where: { role: 'employee', isActive: 'active' } });

  const todayAttendance = await prisma.attendance.findMany({
    where: { date: today, employee: { role: 'employee' } },
    include: { employee: { select: { name: true, department: true } } },
    orderBy: { employeeId: 'asc' },
  });

  const presentToday = todayAttendance.filter((r) => r.checkIn).length;
  const lateToday = todayAttendance.filter((r) => r.punctuality === 'late').length;
  const offToday = todayAttendance.filter((r) => r.punctuality === 'off').length;
  // employees who have not checked in and are not off are counted absent (no absents on Sunday)
  const absentToday = isSunday ? 0 : Math.max(0, activeEmployees - presentToday - offToday);

  const sum = await prisma.employee.aggregate({
    _sum: { salary: true },
    where: { role: 'employee', isActive: 'active' },
  });

  return {
    totalEmployees,
    presentToday,
    absentToday,
    lateToday,
    totalSalary: sum._sum.salary || 0,
    todayAttendance,
  };
};
