const { PrismaClient } = require('@prisma/client');

// one client shared by the whole app
const prisma = new PrismaClient();

module.exports = prisma;
