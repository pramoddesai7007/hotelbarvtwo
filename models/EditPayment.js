const mongoose = require('mongoose');

const editPaymentSchema = new mongoose.Schema({
    // paymentId: {
    //     type: mongoose.Schema.Types.ObjectId, // Reference to the original payment ID
    //     required: true,
    //     ref: 'Payment', // Reference the original Payment model
    // },
    tableId: {
        type: mongoose.Schema.Types.ObjectId, // Keeping it similar to the original schema
        ref: 'Table', // Assuming you have a 'Table' model
    },
    cashAmount: {
        type: String, // Optional in case only part of the payment info is updated
    },
    onlinePaymentAmount: {
        type: String,
    },
    dueAmount: {
        type: String,
    },
    totalAmount: {
        type: Number,
    },
    orderNumber: {
        type: String, // Assuming orderNumber can be updated as well
    },
});

const EditPayment = mongoose.model('EditPayment', editPaymentSchema);

module.exports = EditPayment;