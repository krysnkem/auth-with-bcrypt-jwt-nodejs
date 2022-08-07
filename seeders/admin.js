//import the model to query the database
const UserModel = require("../src/model/userModel");
const bcrypt = require("bcrypt");
const { ADMIN_PASSWORD } = process.env;
const SALT_ROUNDS = 10;
const { config } = require("dotenv");
config();
exports.seedAdmin = () => {
  //check if there is an admin

  UserModel.findOne(
    {
      role: "admin",
    },
    //if there is none, create one else throw an error
    (err, admin) => {
      if (err) throw err;
      if (admin) return "Admin already exists";

      UserModel.create(
        {
          username: "krys@",
          email: "krysnkem@gmail.com",
          role: "admin",
        },
        (err, user) => {
          if (err) throw err;
          bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
            if (err) throw err;
            bcrypt.hash(ADMIN_PASSWORD, salt, (err, hash) => {
              if (err) throw err;
              user.password = hash;
              user.save((err, result) => {
                if (err) throw err;
                return "Admin acct created";
              });
            });
          });
        }
      );
    }
  );
};
