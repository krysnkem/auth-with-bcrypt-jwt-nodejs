//to hold business logic for the project
/**
 * tools needed: mongoose's model to the write to the database
 *
 */

const UserModel = require("../model/userModel");
const bcrpyt = require("bcrypt");
const SALT_ROUNDS = 10;

const jwt = require("jsonwebtoken");
const SECRET = "userAuth123";
const expiry = 3600;

exports.loginUser = (req, res) => {
  const userDetails = req.body;
  //check if the user exists
  UserModel.findOne(
    { email: userDetails.email, role: "admin" },
    (err, foundUser) => {
      if (err) return res.status(500).json({ err });
      if (!foundUser)
        return res.status(400).json({
          message:
            "User not found, Check that you have entered the correct details",
        });

      //check if password is correct
      let passwordMatches = bcrpyt.compareSync(
        userDetails.password,
        foundUser.password
      );
      if (!passwordMatches)
        return res.status(401).json({ message: "incorrect password" });

      // check if the user is already loggedin
      if (foundUser.isLoggedIn)
        return res.status(200).json({ message: "User already loggedin" });

      //create a token and send token to the user
      jwt.sign(
        {
          id: foundUser._id,
          email: foundUser.email,
          isLoggedIn: foundUser.isLoggedIn,
        },
        SECRET,
        { expiresIn: expiry },
        (err, token) => {
          if (err) return res.status(500).json({ err });

          foundUser.token = token;
          //set the found user' isLoggedIn to true
          foundUser.isLoggedIn = true;
          foundUser.save((err, updatedUser) => {
            if (err) return res.status(500).json({ err });
            return res
              .status(200)
              .json({ message: "user logged in as admin", token });
          });
        }
      );
    }
  );
};

exports.logOutUser = (req, res) => {
  //get the authorization header
  const authHeader = req.headers.authorization;

  // extract the token from the authorization header
  const splitedString = authHeader.split(" ");
  const token = splitedString[1];

  //decode the jwt
  let decodedUserDetails = jwt.decode(token);

  //extract username or email
  let userEmail = decodedUserDetails.email;

  //use the email to locate the user
  UserModel.findOne({ email: userEmail }, (err, foundUser) => {
    if (err) return res.status(500).json({ err });
    //check if the user has already been logged out
    if (!foundUser.isLoggedIn)
      return res
        .status(401)
        .json({ message: "User has already been logged out" });

    //set the isLogggedIn record to false
    foundUser.isLoggedIn = false;
    foundUser.token = "";
    foundUser.save((err, savedUser) => {
      if (err) return res.status(500).json({ err });
      return res.status(200).json({
        message: "User logged out",
        isLoggedIn: foundUser.isLoggedIn,
      });
    });
  });

  // jwt.verify(token, SECRET, (err, decodedUserDetails) => {
  //   if (err) return res.status(500).json({ err });

  // });
};
