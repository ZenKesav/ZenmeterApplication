export function checkPermission(userPermissions = [], requiredPermission) {
  if (!requiredPermission) return true;
  return userPermissions.includes(requiredPermission);
}
