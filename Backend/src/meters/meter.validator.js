function validateCreateMeter(req, res, next) {
  const { meter_no } = req.body || {};
  if (!meter_no) {
    return res.status(400).json({ success: false, message: 'meter_no is required' });
  }
  next();
}

module.exports = { validateCreateMeter };
