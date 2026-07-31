const authorizationService = require("../services/authorizationService");
const auditService = require("../services/auditService");

const authorizeOwnership = (options = {}) => {
  return async (req, res, next) => {
    if (!req.user || !req.userRecord) {
      await auditService.logAuthenticationFailure(req, "Missing user context or token info");
      return res.status(401).json({ success: false, message: "A token is required for authentication" });
    }

    const { strategy, param = "id", permission } = options;
    const targetResourceId = req.params[param] || req.body[param] || req.query[param];

    const result = await authorizationService.checkAccess(req.userRecord, targetResourceId, {
      allowedRoles: options.allowedRoles || [],
      strategy,
      permission
    });

    if (result.authorized) {
      await auditService.logAuthorizationSuccess(
        req.userRecord.email,
        req.userRecord.role,
        req,
        targetResourceId || "General"
      );
      return next();
    }

    await auditService.logAuthorizationFailure(
      req.userRecord.email,
      req.userRecord.role,
      req,
      targetResourceId || "General",
      result.reason
    );

    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this resource."
    });
  };
};

module.exports = authorizeOwnership;
