const { verifyToken } = require("./auth");

function checkForAuthCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (tokenCookieValue) {
     return next();
    }
    try {
      const userPayload = verifyToken(tokenCookieValue);
      req.user = userPayload
      return req.user
    } catch (error) {}
    next();
  };
}

module.exports = {checkForAuthCookie}
