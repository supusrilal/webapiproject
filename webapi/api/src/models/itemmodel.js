const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const itemSchema = new Schema({
  
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 20
      }, // Adding some valdiation in mongoose. This will stop mongoose from adding a bear to db if it does not contain a name or doesnt have the other conditions met
      category: String,
      image: String,
      price: String,
      quantity: String
    });

module.exports = mongoose.model("item", itemSchema, "items");
