const mongoose = require('mongoose');

// Define Taste Schema
const tasteSchema = new mongoose.Schema({
    taste: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: function () {
          const currentDate = new Date();
          return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
        },
      },
});

// Create Taste model
const Taste = mongoose.model('Taste', tasteSchema);

module.exports = Taste;