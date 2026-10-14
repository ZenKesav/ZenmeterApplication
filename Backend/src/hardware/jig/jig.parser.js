class JigParser {
  static parseChannelData(rawData) {
    if (typeof rawData === 'string') {
      try { return JSON.parse(rawData); } catch (e) { return null; }
    }
    return rawData;
  }
}

module.exports = JigParser;
