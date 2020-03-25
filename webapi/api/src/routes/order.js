const express = require("express");
const Joi = require("joi");
const bcrypt = require("bcrypt");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
const passport = require("passport");
const router = express.Router();

//import orderHeader and orderDetail models
const Order = require("../models/ordermodel");

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

  router.post("/orders", async (req, res) => {
    if (!req.body.userId) {
      res.status(400).send("Not all mandatory values are sent");
      return;
    }
  
    const orderIdAutoValue=0;  
    let order = new Order({
        userId: req.body.userId,
        orderDate: req.body.orderDate,
        subTotal: req.body.subTotal,
        orderDetail:req.body.orderDetail
      });

      order = await order.save();
    res.send(order);
  });

  module.exports = router;