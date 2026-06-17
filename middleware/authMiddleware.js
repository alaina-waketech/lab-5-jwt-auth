const jsonwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //blocks if there is no auth header or is missing bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token or unauthorized." });
  }

  //uses split to divide the header and get the token
  const token = authHeader.split(" ")[1];

  try {
    //verify the token using jwt_secret
    const decoded = jsonwt.verify(token, process.env.JWT_SECRET);

    //decoded user info so the route can use it
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = protect;
