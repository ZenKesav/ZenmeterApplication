const CACHE_KEYS = {
  USER_PROFILE: (id) => `user:profile:${id}`,
  METER_DETAILS: (serial) => `meter:details:${serial}`,
  PRODUCTION_OVERVIEW: 'production:overview',
  STAGE_STATUS: (stageId) => `stage:status:${stageId}`
};

module.exports = CACHE_KEYS;
