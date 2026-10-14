const crypto = require('crypto');
const env = require('../../config/environment');

function generateToken(user) {
  const payload = {
    userId: user.id,
    employee_id: user.employee_id,
    role: user.role,
    exp: Date.now() + 86400000
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', env.JWT_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

function verifyToken(token) {
  try {
    const [str, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', env.JWT_SECRET).update(str).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const str = String(timeStr).trim().toUpperCase();
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

module.exports = {
  generateToken,
  verifyToken,
  parseTimeToMinutes
};
