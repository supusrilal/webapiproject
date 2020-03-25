const express = require("express");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcrypt");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const passport = require("passport");
const router = express.Router();

//import usermodel
const User = require("../models/usermodel");


//user root level => /user
router.get("/", (req, res) => {
  res.send("From user endpoint");
});

//register endpoint
router.post("/register", (req, res) => {
  let userData = req.body;
  //Joi validation structure
  const localSchema = Joi.object().keys({
    username: Joi.string()
      .min(3)
      .max(12)
      .required(),
    email: Joi.string()
      .trim()
      .email()
      .required(),
    password: Joi.string()
      .alphanum()
      .min(6)
      .max(16)
      .required()
  });
  const schema = Joi.object().keys({
    method: Joi.string().required(),
    local: localSchema
  });
  //check input field validations
  Joi.validate(req.body, schema, (err, result) => {
    if (err) {
      res.status(401).send(err.details[0].message);
    } else {
      var emailCheck = false;
      checkEmail(userData, emailCheck, res);
    }
  });
});

//check email exist
async function checkEmail(userData, emailCheck, res) {
  try {
    //check weither email exist on the database before register
    await User.findOne(
      { "local.email": userData.local.email },
      (error, user) => {
        if (error) {
          console.log(error);
        } else {
          if (user) {
            emailCheck = true;
            res.status(422).send("Email Address Exist");
          }
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
  registerUser(userData, emailCheck, res);
}

//resgister user
async function registerUser(userData, emailCheck, res) {
  try {
    if (emailCheck === false) {
      let user = new User(userData);
      //hash the plaintext password
      bcrypt.hash(user.local.password, 10, function(err, hash) {
        //save user to mongo
        user.local.password = hash;
        user.save((error, registeredUser) => {
          if (error) {
            console.log(error);
          } else {
            let payload = { subject: registeredUser._id };
            let token = jwt.sign(payload, "secretkey");
            let userData = {
              method: registeredUser.method,
              username: registeredUser.local.username,
              email: registeredUser.local.email,
              userid: registeredUser._id
            };
            res.status(200).send({ token, userData });
          }
        });
      });
      emailCheck = false;
    }
  } catch (err) {
    console.log(err);
  }
}

//login endpoit
router.post("/login", (req, res) => {
  let userData = req.body;
  //Joi validation structure
  const localSchema = Joi.object().keys({
    email: Joi.string()
      .trim()
      .email()
      .required(),
    password: Joi.string()
      .alphanum()
      .min(6)
      .max(16)
      .required()
  });
  const schema = Joi.object().keys({
    method: Joi.string().required(),
    local: localSchema
  });
  //check input fields validation
  Joi.validate(req.body, schema, (err, result) => {
    if (err) {
      res.status(401).send(err.details[0].message);
    } else {
      //get the user from the database
      User.findOne({ "local.email": userData.local.email }, (error, user) => {
        if (error) {
          console.log(error);
        } else {
          if (!user) {
            res.status(401).send("Invalid email");
          } else {
            //compare plaintext password with hashed password
            bcrypt.compare(
              userData.local.password,
              user.local.password,
              function(err, result) {
                if (result) {
                  let payload = { subject: user._id };
                  let token = jwt.sign(payload, "secretkey");
                  let userData = {
                    userId: user._id,
                    method: user.method,
                    username: user.local.username,
                    email: user.local.email,
                    userid: user._id
                  };
                  res.status(200).send({ token, userData });
                } else {
                  res.status(401).send("Invalid password");
                }
              }
            );
          }
        }
      });
    }
  });
});

//password resetrequest endponit 
router.post("/resetrequest", (req, res, next) => {
  const schema = Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
  });
  Joi.validate(req.body, schema, (err, result) => {
    if (err) {
      res.status(401).send({ message: err.details[0].message });
    } else {
      async.waterfall(
        [
          function(done) {
            crypto.randomBytes(20, function(err, buf) {
              var token = buf.toString("hex");
              done(err, token);
            });
          },
          function(token, done) {
            User.findOne({ "local.email": req.body.email }, function(
              err,
              user
            ) {
              if (!user) {
                res.status(401).send({ message: "Email Does not Exist" });
              } else {
                user.local.resetPasswordToken = token;
                user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                  done(err, token, user);
                });
              }
            });
          },
          function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: "mrslegends@gmail.com",
                pass: "MRSlegends7788"
              }
            });
            var mailOptions = {
              to: user.local.email,
              from: "mrslegends@gmail.com",
              subject: "Node.js Password Reset",
              text:
                "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                "http://localhost:3000/resetpasscon/" +
                token +
                "\n\n" +
                "If you did not request this, please ignore this email and your password will remain unchanged.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              console.log("mail sent");
              res.json({
                message: `An e-mail has been sent to  ${
                  user.local.email
                }  with further instructions.`,
                status: true,
                token: token
              });
              done(err, "done");
            });
          }
        ],
        function(err) {
          if (err) return next(err);
        }
      );
    }
  });
});


