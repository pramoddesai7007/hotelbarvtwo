const mongoose = require('mongoose');
const { Schema } = mongoose;

const mainCategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    menus: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Menu',
        },
        name: String,
        price: Number,
        imageUrl: String, // Add imageUrl to the schema

    }],
    mainImage: {
        type: String, // Assuming the image will be stored as a URL
    },
    createdAt: {
        type: Date,
        default: function () {
          const currentDate = new Date();
          return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
        },
      },
});

const MainCategory = mongoose.model('MainCategory', mainCategorySchema);
module.exports = MainCategory;
