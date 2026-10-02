const service = require('../services/attendanceService');
const asyncHandler = require('../utils/asyncHandler');

exports.mark = asyncHandler(async (req, res) => {
  res.status(201).json(await service.mark(req.user, req.body));
});

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.user, req.query));
});
