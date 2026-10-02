// allows only given roles, example: allowRoles('admin')
const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You are not allowed to access this' });
  }
  next();
};

module.exports = allowRoles;
