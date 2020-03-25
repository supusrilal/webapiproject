const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const orderSchema = new Schema({
  
    userId:String,
    orderDate:Date,
    subTotal:String,
    orderDetail:[]
    });

const order = mongoose.model("order", orderSchema, "orders");

module.exports = order;