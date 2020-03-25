const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const passport = require("passport");
const router = express.Router();

//import usermodel
const Item = require("../models/itemmodel");


//import check token
const verifyToken = require("../shared/generateToken")


//user root level => /user
router.get("/", (req, res) => {
    res.send("From Item endpoint");
  });

  router.get("/items", verifyToken , async (req, res) => {
    try {
      let items = await Item.find();
      res.send(items);
    } catch (ex) {
      return res.status(500).send("Error", err.message);
    }
  });

  module.exports = router;