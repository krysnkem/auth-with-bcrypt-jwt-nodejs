const jwt = require("jsonwebtoken");
const SECRET = "userAuth123";

exports.authorizeUser = (req, res, next) => {
  //get the authorization header
  const authHeader = req.headers.authorization;

  //check if there is an authetication header
  if (!authHeader)
    res.status(401).json({ message: "Authetication header is required" });

  const splittedString = authHeader.split(" ");

  if (!splittedString[0] == "Bearer")
    return res
      .status(401)
      .json({ message: "token format is 'Bearer <token>'" });

  const token = splittedString[1];

  jwt.verify(token, SECRET, (err, decodedString) => {
    if (err) return res.status(500).json({ err });
    if (!decodedString)
      return res.status(401).json({ message: "invalid token please login" });

    next();
  });
};
