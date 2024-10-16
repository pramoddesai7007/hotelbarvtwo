const mongoose = require('mongoose');

// Define bankNameSchema
const bankNameSchema = new mongoose.Schema({
    bankName: {
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

// Create Expense model
const BankName = mongoose.model('BankName', bankNameSchema);

module.exports = BankName;