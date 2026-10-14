const { validateRequired } = require('../common/validators');

function validateBody(requiredFields = []) {
  return (req, res, next) => {
    const missing = validateRequired(req.body || {}, requiredFields);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
}

module.exports = { validateBody };
