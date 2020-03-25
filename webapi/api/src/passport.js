const passport = require("passport");
const GooglePlusTokenStrategy = require("passport-google-plus-token");
const FacebookTokenStrategy = require("passport-facebook-token");
const GitHubTokenStrategy = require("passport-github-token");
const TwitterTokenStrategy = require('passport-twitter-token');
const User = require("./models/usermodel");

//Google Strategy
passport.use(
  "googleToken",
  new GooglePlusTokenStrategy(
    {
      clientID:
        "357040066517-aaglkn83u08lk1pneq767j218j37a467.apps.googleusercontent.com",
      clientSecret: "bb4esjK-41IE8Zfrplpwl9Lm"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        console.log("profile", profile);
        //Check whether this current user exist in out database
        const existingUser = await User.findOne({ "google.id": profile.id });
        if (existingUser) {
          console.log("exist");
          return done(null, existingUser);
        }
        console.log("doesent exist");
        //if new account
        const newUser = new User({
          method: "google",
          google: {
            id: profile.id,
            email: profile.emails[0].value
          }
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

//Facebook Strategy
passport.use(
  "facebookToken",
  new FacebookTokenStrategy(
    {
      clientID: "844353635903212",
      clientSecret: "a72989add20c73d04e4c4289817482d5"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        console.log("profile", profile);
        //Check whether this current user exist in out database
        const existingUser = await User.findOne({ "facebook.id": profile.id });
        if (existingUser) {
          console.log("exist");
          return done(null, existingUser);
        }
        console.log("doesent exist");
        //if new account
        const newUser = new User({
          method: "facebook",
          facebook: {
            id: profile.id,
            email: profile.emails[0].value
          }
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);

//Github Strategy
passport.use(
  "githubToken",
  new GitHubTokenStrategy(
    {
      clientID: "c1989d8886977da9abf0",
      clientSecret: "637d0185a321f44d17bd7b9c217c54c5fe19e7da"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        console.log("profile", profile);
        //Check whether this current user exist in out database
        const existingUser = await User.findOne({ "github.id": profile.id });
        if (existingUser) {
          console.log("exist");
          return done(null, existingUser);
        }
        console.log("doesent exist");
        //if new account
        const newUser = new User({
          method: "github",
          github: {
            id: profile.id,
            email: profile.username
          }
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);



//twitter Strategy
passport.use(
  "twitter-token",
  new TwitterTokenStrategy(
    {
      consumerKey: "Sf6dF7ZaJN0mdHqQTpJt54hhU",
      consumerSecret: "4jNKTtKPonAGUwpCAVCtTJb7c5T37Cr7MOZVseQU40P0koT9Mh"
    },
    async (token, tokenSecret, profile, done) => {
      console.log(profile)
      console.log("accessToken", token);
      console.log("refreshToken", tokenSecret);
      try {
        //Check whether this current user exist in out database
        const existingUser = await User.findOne({ "twitter.id": profile.id });
        if (existingUser) {
          console.log("exist");
          return done(null, existingUser);
        }
        console.log("doesent exist");
        //if new account
        const newUser = new User({
          method: "twitter",
          twitter: {
            id: profile.id,
            email: profile.username
          }
        });

        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, false, error.message);
      }
    }
  )
);