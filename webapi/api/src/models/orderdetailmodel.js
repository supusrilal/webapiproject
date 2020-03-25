const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const orderDetailSchema = new Schema({
  
    orderId:String,
    itemId:String,
    price:String,
    quantity:String,
    lineTotal:String

    });

module.exports = mongoose.model("orderdetail", orderDetailSchema, "orderdetails");
