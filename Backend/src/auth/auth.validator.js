function validateLoginInput(req, res, next) {
  const { identifier, username, employee_id, email, password } = req.body || {};
  const userIdentifier = identifier || username || employee_id || email;

  if (!userIdentifier || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, Employee ID, or Email and Password are required.'
    });
  }
  next();
}

module.exports = { validateLoginInput };
