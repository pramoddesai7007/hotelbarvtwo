const mongoose = require('mongoose');

// Define Waiter Schema
const waiterSchema = new mongoose.Schema({
    waiterName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    uniqueId: {
        type: String,
        unique: true, // Set the unique option to true
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

// Create Waiter model
const Waiter = mongoose.model('Waiter', waiterSchema);

module.exports = Waiter;