// models/GST.js
const mongoose = require('mongoose');

const gstSchema = new mongoose.Schema({
  gstPercentage: {
    type: Number,
    required: true,
    unique:true,
    min: 0,
    max: 100,
  },
  createdAt: {
    type: Date,
    default: function () {
      const currentDate = new Date();
      return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    },
  },
});

const GST = mongoose.model('GST', gstSchema);

module.exports = GST;
