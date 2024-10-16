const mongoose = require('mongoose');

const purchaseVatSchema = new mongoose.Schema({
  vatPercentage: {
    type: Number,
    required: true,
    unique: true,
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

const PurchaseVAT = mongoose.model('PurchaseVAT', purchaseVatSchema);

module.exports = PurchaseVAT;