import mongoose from 'mongoose';

const depositOrderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },
    depositAmount: {
        type: Number
    },
    date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['PAID', 'PENDING', 'CANCELLED']
    }
}, { timestamps: true });

const DepositOrder = mongoose.model('DepositOrder', depositOrderSchema);
export default DepositOrder;
