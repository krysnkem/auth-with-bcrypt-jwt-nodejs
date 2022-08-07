//to create the model for the users using schema

const { Schema, model, default: mongoose } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["staff", "manager", "admin"],
      default: "staff",
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresBy: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const UserModel = model("Users", userSchema);

module.exports = UserModel;
