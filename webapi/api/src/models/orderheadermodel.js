const mongoose = require("mongoose");
const orderDetail = require("./orderdetailmodel");

const Schema = mongoose.Schema;
const orderHeaderSchema = new Schema({
  
    userId:String,
    orderDate:Date,
    subTotal:String,
    orderDetail:[{
        orderDetail
    }]

    });

module.exports = mongoose.model("orderheader", orderHeaderSchema, "orderheaders");
