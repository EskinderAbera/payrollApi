const Employee = require("../models/employee.js");
const Department = require("../models/department.js");
const middleware = require("../middleware/auth.js");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel.js");
const createError = require("../utils/error.js");
const multer = require("multer");
const mongoose = require("mongoose");
var fs = require("fs");
var path = require("path");
const uuid = require("uuid");
const department = require("../models/department.js");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/email.js");

const GradeDefinition = require("../models/gradeDefinition.js");

const IDFormat = require("../models/defineIDFormat.js");

//const createError=required('../utils/error.js');
//const IMAGE_BASE_URL = "http://localhost:5000/image?name=";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuid.v4();
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//Add

exports.add_employee = async (req, res, next) => {
  try {
    let generalDepartment = "";

    const {
      fullname,
      nationality,
      sex,
      id_number,
      email,
      year,
      date_of_birth,
      images,
      phoneNumber,
      optionalNumber,
      emergency_contact,
      hireDate,
      joiningDate,
      employeeCode,
      employeeType,
      accountTitle,
      accountNumber,
      paymentMethod,
      department,
      pension,
      gradeId,
      separationDate,
      basicSalary,
      housingAllowance,
      positionAllowance,
      hardshipAllowance,
      desertAllowance,
      transportAllowance,
      cashIndeminityAllowance,
      fieldAllowance,
      overtimeEarning,
      otherEarning,
      lateSittingOverTime,
      arrears,
      dayDeduction,
      socialSecurity,
      providentFund,
      EOTBDeduction,
      TaxDeduction,
      netSalary,
      position,
      contact_name,
      emergency_contact_Info,
      contact_phoneNumber,
      relationship,
    } = req.body;

    //Get prefix

    const idformat = await IDFormat.find({
      companyName: req.user.id,
    });

    //CHECK GRADEDEFINITION
    const gradeDefinition = await GradeDefinition.find({
      companyId: req.user.id,
      _id: gradeId,
    });

    //GET EMPLOYEE DATA
    const emp = await Employee.find({ companyId: req.user.id });
    console.log(emp.length);
    //console.log(gradeDefinition);
    console.log(gradeDefinition[0]?.monthlySalaryMax);
    console.log(gradeDefinition[0]?.monthlySalaryMin);

    const newDepartment = await Department.find({
      companyName: req.user.CompanyName,
      deptName: "General",
    });

    generalDepartment = mongoose.Types.ObjectId(newDepartment[0]?._id);

    if (!department || department == undefined) {
      console.log("no department");
    }
    const idformat1 = await IDFormat.find({ companyId: req.user.id });

    if (!gradeId) {
      res.status(404).json("please enter employee grade");
    }
    if (!basicSalary) {
      res.status(404).json("Please enter basicsalary");
    }
    //console.log(idformat1)

    if (
      basicSalary < gradeDefinition[0]?.monthlySalaryMin ||
      basicSalary > gradeDefinition[0]?.monthlySalaryMax
    ) {
      res
        .status(404)
        .json(
          "Basicsalary must be between " +
            gradeDefinition[0]?.monthlySalaryMin +
            "  and  " +
            gradeDefinition[0]?.monthlySalaryMax
        );
    } else {
      const newEmployee = await Employee({
        fullname: fullname,
        nationality: nationality,
        sex: sex,
        id_number: idformat1[0]?.prefix
          ? idformat1[0]?.prefix + ("0000" + (emp.length + 1)).slice(-4)
          : "" + ("0000" + (emp.length + 1)).slice(-4),
        email: email,
        department: department ? department : generalDepartment,
        images: images,
        position: position,
        pension: pension,
        phoneNumber: phoneNumber,
        date_of_birth: date_of_birth,
        optionalNumber: optionalNumber,
        password: req.user.CompanyName.substring(0, 4) + "0000",
        emergency_contact_Info: {
          contact_name: contact_name,
          relationship: relationship,
          contact_phoneNumber: contact_phoneNumber,
        },

        hireDate: hireDate,
        joiningDate: joiningDate,
        employeeCode: employeeCode,
        employeeType: employeeType,
        accountTitle: accountTitle,
        accountNumber: accountNumber,
        paymentMethod: paymentMethod,
        separationDate: separationDate,

        //Salary Information

        basicSalary: basicSalary,
        gradeId: gradeId,
        housingAllowance: housingAllowance,
        positionAllowance: positionAllowance,
        hardshipAllowance: hardshipAllowance,
        desertAllowance: desertAllowance,
        transportAllowance: transportAllowance,
        cashIndeminityAllowance: cashIndeminityAllowance,
        fieldAllowance: fieldAllowance,
        overtimeEarning: overtimeEarning,
        otherEarning: otherEarning,
        lateSittingOverTime: lateSittingOverTime,
        arrears: arrears,
        dayDeduction: dayDeduction,
        socialSecurity: socialSecurity,
        providentFund: providentFund,
        EOTBDeduction: EOTBDeduction,
        TaxDeduction: TaxDeduction,
        netSalary: netSalary,
        companyId: req.user.id,
      });

      newEmployee.save(function (err) {
        if (err) return next(err);
        res.status(201).json({
          success: true,
          message: "Employee saved successfully",
          employee: newEmployee,
        });
      });

      const text =
        "Your password is   " +
        req.user.CompanyName +
        "0000" +
        "    please change your password ";

      // await sendEmail({
      //     email: email,
      //     subject: 'You are successfully registed on CoopPayroll SAAS ',
      //     text
      // });
      // res.status(200).json({
      //     status: "success",
      //     message: 'Employee Registered successfully',

      // });
    }
  } catch (err) {
    next(createError.createError(404, err));
  }
};

