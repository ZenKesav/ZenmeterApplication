class JigProtocol {
  static encodeCommand(cmd, payload) {
    return JSON.stringify({ cmd, payload, ts: Date.now() });
  }

  static decodeResponse(raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
}

module.exports = JigProtocol;
