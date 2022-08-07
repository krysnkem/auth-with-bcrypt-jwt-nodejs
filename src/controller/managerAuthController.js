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

exports.registerNewUser = (req, res) => {
  //fetch the user's details from request body
  const userDetails = req.body;
  const username = userDetails.username;
  const email = userDetails.email;

  //chceck if a user with this username exists
  UserModel.findOne({ username: username }, (err, existingUser) => {
    if (err) return res.status(500).json(err);
    if (existingUser)
      return res
        .status(400)
        .json({ message: "User with this username already exists" });
    //if there is no user with that username creates new user
    UserModel.create(
      {
        username,
        email,
      },
      (err, newUser) => {
        if (err) return res.status(500).json({ err });

        //hash the user's password

        bcrpyt.genSalt(SALT_ROUNDS, (err, salt) => {
          if (err) return res.status(500).json(err);

          //hash the user's password and save to database
          bcrpyt.hash(userDetails.password, salt, (err, hash) => {
            if (err) return res.status(500).json({ err });

            newUser.password = hash;

            //enter the role as a manager
            newUser.role = "manager";
            newUser.save((err, savedUser) => {
              if (err) return res.status(500).json({ err });

              //create token for the client
              jwt.sign(
                {
                  id: newUser._id,
                  username: newUser.username,
                  email: newUser.email,
                },
                SECRET,
                { expiresIn: expiry },
                (err, token) => {
                  if (err) return res.status(500).json({ err });

                  //send token to the client
                  return res.status(200).json({
                    message: "User registration sucessful",
                    token,
                  });
                }
              );
            });
          });
        });
      }
    );
  });
};

exports.loginUser = (req, res) => {
  const userDetails = req.body;
  //check if the user exists
  UserModel.findOne(
    { email: userDetails.email, role: "manager" },
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
              .json({ message: "user logged in as manager", token });
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

  // decrypt the token
  jwt.verify(token, SECRET, (err, decodedUserDetails) => {
    if (err) return res.status(500).json({ err });
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
  });
};
