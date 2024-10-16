const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unit: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: function () {
      const currentDate = new Date();
      return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    },
  },
});

const Unit = mongoose.model('Unit', unitSchema);

module.exports = Unit;