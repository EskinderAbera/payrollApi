const mongoose = require('mongoose');
const deductionSchema = mongoose.Schema({
    name: { type: String, required: true },
    isPercent:{type:Boolean,default:false},
    amount: { type: Number, required: true, default: 0 },
    description: { type: String },
    companyId: { type: String },
});

module.exports = mongoose.model('GeneralDeduction', deductionSchema);
