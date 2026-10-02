const service = require('../services/salaryService');
const asyncHandler = require('../utils/asyncHandler');

exports.generate = asyncHandler(async (req, res) => {
  res.json(await service.generate(Number(req.body.month), Number(req.body.year)));
});

exports.list = asyncHandler(async (req, res) => {
  res.json(await service.list(req.user, req.query));
});
