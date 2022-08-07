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

const otpGenerator = require("otp-generator");
const OTP_LENGTH = 5;
const OTP_CONFIG = {
  upperCaseAlphabets: true,
  specialChars: false,
};

const mailService = require("../mailer/mailService");

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
  UserModel.findOne({ email: userDetails.email }, (err, foundUser) => {
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

    //generate the token
    jwt.sign(
      {
        id: foundUser._id,
        email: foundUser.email,
      },
      SECRET,
      { expiresIn: expiry },
      (err, token) => {
        if (err) return res.status(500).json({ err });

        foundUser.isLoggedIn = true;
        foundUser.token = token;
        foundUser.save((err, updatedUser) => {
          if (err) return res.status(500).json({ err });
          return res
            .status(200)
            .json({ message: "user logged in as staff", token });
        });
      }
    );
  });
};

exports.logOutUser = (req, res) => {
  // extract the token from the authorization header
  const authHeader = req.headers.authorization;

  const splitedString = authHeader.split(" ");
  const token = splitedString[1];

  // decrypt the token
  const decodedUserDetails = jwt.decode(token);
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

exports.sendOtp = (req, res) => {
  //generate otp using the user's email

  //extract email from user's
  let email = req.body.email;
  //check if user with email exists
  UserModel.findOne({ email: email }, (err, foundUser) => {
    if (err) return res.status(500).json({ err });
    if (!foundUser)
      return res
        .status(400)
        .json({ message: "User with this email does not exist" });

    //generate otp
    const otp = generateOtp();
    //save otp to database
    foundUser.otp = otp;
    foundUser.otpIsValid = true;
    //otp expires 3 mins later
    foundUser.otpExpiresBy = new Date().getTime() + 180 * 1000;
    foundUser.save((err, savedUser) => {
      if (err) return res.status(500).json({ err });

      //generate otp message and send
      let mailHtml = sendOtpToClient(otp, email);

      res.send(mailHtml);
    });
  });

  // user send email in a get request
  //send the otp as a respose to the user's get request
};

exports.verifyOtpandChangePassword = (req, res) => {
  //extract email otp and new password
  let sentOtp = req.body.otp;
  let newPassword = req.body.password;
  let email = req.body.email;

  //find the user having this email
  UserModel.findOne({ email: email }, (err, foundUser) => {
    if (err) return res.status(500).json({ err });

    //get and compare the otp stored in the db
    let otpMatches = sentOtp === foundUser.otp;

    // if the otp does not match what is in the database
    if (!otpMatches) return res.status(400).json({ message: "incorrect otp" });

    //check if the otp valid is still valid
    //check the if the currrent time is less than the otp expiry time
    let otpIsValid = new Date().getTime() < foundUser.otpExpiresBy;

    if (!otpIsValid) return res.status(400).json({ message: "otp exipired" });

    //hash the user's password

    bcrpyt.genSalt(SALT_ROUNDS, (err, salt) => {
      if (err) return res.status(500).json(err);

      //hash the user's password
      bcrpyt.hash(newPassword, salt, (err, hash) => {
        if (err) return res.status(500).json({ err });

        foundUser.password = hash;
        foundUser.otp = "";
        foundUser.otpExpiresBy = "";

        //and save to database
        foundUser.save((err, savedUser) => {
          if (err) return res.status(500).json({ err });

          //create token for the client
          jwt.sign(
            {
              id: foundUser._id,
              username: foundUser.username,
              email: foundUser.email,
            },
            SECRET,
            { expiresIn: expiry },
            (err, token) => {
              if (err) return res.status(500).json({ err });

              //send token to the client
              return res.status(200).json({
                message: "Account recovery sucessful",
                token,
              });
            }
          );
        });
      });
    });
  });

  //use replace the password with the new one
};

const generateOtp = () => {
  return otpGenerator.generate(OTP_LENGTH, OTP_CONFIG);
};

const sendOtpToClient = (otp, email) => {
  //call the mail service
  let mailmessagHtml = `<div
class="container"
style="max-width: 90%; margin: auto; padding-top: 20px"
>
<h2>Welcome to the club.</h2>
<h4>You are officially In ✔</h4>
<p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
<h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otp}</h1>
</div>`;
  mailService.sendMail(mailmessagHtml, email);
  return mailmessagHtml;
};
