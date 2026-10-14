export function getStorageItem(key) {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return sessionStorage.getItem(key);
  }
}

export function setStorageItem(key, value) {
  try {
    sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {}
}

export function removeStorageItem(key) {
  sessionStorage.removeItem(key);
}

