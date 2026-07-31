const adminOwnership = {
  async isOwner(user, resourceId) {
    if (!user) return false;
    return user.role === "admin";
  }
};

module.exports = adminOwnership;
