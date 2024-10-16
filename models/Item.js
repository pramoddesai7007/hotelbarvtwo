// models/item.js

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    // required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  lessStock: {
    type: String,
    required: true,
  },
  stockQty:
  {
    type: Number, default: 0
  }, // Add this line
  createdAt: {
    type: Date,
    default: function () {
      const currentDate = new Date();
      return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    },
  },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