//password resetconfirm endpoint
router.post("/resetconfirm", (req, res) => {
  const schema = Joi.object().keys({
    password: Joi.string()
      .alphanum()
      .min(6)
      .max(16)
      .required(),
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({ language: { any: { allowOnly: "must match password" } } }),
    token: Joi.string().required()
  });

  Joi.validate(req.body, schema, (err, result) => {
    if (err) {
      res.status(401).send({ message: err.details[0].message });
    } else {
      async.waterfall(
        [
          function(done) {
            //check token is valid or not
            User.findOne(
              {
                "local.resetPasswordToken": req.body.token,
                "local.resetPasswordExpires": { $gt: Date.now() }
              },
              function(err, user) {
                if (err) {
                  console.log(err);
                }

                if (!user) {
                  res.status(401).send({
                    message: "Password reset token is invalid or has expired."
                  });
                } else {
                  try {
                    user.local.resetPasswordToken = undefined;
                    user.local.resetPasswordExpires = undefined;
                    //hash the plaintext password
                    bcrypt.hash(req.body.password, 10, function(err, hash) {
                      //save user to mongo
                      user.local.password = hash;
                      user.save((error, registeredUser) => {
                        if (error) {
                          console.log(error);
                        } else {
                          let payload = { subject: registeredUser._id };
                          let token = jwt.sign(payload, "secretkey");
                          let userData = {
                            method: registeredUser.method,
                            username: registeredUser.local.username,
                            email: registeredUser.local.email,
                            userid: registeredUser._id
                          };
                          res.status(200).send({ token, userData });
                        }
                        done(err, registeredUser);
                      });
                    });
                  } catch (err) {
                    console.log(err);
                  }
                }
              }
            );
          },
          function(user, done) {
            var smtpTransport = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: "mrslegends@gmail.com",
                pass: "MRSlegends7788"
              }
            });
            var mailOptions = {
              to: user.local.email,
              from: "mrslegends@gmail.com",
              subject: "Your password has been changed",
              text:
                "Hello,\n\n" +
                "This is a confirmation that the password for your account " +
                user.local.email +
                " has just been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err) {
              done(err);
            });
          }
        ],
        function(err) {}
      );
    }
  });
});

//client id = 357040066517-aaglkn83u08lk1pneq767j218j37a467.apps.googleusercontent.com
//client secret = bb4esjK-41IE8Zfrplpwl9Lm

//Google Oauth
router
  .route("/oauth/google")
  .post(
    passport.authenticate("googleToken", { session: false }),
    (req, res) => {
      let user = req.user;
      if (user) {
        let payload = { subject: user.google.id };
        let token = jwt.sign(payload, "secretkey");
        let username = user.google.email.split("@")[0];
        let userData = {
          method: user.method,
          username: username,
          email: user.google.email,
          userid: user._id
        };
        res.status(200).send({ token, userData });
      } else {
        res.status(500).send("some thing is wrong");
      }
    }
  );

//facebook app id -> 844353635903212
//facebook app secret -> a72989add20c73d04e4c4289817482d5
//facebook Oauth
router
  .route("/oauth/facebook")
  .post(
    passport.authenticate("facebookToken", { session: false }),
    (req, res) => {
      let user = req.user;
      if (user) {
        let payload = { subject: user.facebook.id };
        let token = jwt.sign(payload, "secretkey");
        let username = user.facebook.email.split("@")[0];
        let userData = {
          method: user.method,
          username: username,
          email: user.facebook.email,
          userid: user._id
        };
        res.status(200).send({ token, userData });
      } else {
        res.status(500).send("some thing is wrong");
      }
    }
  );

//Github app id -> c1989d8886977da9abf0
//Github app secret -> 637d0185a321f44d17bd7b9c217c54c5fe19e7da
//Github Oauth
router
  .route("/oauth/github")
  .post(
    passport.authenticate("githubToken", { session: false }),
    (req, res) => {
      let user = req.user;
      if (user) {
        let payload = { subject: user.facebook.id };
        let token = jwt.sign(payload, "secretkey");
        let username = user.github.email;
        let userData = {
          method: user.method,
          username: username,
          email: user.github.email,
          userid: user._id
        };
        res.status(200).send({ token, userData });
      } else {
        res.status(500).send("some thing is wrong");
      }
    }
  );

//twitter app id -> Sf6dF7ZaJN0mdHqQTpJt54hhU
//twitter app secret -> 4jNKTtKPonAGUwpCAVCtTJb7c5T37Cr7MOZVseQU40P0koT9Mh
//twitter Oauth
router
  .route("/oauth/twitter")
  .post(
    passport.authenticate("twitter-token", { session: false }),
    (req, res) => {
      let user = req.user;
      console.log(user)
      if (user) {
        let payload = { subject: user.twitter.id };
        let token = jwt.sign(payload, "secretkey");
        let username = user.twitter.email;
        let userData = {
          method: user.method,
          username: username,
          email: user.twitter.email,
          userid: user._id
        };
        res.status(200).send({ token, userData });
      } else {
        res.status(500).send("some thing is wrong");
      }
    }
  );


  

  




module.exports = router;
