function validateCreateRole(req, res, next) {
  const { role_name } = req.body || {};
  if (!role_name) {
    return res.status(400).json({ success: false, message: 'role_name is required' });
  }
  next();
}

module.exports = { validateCreateRole };
