
const mongoose = require('mongoose')
const { Schema } = mongoose;

// Schema for Main section in Hotel
const sectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    isDefault:{
        type:Boolean,
        default:false
    },
    acPercentage: {
        type: Number,
        default: 0,
    },
    tableNames: [{
        tableName: {
            type: String,    
        },
        tableId: {
            type: Schema.Types.ObjectId,
            ref: 'Table',
        },
    }],
    createdAt: {
        type: Date,
        default: function () {
          const currentDate = new Date();
          return new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000);
        },
      },

});


const Section = mongoose.model('Section', sectionSchema)
module.exports = Section


