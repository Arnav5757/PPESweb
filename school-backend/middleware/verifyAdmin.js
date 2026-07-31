const ROLE = require("../config/roles");
const auditService = require("../services/auditService");

const verifyAdmin = async (req, res, next) => {
  if (req.userRecord && req.userRecord.role === ROLE.ADMIN) {
    next();
  } else {
    const email = req.userRecord ? req.userRecord.email : (req.user ? req.user.email : "Unknown");
    const role = req.userRecord ? req.userRecord.role : (req.user ? req.user.role : "Unknown");
    
    await auditService.logAuthorizationFailure(
      email,
      role,
      req,
      "Admin Resource",
      "Requires Admin Role"
    );

    res.status(403).json({ success: false, message: "You are not authorized to access this resource." });
  }
};

module.exports = verifyAdmin;
