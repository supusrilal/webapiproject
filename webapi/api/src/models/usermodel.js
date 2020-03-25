const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  method: {
    type: String,
    enum: ["local", "google", "facebook", "github", "twitter"],
    required: true
  },
  local: {
    username: { type: String },
    email: { type: String },
    password: { type: String },
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  google: {
    id: { type: String },
    email: { type: String, lowercase: true }
  },
  facebook: {
    id: { type: String },
    email: { type: String, lowercase: true }
  },
  github: {
    id: { type: String },
    email: { type: String, lowercase: true }
  },
  twitter: {
    id: { type: String },
    email: { type: String, lowercase: true }
  }
});

module.exports = mongoose.model("user", userSchema, "users");
