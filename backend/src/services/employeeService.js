const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const httpError = require('../utils/httpError');

// fields we send to client (password excluded)
const select = {
  id: true, name: true, email: true, role: true,
  department: true, salary: true, joiningDate: true, isActive: true,
};

exports.list = () => prisma.employee.findMany({ select, orderBy: { id: 'asc' } });

exports.getById = async (id) => {
  const emp = await prisma.employee.findUnique({ where: { id }, select });
  if (!emp) throw httpError(404, 'Employee not found');
  return emp;
};

// basic checks for enum fields
const checkEnums = (data) => {
  if (data.role && !['admin', 'employee'].includes(data.role)) throw httpError(400, 'Invalid role');
  if (data.isActive && !['active', 'inactive'].includes(data.isActive)) throw httpError(400, 'Invalid isActive value');
};

exports.create = async (data) => {
  const { name, email, password, department } = data;
  if (!name || !email || !password || !department) {
    throw httpError(400, 'name, email, password and department are required');
  }
  checkEnums(data);

  const cleanEmail = email.trim().toLowerCase();
  const exists = await prisma.employee.findUnique({ where: { email: cleanEmail } });
  if (exists) throw httpError(400, 'Email already registered');

  const hashed = await bcrypt.hash(password, 10);

  return prisma.employee.create({
    data: {
      name,
      email: cleanEmail,
      password: hashed,
      department,
      role: data.role || 'employee',
      salary: data.salary ? Number(data.salary) : 30000,
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      isActive: data.isActive || 'active',
    },
    select,
  });
};

exports.update = async (id, data) => {
  await exports.getById(id); // throws 404 if missing
  checkEnums(data);

  const updateData = {};
  ['name', 'department', 'role', 'isActive'].forEach((k) => {
    if (data[k] !== undefined) updateData[k] = data[k];
  });
  if (data.email) updateData.email = data.email.trim().toLowerCase();
  if (data.salary !== undefined) updateData.salary = Number(data.salary);
  if (data.joiningDate) updateData.joiningDate = new Date(data.joiningDate);
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

  return prisma.employee.update({ where: { id }, data: updateData, select });
};

exports.remove = async (id) => {
  await exports.getById(id);
  await prisma.employee.delete({ where: { id } });
};
