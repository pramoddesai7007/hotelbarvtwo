const mongoose = require('mongoose');

const expensesFormSchema = new mongoose.Schema({
  date: {
    type: Date,
    // required: true
  },
  expenseTitle: {
    type: String,
    // required: true
  },
  expenseType: {
    type: String,
    // required: true
  },
  description: {
    type: String
  },
  paidBy: {
    type: String,
  
    required: true
  },
  bankName: {
    type: String
  },
  checkNo: {
    type: String
  },
  online: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: function () {
      const currentDate = new Date();
      return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    },
  },
});

const ExpensesForm = mongoose.model('ExpensesForm', expensesFormSchema);

module.exports = ExpensesForm;