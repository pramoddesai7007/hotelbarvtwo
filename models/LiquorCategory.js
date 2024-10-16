const mongoose = require('mongoose');
const { Schema } = mongoose;

const liquorCategorySchema = new mongoose.Schema({
    liquorCategory: {
        type: String,
        required: true
    },
    brands: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'LiquorBrand',
        },
        name: String,
        prices: [{
            name:String,
            barCategory: String,
            price: String,
            stockQty: Number,
            stockQtyMl:Number,
            stockQtyStr: String,
        }],
    }],
     // Add more fields as needed
  createdAt: {
    type: Date,
    default: function () {
      const currentDate = new Date();
      return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
    },
  },
});

const LiquorCategory = mongoose.model('LiquorCategory', liquorCategorySchema);

module.exports = LiquorCategory;