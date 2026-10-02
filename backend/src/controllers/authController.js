const authService = require('../services/authService');
const employeeService = require('../services/employeeService');
const asyncHandler = require('../utils/asyncHandler');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  res.json(await authService.login(email, password));
});

exports.me = asyncHandler(async (req, res) => {
  res.json(await employeeService.getById(req.user.id));
});
