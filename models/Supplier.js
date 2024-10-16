const mongoose = require('mongoose');

const dateWiseRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  debit: { type: Number, required: true, min: 0 },

});


const supplierSchema = new mongoose.Schema({
  vendorName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    // required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  gstNumber: {
    type: String,
    // required: true,
    unique: true,
  },
  paymentMethod: {
    type: String,
    // required: true,
  },
  bankName: {
    type: String,
  },
  checkNumber: {
    type: String,
  },
  openingBalance: {
    type: Number,
    default: 0,
  },
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
  dateWiseRecords: [dateWiseRecordSchema],
  // Add more fields as needed
  createdAt: {
    type: Date,
    default: function () {
      const currentDate = new Date();
      return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    },
  },
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;