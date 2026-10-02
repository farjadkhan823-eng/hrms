const prisma = require('../prisma');
const httpError = require('../utils/httpError');
const { todayStr, toDateOnly } = require('../utils/dateUtils');

const LATE_AFTER = 10 * 60 + 15; // 10:15 AM in minutes
const EARLY_BEFORE = 17 * 60;    // 5:00 PM in minutes

const minutesOf = (d) => d.getHours() * 60 + d.getMinutes();

// "HH:mm" + date -> Date object (empty = null)
const toTime = (dateStr, t) => {
  if (!t) return null;
  const d = new Date(`${dateStr}T${t}:00`);
  if (isNaN(d.getTime())) throw httpError(400, 'Invalid time, use HH:mm');
  return d;
};

// main business rule: decide punctuality and offReason
const calcPunctuality = (dateStr, checkIn, checkOut, offReason) => {
  const isSunday = toDateOnly(dateStr).getUTCDay() === 0;

  // Sunday is always off (onDuty if someone still worked)
  if (isSunday) return { punctuality: 'off', offReason: checkIn ? 'onDuty' : null };

  // no check in: off (if a reason is given) otherwise absent
  if (!checkIn) {
    if (offReason) return { punctuality: 'off', offReason };
    return { punctuality: 'absent', offReason: null };
  }

  if (minutesOf(checkIn) > LATE_AFTER) return { punctuality: 'late', offReason: null };
  if (checkOut && minutesOf(checkOut) < EARLY_BEFORE) return { punctuality: 'early', offReason: null };
  return { punctuality: 'onTime', offReason: null };
};

exports.mark = async (user, body) => {
  const isAdmin = user.role === 'admin';
  const employeeId = isAdmin ? Number(body.employeeId) : user.id;
  if (!employeeId) throw httpError(400, 'employeeId is required');

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw httpError(404, 'Employee not found');

  const dateStr = isAdmin && body.date ? body.date : todayStr();
  const where = { employeeId_date: { employeeId, date: toDateOnly(dateStr) } };
  const existing = await prisma.attendance.findUnique({ where });

  let checkIn = existing ? existing.checkIn : null;
  let checkOut = existing ? existing.checkOut : null;
  let offReason = null;

  if (isAdmin) {
    // admin can enter or fix times manually
    if (body.checkIn !== undefined) checkIn = toTime(dateStr, body.checkIn);
    if (body.checkOut !== undefined) checkOut = toTime(dateStr, body.checkOut);
    offReason = body.offReason || null;
  } else if (body.action === 'checkIn') {
    if (existing && existing.checkIn) throw httpError(400, 'You already checked in today');
    checkIn = new Date();
  } else if (body.action === 'checkOut') {
    if (!existing || !existing.checkIn) throw httpError(400, 'Please check in first');
    if (existing.checkOut) throw httpError(400, 'You already checked out today');
    checkOut = new Date();
  } else {
    throw httpError(400, "action must be 'checkIn' or 'checkOut'");
  }

  const result = calcPunctuality(dateStr, checkIn, checkOut, offReason);
  const data = {
    checkIn,
    checkOut,
    status: employee.isActive, // active/inactive follows employee
    punctuality: result.punctuality,
    offReason: result.offReason,
  };

  return prisma.attendance.upsert({
    where,
    update: data,
    create: { employeeId, date: toDateOnly(dateStr), ...data },
  });
};

exports.list = (user, query) => {
  const where = {};

  // employee sees only own records, admin sees everyone
  if (user.role !== 'admin') where.employeeId = user.id;
  else if (query.employeeId) where.employeeId = Number(query.employeeId);

  const now = new Date();
  if (query.filter === 'month') {
    const m = Number(query.month) || now.getMonth() + 1;
    const y = Number(query.year) || now.getFullYear();
    where.date = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  } else if (query.filter === 'week') {
    // current week, Monday to Sunday
    const today = toDateOnly(todayStr());
    const diff = today.getUTCDay() === 0 ? 6 : today.getUTCDay() - 1;
    const start = new Date(today.getTime() - diff * 86400000);
    where.date = { gte: start, lt: new Date(start.getTime() + 7 * 86400000) };
  }

  if (query.status) where.status = query.status;
  if (query.punctuality) where.punctuality = query.punctuality;
  if (query.offReason) where.offReason = query.offReason;

  return prisma.attendance.findMany({
    where,
    include: { employee: { select: { id: true, name: true, department: true } } },
    orderBy: [{ date: 'desc' }, { employeeId: 'asc' }],
  });
};
