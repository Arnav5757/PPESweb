const ROLE = require("../config/roles");
const PERMISSION = require("../config/permissions");

// Centralized role-to-permission mapping
const ROLE_PERMISSIONS = {
  [ROLE.ADMIN]: Object.values(PERMISSION),
  [ROLE.TEACHER]: [
    PERMISSION.TEACHER_READ,
    PERMISSION.TEACHER_UPDATE,
    PERMISSION.STUDENT_READ,
    PERMISSION.NOTICE_CREATE,
    PERMISSION.NOTICE_UPDATE,
    PERMISSION.NOTICE_DELETE,
    PERMISSION.GALLERY_UPLOAD
  ],
  [ROLE.STUDENT]: [
    PERMISSION.STUDENT_READ,
    PERMISSION.STUDENT_UPDATE
  ]
};

const permissionService = {
  hasRole(user, allowedRoles) {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  },

  hasPermission(user, permission) {
    if (!user || !user.role) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }
};

module.exports = permissionService;
