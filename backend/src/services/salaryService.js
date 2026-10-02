const prisma = require('../prisma');
const httpError = require('../utils/httpError');
const { todayStr, toDateOnly } = require('../utils/dateUtils');

// salary rules
const ABSENT_CUT = 1000;
const LATE_CUT = 500;
const OFF_WITHOUT_LEAVE_CUT = 1000;
const FREE_LEAVES = 2;
const EXTRA_LEAVE_CUT = 500;
const LEAVE_REASONS = ['onLeave', 'sickLeave', 'casualLeave'];

// count late / absent / off / leave days of one employee for a month
const countMonth = async (emp, month, year) => {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const records = await prisma.attendance.findMany({
    where: { employeeId: emp.id, date: { gte: start, lt: end } },
  });
  const byDate = {};
  records.forEach((r) => { byDate[r.date.toISOString().slice(0, 10)] = r; });

  const today = toDateOnly(todayStr());
  const joinKey = emp.joiningDate.toISOString().slice(0, 10);
  let late = 0, absent = 0, offWithoutLeave = 0, leave = 0;

  // go through every working day (Mon-Sat) up to today
  for (const d = new Date(start); d < end && d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    if (d.getUTCDay() === 0) continue; // Sunday
    const key = d.toISOString().slice(0, 10);
    if (key < joinKey) continue; // before joining

    const r = byDate[key];
    if (!r || r.punctuality === 'absent') { absent++; continue; } // no record = absent
    if (r.punctuality === 'late') late++;
    if (r.punctuality === 'off') {
      if (r.offReason === 'leaveNotGiven') offWithoutLeave++;
      else if (LEAVE_REASONS.includes(r.offReason)) leave++;
    }
  }
  return { late, absent, offWithoutLeave, leave };
};

exports.generate = async (month, year) => {
  const now = new Date();
  if (!month || month < 1 || month > 12 || !year) throw httpError(400, 'Valid month and year are required');
  if (year * 12 + month > now.getFullYear() * 12 + now.getMonth() + 1) {
    throw httpError(400, 'Cannot generate salary for a future month');
  }

  const employees = await prisma.employee.findMany({ where: { role: 'employee', isActive: 'active' } });

  for (const emp of employees) {
    const c = await countMonth(emp, month, year);
    const extraLeaves = Math.max(0, c.leave - FREE_LEAVES);

    const lateDeduction = c.late * LATE_CUT;
    const absentDeduction = c.absent * ABSENT_CUT;
    // leave deduction = off without leave + extra leaves after 2
    const leaveDeduction = c.offWithoutLeave * OFF_WITHOUT_LEAVE_CUT + extraLeaves * EXTRA_LEAVE_CUT;
    const totalDeductions = lateDeduction + absentDeduction + leaveDeduction;
    const baseSalary = emp.salary;
    const netSalary = Math.max(0, baseSalary - totalDeductions);

    const data = {
      baseSalary, totalDeductions, lateDeduction, absentDeduction, leaveDeduction, netSalary,
      details: {
        lateCount: c.late,
        absentCount: c.absent,
        offWithoutLeaveCount: c.offWithoutLeave,
        leaveCount: c.leave,
        extraLeaveCount: extraLeaves,
      },
    };

    await prisma.salary.upsert({
      where: { employeeId_month_year: { employeeId: emp.id, month, year } },
      update: data,
      create: { employeeId: emp.id, month, year, ...data },
    });
  }

  return { message: `Salary generated for ${employees.length} employee(s)`, count: employees.length };
};

exports.list = (user, query) => {
  const where = {};
  if (user.role !== 'admin') where.employeeId = user.id; // employee: own salary only
  if (query.month) where.month = Number(query.month);
  if (query.year) where.year = Number(query.year);

  return prisma.salary.findMany({
    where,
    include: { employee: { select: { name: true, department: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { employeeId: 'asc' }],
  });
};