//GET ALL
exports.get_All_Employee = async (req, res, next) => {
  try {
    const employee = await Employee.find({ companyId: req.user.id })
      .populate("department")
      .populate("allowance")
      // .populate("payroll")
      .populate("deduction")
      .populate("gradeId");

    res.status(200).json({
      count: employee.length,
      employee: {
        name: employee,
      },
    });
  } catch (err) {
    next(createError.createError(404, err));
  }
};

//GET one
exports.get_single_Employee = async (req, res) => {
  try {
    const employee = await Employee.find({
      companyId: req.user.id,
      _id: req.params.id,
    })
      .populate("department")
      .populate("allowance")
      // .populate("payroll")
      .populate("deduction");
    res.status(200).json({
      count: employee.length,
      employee: {
        name: employee.fullname,
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
  } catch (error) {
    res.status(404).json("not working");
  }
};

//DELETE EMPLOYEE
exports.delete_Employee = async (req, res, next) => {
  try {
    const response = await Employee.findByIdAndDelete(req.params.key);

    res.status(200).json({ response });
  } catch (err) {
    next(err);
  }
};

//SEARCH ALL EMPLOYEE
exports.searchAllEmployee = async (req, res, next) => {
  try {
    const query = req.params.id;

    const key = req.params.key;

    const employee = await Employee.find({
      companyId: req.user.id,
      $or: [
        { email: { $regex: new RegExp(query, "i") } },
        { fullname: { $regex: new RegExp(query, "i") } },
        { phoneNumber: { $regex: new RegExp(query, "i") } },
      ],
    })
      .populate("department")
      .populate("allowance")
      .populate("payroll")
      .populate("deduction");
    res.status(200).json({
      count: employee.length,
      employee,
    });
  } catch (err) {
    next(err);
  }
};

//SEARCH BY DEPARTMENT IDD
exports.get_By_Department = async (req, res, next) => {
  try {
    const departmentId = req.params.departmentId;
    let data = "";

    const emp1 = await Employee.find(
      { companyId: req.user.id, department: departmentId },
      { "year.month": 1 }
    );

    await Employee.find({
      companyId: req.user.id,
      department: departmentId,
    })
      .exec()
      .then((docs) => {
        const other = docs.map((doc) => {
          return {
            _id: doc._id,
            name: doc.fullname,
            department: doc.department,
            companyId: doc.companyId,
            year: doc.year,
          };
        });
        data = other;
      });

    res.status(200).json({
      data,
    });
  } catch (err) {
    next(err);
  }
};

exports.getbydept = async (req, res, next) => {
  try {
    const query = req.query.department;
    const employee = await Employee.find({
      $and: [
        { companyId: req.user.id },
        {
          department: query,
        },
      ],
    })
      .populate("department")
      .populate("allowance")
      .populate("payroll")
      .populate("deduction");

    res.status(200).json({
      count1: employee.length,
      employee: employee,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateEmploye = async (req, res, next) => {
  const employeeId = req.params.employeeId;
};

//set role
exports.setApprovers = async (req, res, next) => {
  try {
    const approvers = await Employee.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { role: "approver" } },
      { new: true }
    );

    res.status(200).json({
      approvers,
    });
  } catch (err) {
    createError.createError(404, err);
  }
};

//pension

exports.updatePension = async (req, res, next) => {
  try {
    //const employee=await Employee.find({companyId:req.user.id});
    const employee = await Employee.updateMany(
      { companyId: req.user.id },
      { $set: { pension: req.body.pension } }
    );
  } catch (err) {
    createError.createError(404, err);
  }
};

exports.updatePensionByDepartment = async (req, res, next) => {
  try {
    const employee = await Employee.updateMany(
      { companyId: req.user.id, department: req.params.departmentId },
      { $set: { pension: req.body.pension } }
    );
  } catch (err) {
    createError.createError(404, err);
  }
};

//Fetch employee using year month and department

exports.get_emp_by_year_month = async (req, res, next) => {
  try {
    departmentId = req.query.department;
    year = req.query.year;
    month = req.query.month;

    const employee = await Employee.find({
      companyId: req.user.id,
      department: departmentId,
      "year.name": "2023",
      "year.month.name": "July",
    })
      .populate("allowance")
      .populate("payroll")
      .populate("deduction");
    res.status(200).json({
      employee: employee[0].year[0].month,
    });
  } catch (err) {
    createError.createError(404, err);
  }
};

//Get Approved Payroll

exports.get_Pending_Payroll = async (req, res, next) => {
  try {
    let data = "";
    let data1 = "";

    const departmentId = req.params.departmentId;

    await Employee.find({ companyId: req.user.id, department: departmentId })
      .exec()
      .then((docs) => {
        const other = docs.map((doc) => {
          return {
            _id: doc._id,
            arrears: doc.arrears,
            lateSittingOverTime: doc.lateSittingOverTime,
            dayDeduction: doc.dayDeduction,
            EOTBDeduction: doc.EOTBDeduction,
            department: doc.department,
            companyId: doc.companyId,
            payrollStatus: doc.payrollStatus,
            year: doc.year,
            // month: monthArray?.map((item) => item[0]?.name),
          };
        });
        // }

        data = other;
      });
    try {
      console.log("data length:", data.length);
      for (var i = 0; i < data.length; i++) {}
      res.status(200).json("done");
    } catch (err) {
      createError.createError(404, err);
    }
  } catch (err) {
    next(err);
  }
};

const signToken = (id) => {
  try {
    return jwt.sign({ id }, "secret", {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // const patientID = patient._id;
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    secure: process.env.NODE_ENV === "production" ? true : false,
    httpOnly: true,
  };

  //remove password from the output
  user.password = undefined;
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    message: "successful",
    token,

    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if email and password exist company code
    if (!email || !password) {
      return next(
        createError.createError(
          404,
          "please provide email, password or company code!"
        )
      ); //res
      //   .status(404)
      //   .json({ message: 'please provide email, password or company code' });
    }
    //check if user exists and password is correct
    const user = await Employee.findOne({ email })
      .select("+password")
      .populate("customRole");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email, password " });
      //next(createError.createError(401,'Incorrect email, password or company Code'))
    }

    // const token=signToken(user._id);
    //if everything is ok send token to the client
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(404).json({
      status: "fail123",
      message: err,
    });
  }
};

//APPROVE PAYROLL
exports.approvePayroll = async (req, res, next) => {
  try {
    res.status(200).json("hello");
  } catch (err) {
    res.status(404).json(err);
  }
};

//Get Employee Information
exports.getEmployeeInformation = async (req, res, next) => {
  try {
    const employee = await Employee.find({
      _id: req.user.id,
      companyId: req.user.companyId,
    });

    res.status(200).json({
      id: employee[0]._id,
      name: employee[0].fullname,
      payslip: employee[0].payslip,
    });
  } catch (err) {
    res.status(404).json(err);
  }
};

//Import from Excel
const xlsx = require("xlsx");
const storage4 = multer.memoryStorage();
// create instance of multer and specify storage engine
const upload4 = multer({ storage: storage4 }).single("file");
exports.createEmployeeFile = async (req, res, next) => {
  let generalDepartment = "";

  const newDepartment = await Department.find({
    companyName: req.user.CompanyName,
    deptName: "General",
  });

  generalDepartment = mongoose.Types.ObjectId(newDepartment[0]?._id);

  if (!department || department == undefined) {
  }

  upload4(req, res, async (err) => {
    if (err) {
      next(err);
    } else {
      try {
        const workbook = xlsx.read(req?.file?.buffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        const numRecords = data.length;
        const emails = [];
        const employeData = data.map((row) => ({
          fullname: row["fullname"],
          nationality: row["nationality"],
          phoneNumber: row["phoneNumber"],
          email: row["email"],
          accountNumber: row["Account Number"],
          date_of_birth: row["date_of_birth"],
          sex: row["sex"],
          department: row["department"] ? row["department"] : generalDepartment,
          id_number: row["id_number"],
          basicSalary: row["basicSalary"],
          companyId: req.user.id,
          password: req.user.CompanyName.substring(0, 4) + "0000",
          emails: emails.push(row["email"]),
        }));

        const newEmp = await Employee.insertMany(
          employeData,
          async function (err) {
            if (err) {
              console.log("error");
              res
                .status(404)
                .json({
                  message:
                    "please check every employee has unique email address",
                });
            } else {
              // console.log(employeData);
              console.log("Data imported successfully!");
              const text =
                "Your password is   " +
                req.user.CompanyName +
                "0000" +
                "    please change your password ";

              for (i = 0; i < employeData.length; i++) {
                // await sendEmail({
                //     email: emails[i],
                //     subject: 'You are successfully registed on CoopPayroll SAAS ',
                //     text
                // });
              }
              res.status(200).json({
                status: "success",
                message: "Employee Registered successfully",
              });
            }
          }
        );

        //  const text = 'Your password is   ' + req.user.CompanyName + '0000' + '    please change your password ';
      } catch (error) {
        res
          .status(404)
          .json({
            message: "1please check every employee has unique email address",
          });
      }
    }
  });
};

exports.sendEmail = async (req, res, next) => {
  try {
    // let testAccount = await nodemailer.createTestAccount();
    var transporter = nodemailer.createTransport({
      //service: "hotmail",
      service: "gmail",
      //port: 587,//Yahoo
      port: 465, //Gmail
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: "mfzyfdiaxqnwmzqi",
        // user: "gemechubulti@outlook.com",
        // pass: 'gemechu@outlook@11',
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      // to:'milkessagabai@gmail.com',
      // to:'etanaalemunew@gmail.com',
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      // to: 'geme11.bulti@gmail.com',
      // subject: 'Thank You for Your Kindness!',
      // text: "Thank you so much for your patience. I'm sorry it took so long for me to get back to you I truly appreciate your understanding and willingness to wait It was a difficult situation, and I'm glad you were so understanding I want to thank you again for your patience It was much appreciated and it helped me a lot It's hard to ask for help but it's even harder to wait Thank you for making it easier Your kindness is much appreciated Thank you for being so understanding ",
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        next(error);
        // res.status(404).json(error);
      } else {
        console.log("Email sent: " + info.response);
        res.status(250).json(info.response);
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.grantPermission = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    const employee = await Employee.find({
      companyId: req.user.id,
      _id: req.params.id,
    });
    // Get the current value of the permission
    const currentValue = employee[0].permissions[key][value];

    // Use the $bit operator to toggle the value
    const newValue = !currentValue;

    console.log(newValue);

    ////  $set: { [`permissions.${key}.${value}`]: true }
    await Employee.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: { [`permissions.${key}.${value}`]: newValue },
      },

      { new: true }
    );

    // function (err, doc) {
    //     if (err) {
    //         console.log('Error updating user permissions:', err);
    //         res.status(404).json("Error updating user permissions")
    //     } else {
    //         console.log('User permissions updated successfully:', doc);
    //        res.status(200).json(doc);
    //     }
    // });
    res.status(200).json("Done ");
  } catch (err) {
    res.status(404).json(err);
  }
};
