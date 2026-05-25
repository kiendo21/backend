import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    address: {
        type: String
    },
    price: {
        type: Number
    },
    area: {
        type: Number
    },
    status: {
        type: String,
        enum: ['SELLING', 'SOLD', 'STOP_SELLING']
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
export default Property;
