const mongoose = require('mongoose');

const pensionSchema = mongoose.Schema({
employeeContribution:{type:Number},//7
employerContribution:{type:Number},//11
companyId: {
        type: String,
    },
// employeeAmount:{type:Number},
// employerAmount: { type: Number }

});

module.exports = mongoose.model('pensionSchema', pensionSchema);
