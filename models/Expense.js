const mongoose = require('mongoose');

// Define Expense Schema
const expenseSchema = new mongoose.Schema({
    expense: {
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
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
