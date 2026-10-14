function validatePasswordCriteria(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required.' };
  }
  if (password.length < 8 || password.length > 12) {
    return { isValid: false, message: 'Password must be between 8 and 12 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 numeric digit (0-9).' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (e.g. @, #, $, %, !).' };
  }
  return { isValid: true, message: '' };
}

function validateCreateUser(req, res, next) {
  const { employee_id, name, phone, password } = req.body || {};
  if (!employee_id || !name) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID and Name are required fields.'
    });
  }
  if (password) {
    const pwdRes = validatePasswordCriteria(password);
    if (!pwdRes.isValid) {
      return res.status(400).json({
        success: false,
        message: pwdRes.message
      });
    }
  }
  if (phone !== undefined && phone !== null && phone !== '') {
    const cleanPhone = String(phone).trim();
    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Phone Number. Phone number must contain exactly 10 numeric digits (e.g. 9876543210).'
      });
    }
  }
  next();
}

module.exports = { validateCreateUser, validatePasswordCriteria };

