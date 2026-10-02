// Creates one admin and two sample employees
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const empPass = await bcrypt.hash('Emp@123', 10);

  const users = [
    { name: 'Admin', email: 'admin@hrms.com', password: adminPass, role: 'admin', department: 'HR' },
    { name: 'Ali Khan', email: 'ali@hrms.com', password: empPass, role: 'employee', department: 'IT' },
    { name: 'Sara Ahmed', email: 'sara@hrms.com', password: empPass, role: 'employee', department: 'Sales' },
  ];

  for (const u of users) {
    await prisma.employee.upsert({ where: { email: u.email }, update: {}, create: u });
  }
  console.log('Seed done. Admin: admin@hrms.com / Admin@123');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
