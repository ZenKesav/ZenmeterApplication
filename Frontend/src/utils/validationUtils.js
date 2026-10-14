export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

export function isValidMeterNo(meterNo) {
  return /^MTR\d{6,10}$/i.test(meterNo || '');
}
