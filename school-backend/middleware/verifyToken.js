const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const userRepository = require("../repositories/userRepository");
const accountService = require("../services/accountService");
const auditService = require("../services/auditService");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    await auditService.logAuthenticationFailure(req, "Authorization header missing");
    return res.status(401).json({ success: false, message: "A token is required for authentication" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    await auditService.logAuthenticationFailure(req, "Bearer token missing");
    return res.status(401).json({ success: false, message: "Access token not found" });
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    if (!decoded.user_id || !decoded.role) {
      await auditService.logAuthenticationFailure(req, "Malformed token claims");
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    const userRecord = await userRepository.findById(decoded.user_id);
    if (!userRecord) {
      await auditService.logAuthenticationFailure(req, `User account matching ID ${decoded.user_id} not found`);
      return res.status(401).json({ success: false, message: "User account not found" });
    }

    const statusVal = accountService.validateStatus(userRecord);
    if (!statusVal.valid) {
      if (statusVal.code === "ACCOUNT_SUSPENDED") {
        await auditService.logSuspendedAccountAccess(userRecord.email, userRecord.role, req);
        return res.status(403).json({ success: false, message: "You are not authorized to access this resource." });
      }
      await auditService.logAuthenticationFailure(req, statusVal.message);
      return res.status(401).json({ success: false, message: statusVal.message });
    }

    if (userRecord.role !== decoded.role) {
      await auditService.logAuthenticationFailure(req, `Role state drift: token has '${decoded.role}', DB has '${userRecord.role}'`);
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.user = decoded;
    req.userRecord = userRecord;
    next();
  } catch (err) {
    await auditService.logAuthenticationFailure(req, `Token verify catch: ${err.message}`);
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

module.exports = verifyToken;
