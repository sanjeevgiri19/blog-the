const jwt = require("jsonwebtoken");
const secret = process.env.SECRET

function generateTokenForUser (user) {
  const payload = {
    _id : user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }

  const token = jwt.sign(payload, secret)  
  return token;
}

function verifyToken(req, res, next) {
  const token = req.cookies.token; 
  if (!token) {
    return res.status(401).redirect('/user/signin');
  }

  try {
    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ message: "Token is not valid" });
  }
}


const urlMiddleware = (req, res, next) => {
  res.locals.currentUrl = req.originalUrl;
  next();
};

module.exports = { generateTokenForUser, verifyToken, urlMiddleware };
