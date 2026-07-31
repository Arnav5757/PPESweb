const ROLE = require("../config/roles");
const permissionService = require("./permissionService");

// Strategy registry
const strategies = {
  student: require("./ownershipStrategies/studentOwnership"),
  teacher: require("./ownershipStrategies/teacherOwnership"),
  admin: require("./ownershipStrategies/adminOwnership")
};

const authorizationService = {
  async checkAccess(user, targetResourceId, options = {}) {
    if (!user) {
      return { authorized: false, code: "UNAUTHENTICATED", reason: "User is not authenticated" };
    }

    // Admin override
    if (user.role === ROLE.ADMIN) {
      return { authorized: true };
    }

    const { allowedRoles = [], strategy, permission } = options;

    // Role-based validation
    if (allowedRoles.length > 0 && !permissionService.hasRole(user, allowedRoles)) {
      return { 
        authorized: false, 
        code: "INVALID_ROLE", 
        reason: `User role '${user.role}' is not in the allowed roles: [${allowedRoles.join(", ")}]` 
      };
    }

    // Permission-based validation
    if (permission && !permissionService.hasPermission(user, permission)) {
      return {
        authorized: false,
        code: "MISSING_PERMISSION",
        reason: `User is missing required permission: ${permission}`
      };
    }

    // Ownership validation via pluggable strategy
    if (strategy) {
      const strategyImpl = strategies[strategy];
      if (!strategyImpl) {
        return {
          authorized: false,
          code: "UNKNOWN_STRATEGY",
          reason: `Configured ownership strategy '${strategy}' is not registered`
        };
      }

      const isOwner = await strategyImpl.isOwner(user, targetResourceId);
      if (!isOwner) {
        return {
          authorized: false,
          code: "OWNERSHIP_MISMATCH",
          reason: `User does not own the requested resource ID: ${targetResourceId}`
        };
      }
    }

    return { authorized: true };
  }
};

module.exports = authorizationService;
