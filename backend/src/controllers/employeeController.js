const service = require('../services/employeeService');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => res.json(await service.list()));

exports.getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  // employee can only see own profile
  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ message: 'You are not allowed to access this' });
  }
  res.json(await service.getById(id));
});

exports.create = asyncHandler(async (req, res) => res.status(201).json(await service.create(req.body)));

exports.update = asyncHandler(async (req, res) => res.json(await service.update(Number(req.params.id), req.body)));

exports.remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.id === id) return res.status(400).json({ message: 'You cannot delete your own account' });
  await service.remove(id);
  res.json({ message: 'Employee deleted' });
});
