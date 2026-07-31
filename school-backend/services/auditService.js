const { logActivity } = require("../utils/logger");

const auditService = {
  async log(data) {
    const actionText = `[${data.event}] Method: ${data.method} | Path: ${data.endpoint} | Result: ${data.result} | Reason: ${data.reason || "N/A"}`;
    const username = data.userId ? `${data.userId} (${data.role})` : "Anonymous";
    
    await logActivity(username, actionText, data.targetResource || "Authorization");
  },

  async logAuthorizationFailure(userId, role, req, targetResource, reason) {
    await this.log({
      event: "AUTHORIZATION_FAILURE",
      userId,
      role,
      endpoint: req.originalUrl || req.url || "N/A",
      method: req.method || "N/A",
      targetResource,
      reason,
      result: "DENIED"
    });
  },

  async logAuthorizationSuccess(userId, role, req, targetResource) {
    await this.log({
      event: "AUTHORIZATION_SUCCESS",
      userId,
      role,
      endpoint: req.originalUrl || req.url || "N/A",
      method: req.method || "N/A",
      targetResource,
      result: "ALLOWED"
    });
  },

  async logAuthenticationFailure(req, reason) {
    await this.log({
      event: "AUTHENTICATION_FAILURE",
      userId: null,
      role: null,
      endpoint: req ? (req.originalUrl || req.url || "N/A") : "N/A",
      method: req ? (req.method || "N/A") : "N/A",
      targetResource: "Auth",
      reason,
      result: "DENIED"
    });
  },

  async logPermissionDenied(userId, role, req, targetResource, permission) {
    await this.log({
      event: "PERMISSION_DENIED",
      userId,
      role,
      endpoint: req.originalUrl || req.url || "N/A",
      method: req.method || "N/A",
      targetResource,
      reason: `Missing permission: ${permission}`,
      result: "DENIED"
    });
  },

  async logSuspendedAccountAccess(userId, role, req) {
    await this.log({
      event: "SUSPENDED_ACCOUNT_ACCESS",
      userId,
      role,
      endpoint: req.originalUrl || req.url || "N/A",
      method: req.method || "N/A",
      targetResource: "Account Status",
      reason: "Suspended",
      result: "DENIED"
    });
  }
};

module.exports = auditService;
