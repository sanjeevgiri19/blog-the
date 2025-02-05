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
  // console.log("generate toooken", token);
  
  return token;
}

function verifyToken(req, res, next) {
  // console.log("req", req);
  
  const token = req.cookies.token; 
  if (!token) {
    // return res.status(401).json({ msg: "No token authorization denied" });
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





// function verifyToken(token) {
//  return (req, res, next) => {
//    const token = req.get('Authorization');
//    console.log("thisis cooike", token);
   
//    if (!token) {
//      return res.status(401).json({ msg: "No token authorization denied" });
//    }

//    try {
//      const user = jwt.verify(token, secret);
//      req.user = user;
//      next();
//    } catch (error) {
//      res.status(400).json({ message: "Token is not valid" });
//    }
//  }
// }


// function verifyToken(req, res, next) {
//   // Get token from Authorization header
//   const token = req.cookies.token; // Get token from cookie
//   console.log(token);
  
//   // const token = req.get("Authorization");
//   if (!token || !token.startsWith("Bearer ")) {
//     return res.status(401).json({ msg: "Invalid authorization format" });
//   }

//   const token = token.split(" ")[1]; // Extract token after 'Bearer '  (e.g Bearer 934r8344j834h4gnr)

//   try {
//     const decoded = jwt.verify(token, secret);
//     req.user = decoded; 
//     next();
    
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid/Expired token" });
//   }
// }



// function verifyToken(token) {
//   const payload = jwt.verify(token, secret);
//   return payload;
// }

module.exports = { generateTokenForUser, verifyToken }
