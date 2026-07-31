const ACCOUNT_STATUS = require("../config/accountStatus");

const accountService = {
  isActive(user) {
    if (!user) return false;
    return user.status === ACCOUNT_STATUS.ACTIVE || !user.status;
  },

  isSuspended(user) {
    if (!user) return false;
    return user.status === ACCOUNT_STATUS.SUSPENDED;
  },

  validateStatus(user) {
    if (!user) {
      return { valid: false, code: "USER_NOT_FOUND", message: "User account does not exist" };
    }
    if (this.isSuspended(user)) {
      return { valid: false, code: "ACCOUNT_SUSPENDED", message: "User account has been suspended" };
    }
    if (!this.isActive(user)) {
      return { valid: false, code: "ACCOUNT_INACTIVE", message: "User account is inactive" };
    }
    return { valid: true };
  }
};

module.exports = accountService;
