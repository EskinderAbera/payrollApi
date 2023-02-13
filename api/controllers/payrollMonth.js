const payrollMonth = require('../models/payrollMonth.js');
const PayrollMonth=require('../models/payrollMonth.js');

exports.add_payrollMonth = async (req, res) => {
 
  try {
    const {
      startDate,
      endDate
    }=req.body;
    const newpayrollMonth = await payrollMonth.create({
      startDate:startDate,
      endDate:endDate,
      companyId:req.user.id
    })
 
    res.status(200).json({
      newpayrollMonth,
    });
   
  } catch (err) {
    res.status(404).json({
      error: err,
    });
  }
};


//GET ALL
exports.get_All_monthPayroll = async (req, res, next) => {


  try {
    const monthPayroll = await PayrollMonth.find({companyId:req.user.id});
    res.status(200).json({
      count: monthPayroll.length,
      monthPayroll,
    });
  } catch (err) {
    next(err);
  }
};
//GET One
exports.get_single_monthPayroll = async (req, res) => {
  try {
    const monthPayroll = await PayrollMonth.findById(req.params.id);
    res.status(200).json(monthPayroll);
  } catch (error) {
    res.status(500).json(error);
  }
};
//UPDATE

exports.updatemonthPayroll = async (req, res) => {
  try {
    const updatedmonthPayroll = await PayrollMonth.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedDept);
  } catch (error) {}
};
//DELETE
exports.delete_monthPayroll = async (req, res) => {
  try {
    await PayrollMonth.findByIdAndDelete(req.params.id);
    res.status(200).json('monthPayroll has been deleted');
  } catch (error) {
    res.status(500).json(error);
  }
};


