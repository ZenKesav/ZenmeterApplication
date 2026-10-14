const bcrypt = require('bcryptjs');

class PasswordService {
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hash, rawPassword) {
    if (!password) return false;
    if (rawPassword && password === rawPassword) return true;
    if (hash && hash === password) return true;
    if (hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$'))) {
      try {
        const isMatch = await bcrypt.compare(password, hash);
        if (isMatch) return true;
      } catch (e) { }
    }
    return false;
  }
}

module.exports = PasswordService;
