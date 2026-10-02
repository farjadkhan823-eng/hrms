const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const httpError = require('../utils/httpError');

exports.login = async (email, password) => {
  const user = await prisma.employee.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) throw httpError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw httpError(401, 'Invalid email or password');

  // inactive employees cannot login
  if (user.isActive === 'inactive') throw httpError(403, 'Your account is inactive');

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  // never send password back
  const { password: _pw, ...safeUser } = user;
  return { token, user: safeUser };
};
