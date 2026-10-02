const service = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

exports.get = asyncHandler(async (req, res) => res.json(await service.getStats()));
