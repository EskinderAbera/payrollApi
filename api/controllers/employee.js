const Employee = require('../models/employee.js');
const Department = require('../models/department.js');
const middleware = require('../middleware/auth.js');

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel.js');
const { createError } = require('../utils/error.js');


var fs = require('fs');
var path = require('path');


const companyId = '';
//protect
const companyId1 = async (req, res) => {
  let companyId = req.user.id;
  return companyId;
};

//Add



exports.add_employee = async (req, res, next) => {
  try {
    const x = await companyId1(req, res);
    console.log(x);
 

    const {
      fullname,
      // nationality,
      // sex,
      // id_number,
       email,

      // date_of_birth,
      // images,
      // phoneNumber,
      // optionalNumber,
      // emergency_contact,
      // hireDate,
      // joiningDate,
      // employeeCode,
      // employeeType,
      // accountTitle,
      // accountNumber,
      // paymentMethod,
      // department,

      // separationDate,
      // basicSalary,
      // housingAllowance,
      // positionAllowance,
      // hardshipAllowance,
      // desertAllowance,
      // transportAllowance,
      // cashIndeminityAllowance,
      // fieldAllowance,
      // overtimeEarning,
      // otherEarning,
      // lateSittingOverTime,
      // arrears,
      // dayDeduction,
      // socialSecurity,
      // providentFund,
      // EOTBDeduction,
      // TaxDeduction,
      // netSalary,
    } = req.body;

    const newEmployee = await Employee.create({
      fullname: fullname,
      // nationality: nationality,
      // sex: sex,
      // id_number: id_number,
       email: email,
      // department: department,
      // images: req.file.path,
      // phoneNumber: phoneNumber,//
      // date_of_birth:date_of_birth,
      // optionalNumber: optionalNumber,
      // emergency_contact: emergency_contact,
      // hireDate: hireDate,
      // joiningDate: joiningDate,
      // employeeCode: employeeCode,
      // employeeType: employeeType,
      // accountTitle: accountTitle, 
      // accountNumber: accountNumber,
      // paymentMethod: paymentMethod,

      // separationDate: separationDate,
      // basicSalary: basicSalary,
      // housingAllowance: housingAllowance,
      // positionAllowance: positionAllowance,
      // hardshipAllowance: hardshipAllowance,
      // desertAllowance: desertAllowance,
      // transportAllowance: transportAllowance,
      // cashIndeminityAllowance: cashIndeminityAllowance,
      // fieldAllowance: fieldAllowance,
      // overtimeEarning: overtimeEarning,
      // otherEarning: otherEarning,
      // lateSittingOverTime: lateSittingOverTime,
      // arrears: arrears,
      // dayDeduction: dayDeduction,
      // socialSecurity: socialSecurity,
      // providentFund: providentFund,
      // EOTBDeduction: EOTBDeduction,
      // TaxDeduction: TaxDeduction,
      // netSalary: netSalary,
      // companyId: req.user.id,
      // img:{
      //   data: fs.readFileSync("uploads/" + req.file.filename),
      //   contentType: "image/png",
      // }
    });
    const y = await companyId1(req, res);
    res.status(200).json({
      //companyId: req.user.id,
      employee: newEmployee,

    });
  } catch (err) {
    next(err);
    // const newEmployee = new Employee(req.body);
    // try {
    //   // const saved = await newEmployee;
    //   const savedEmployee = await newEmployee().save();
    //   console.log(req.body);
    //   res.status(200).json({
    //     savedEmployee,
    //   });
    // } catch (err) {
    //   res.status(404).json({
    //     error: err,
    //   });
    // }
  }
};

//GET ALL
exports.get_All_Employee = async (req, res, next) => {
  try {
    const employee = await Employee.find({ companyId: req.user.id })
     
      .populate('allowance')
      .populate('payroll')
      .populate('deduction');
    res.status(200).json({
      count: employee.length,
      employee
     
      
    });
  } catch (err) {
    next(err);
  }
};
 //   fullname: employee,
      // nationality: employee.nationality,
      // sex: employee.sex,
      // id_number: employee.id_number,
      // email: employee.email,
      // department: employee.department,
      // //images: req.file.path,
      // phoneNumber: employee.phoneNumber,//
      // date_of_birth:employee.date_of_birth,
      // optionalNumber: employee.optionalNumber,
      // emergency_contact: employee.emergency_contact,
      // hireDate: employee.hireDate,
      // joiningDate: employee.joiningDate,
      // employeeCode: employee.employeeCode,
      // employeeType: employee.employeeType,
      // accountTitle: employee.accountTitle, 
      // accountNumber: employee.accountNumber,
      // paymentMethod: employee.paymentMethod,

      // separationDate: employee.separationDate,
      // basicSalary: employee.basicSalary,
      // housingAllowance: employee.housingAllowance,
      // positionAllowance: employee.positionAllowance,
      // hardshipAllowance: employee.hardshipAllowance,
      // desertAllowance: employee.desertAllowance,
      // transportAllowance: employee.transportAllowance,
      // cashIndeminityAllowance: employee.cashIndeminityAllowance,
      // fieldAllowance: employee.fieldAllowance,
      // overtimeEarning: employee.overtimeEarning,
      // otherEarning: employee.otherEarning,
      // lateSittingOverTime: employee.lateSittingOverTime,
      // arrears: employee.arrears,
      // dayDeduction: employee.dayDeduction,
      // socialSecurity: employee.socialSecurity,
      // providentFund: employee.providentFund,
      // EOTBDeduction: employee.EOTBDeduction,
      // TaxDeduction: employee.TaxDeduction,
      // netSalary: employee.netSalary,
      // companyId: employee.companyId,
//GET one
exports.get_single_Employee = async (req, res) => {
  try {
    const employee = await Employee.find({
      companyId: req.user.id,
      _id: req.params.id,
    })
      .populate('department')
      .populate('allowance')
      .populate('payroll')
      .populate('deduction');
    res.status(200).json({
      count: employee.length,
      employee:{
        name:employee.fullname,
      },
    });
  } catch (err) {
    next(err);
  }
};
//UPDATE

exports.updateEmployee = async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.employeeId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedEmployee);
  } catch (error) {}
};

//DELETE EMPLOYEE
exports.delete_Employee = async (req, res,next) => {
    try {
      console.log(req.params.key);
  const response= await Employee.findByIdAndDelete(req.params.key);
     
    res.status(200).json({response});
  } catch (err) {
    next(err);
  }
};

///

//SEARCH ALL EMPLOYEE

exports.searchAllEmployee = async (req, res, next) => {
  try {
  const   query = req.query.search_query;
    console.log(query);
    const key = req.params.key;
    console.log(req.user.id);
    const employee = await Employee.find({
      $and: [
        { companyId: req.user.id },
        { fullname: { $regex: new RegExp(query, 'i') } },
      ],
    })
      .populate('department')
      .populate('allowance')
      .populate('payroll')
      .populate('deduction');
    res.status(200).json({
      user: employee,
    });
  } catch (err) {
    next(err);
  }
};

//SEARCH BY DEPARTMENT IDD
exports.get_By_Department = async (req, res, next) => {
  const departmentId = req.params.departmentId;
  try {
    const list_of_employee = await Employee.find({
      companyId: req.user.id,
      departmentId: departmentId,
    })
      .populate('department')
      .populate('allowance')
      .populate('payroll')
      .populate('deduction');

    res.status(200).json({ list_of_employee: list_of_employee });
  } catch (err) {
    next(err);
  }
};
