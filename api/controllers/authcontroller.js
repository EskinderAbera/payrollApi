const crypto = require('crypto');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const sendEmail = require('../utils/email.js');
const createError = require('../utils/error.js');
const { signedCookies } = require('cookie-parser');
const moment = require("moment");
const Package=require('../models/Package.js')
// const { create } = require('../models/userModel.js');
const {calculateNextPayment} =require('../utils/Helper.js');
const nodemailer=require('nodemailer')


const signToken = (id) => {
  try {
    return jwt.sign({ id }, 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((element) => {
    if (allowedFields.includes(element)) newObj[element] = obj[element];
  });
  return newObj;
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  console.log(user._id);
  // const patientID = patient._id;
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),

    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  };
  //console.log(user);

  //remove password from the output
  user.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    message: 'successful',
    token,
    //patientID,
    data: {
      user,
    },
  });
};


const addTrial= async(email,status,res)=>{

  
   const userEmail=newUser.email;
   console.log(email);
     let nextpaymentDate;
     let date = Date.now();
    nextpaymentDate = await calculateNextPayment('Trial', date);

     const updateUser = await User.findOneAndUpdate(
     { email},
     { $set: { isTrial: 'true',next_payment_date:nextpaymentDate} },
     { new: true }
   );
  res.status(status).json({updateUser});
}

//Trial registration

exports.trialRegistration=async(req,res,next)=>{
  
  try {
    const {
      email,
      password,
      Name,
      address,
      phoneNumber,
      numberOfEmployee,
      CompanyName,
      jobTitle,
      companyCode,
      isApproved,
      
    } = req.body;
    const user = await User.findOne({ email });
    // console.log(user.isTrial);
    if (user)
      return next(createError.createError(404, 'Email is already provided!'));
    //  console.log(user);
    let nextpaymentDate;
    let date = Date.now();
    nextpaymentDate = await calculateNextPayment('Trial', date);
    startDate=moment(Date.now());
      const newUser = await User.create({
      Name: Name,
      email: email,
      password: password,
      companyCode: companyCode,
      address: address,
      phoneNumber: phoneNumber,
      numberOfEmployee: numberOfEmployee,
      CompanyName: CompanyName,
      jobTitle: jobTitle,
      isTrial:true,
      next_payment_date:nextpaymentDate,
      startDate:startDate
     
    });
   
   // console.log(newUser);
    res.status(200).json({
          status: 'Success',
          message:"Trial period is provided to you ",
        
          data: {
            user: newUser,
          }}
    );
 
   
  } catch (err) {
    next(createError.createError(404, 'fail'));
    // res.status(404).json({
    //   status: 'fail',
    //   message: err,
    // });
  }

}


exports.packageRegistration=async(req,res,next)=>{
  try {
    const {
      email,
      password,
      Name,
      address,
      phoneNumber,
      numberOfEmployee,
      CompanyName,
      jobTitle,
      companyCode,
      isApproved,
      
    } = req.body;
    const user = await User.findOne({ email });
    // console.log(user.isTrial);
    if (user)
      return next(createError.createError(404, 'Email is already provided!'));
    //  console.log(user);

    const packageId=req.params.packageId;
    const packageInfo = await Package.findOne({ _id: packageId });
    const packageType=packageInfo.name;
    console.log(packageType);
    let nextpaymentDate;
    let date = Date.now();
    nextpaymentDate = await calculateNextPayment(packageType, date);
    startDate=moment(Date.now());
      const newUser = await User.create({
      Name: Name,
      email: email,
      password: password,
      companyCode: companyCode,
      address: address,
      phoneNumber: phoneNumber,
      numberOfEmployee: numberOfEmployee,
      CompanyName: CompanyName,
      jobTitle: jobTitle,
     
      next_payment_date:nextpaymentDate,
      startDate:startDate,
      packageId:packageId
     
    });
   
   // console.log(newUser);
    res.status(200).json({
          status: 'Success',
          message:"Thank you for your subscription ",
        
          data: {
            user: newUser,
          }}
    );
 
   
  } catch (err) {
    next(createError.createError(404, 'fail'));
   
  }
}
exports.signup = async (req, res, next) => {
  try {
    const {
      email,
      password,
      Name,
      address,
      phoneNumber,
      numberOfEmployee,
      CompanyName,
      jobTitle,
      companyCode,
      isApproved,
    } = req.body;
    const user = await User.findOne({ email });
    if (user)
      return next(createError.createError(404, 'Email is already provided!'));
    const newUser = await User.create({
      Name: Name,
      email: email,
      password: password,
      companyCode: companyCode,
      address: address,
      phoneNumber: phoneNumber,
      numberOfEmployee: numberOfEmployee,
      CompanyName: CompanyName,
      jobTitle: jobTitle,
    });
    console.log(newUser);
    //createSendToken(newUser,201,res)
    // const token=jwt.sign({id:newUser._id},'secret',{
    //   expiresIn: '90d'
    // });
    res.status(201).json({
      status: 'success',
      // token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    next(createError.createError(404, 'fail'));
    // res.status(404).json({
    //   status: 'fail',
    //   message: err,
    // });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, companyCode } = req.body;
    console.log(email);
    console.log(password);
    //check if email and password exist company code
    if (!email || !password || !companyCode) {
      return next(
        createError.createError(
          404,
          'please provide email, password or company code!'
        )
      ); //res
      //   .status(404)
      //   .json({ message: 'please provide email, password or company code' });
    }
    //check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');

    console.log(user.companyCode);
    if (
      !user ||
      user.companyCode != companyCode ||
      !(await user.correctPassword(password, user.password))
    ) {
      return res
        .status(401)
        .json({ message: 'Incorrect email, password or company Code' });
      //next(createError.createError(401,'Incorrect email, password or company Code'))
    }

    // const token=signToken(user._id);
    //if everything is ok send token to the client
    createSendToken(user, 200, res);
    // res.status(200).json({
    //   status: 'success',
    // token,
    //   data: {
    //     user: user
    //   },
    // });
  } catch (err) {
    //next(createError.createError(404, 'failed'));
    res.status(404).json({
      status: 'fail123',
      message: err,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    //getting token check if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token || token === 'expiredtoken') {
      return res.status(401).json({
        message: 'You are not logged in, please log in to get access',
      });
    }

    //verification token
    const decoded = await promisify(jwt.verify)(token, 'secret');

    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'user does not longer exists' });
    }
    //check if user change password after jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: 'user recently changed password! please log in again.',
      });
    }
    //grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};


//UPDATE COMPANY

exports.updateCompany=async (req,res,next)=>{

  try {
    const updatedCompany = await User.findByIdAndUpdate(
      req.params.companyId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedCompany);
  } catch (error) {}



}
//Get ALL COMPANY
exports.getAllCompany = async (req, res, next) => {
  try {
    const user = await User.find({ role: { $ne: 'superAdmin' } });

    res.status(200).json({
      count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

//GET PENDING COMPANY
exports.getAllPendingCompany = async (req, res, next) => {
  try {
    const user = await User.find({
      $and: [{ status: 'pending' }, { role: { $ne: 'superAdmin' } }],
    });

    res.status(200).json({
      count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};
//GET Active COMPANY
exports.getAllActiveCompany = async (req, res, next) => {
  try {
    const user = await User.find({
      $and: [{ status: 'active' }, { role: { $ne: 'superAdmin' } }],
    });

    res.status(200).json({
      count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};
//SEARCH PENDING COMPANY
exports.searchPendingCompany = async (req, res, next) => {
  try {
    const key = req.params.key;
    
    const user = await User.find(
      {
        $and: [{ status: 'pending' }, {CompanyName:{$regex: new RegExp(key,'i'), }}, { role: { $ne: 'superAdmin' } }],
      
      }
    );
    res.status(200).json({
       count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.querySearch = async (req, res, next) => {
  try {
    const key = req.params.key;
    console.log(req.query.CompanyName);
    const cm=req.query.CompanyName;
    const user = await User.find(
      {
        $and: [{ status: 'pending' }, {CompanyName:{$regex: new RegExp(cm,'i'), }}, { role: { $ne: 'superAdmin' } }],
      
      }
    );
    res.status(200).json({
       count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

//SEARCH ACTIVE COMPANY
exports.searchActiveCompany = async (req, res, next) => {
  try {
    const key = req.params.key;
    

    const user = await User.find(
      {
        $and: [{ status: 'active' }, {CompanyName:{$regex: new RegExp(key,'i'), }}, { role: { $ne: 'superAdmin' } }],
      
      }
    );
    res.status(200).json({
       count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};


//SEARCH ALL COMPANY 

exports.searchAllCompany= async (req, res, next) => {
  try {
    const key = req.params.key;
    

    const user = await User.find(
      {
        $and: [ {CompanyName:{$regex: new RegExp(key,'i'), }}, { role: { $ne: 'superAdmin' } }],
      
      }
    );
    res.status(200).json({
       count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

//SEARCH ACTIVE COMPANY
exports.searchActiveCompany = async (req, res, next) => {
  try {
    const key = req.params.key;
    

    const user = await User.find(
      {
        $and: [{ status: 'active' }, {CompanyName:{$regex: new RegExp(key,'i'), }}, { role: { $ne: 'superAdmin' } }],
      
      }
    );
    res.status(200).json({
       count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};
//Approve COMPANY
exports.approveCompany = async (req, res, next) => {
  try {
    const email = req.body.email;
    console.log(email);
    const approveCompany = await User.findOneAndUpdate(
      { email },
      { $set: { isApproved: 'true', status: 'active' } },
      { new: true }
    );
    // const user = await User.find({"$and": [{status: "active"}, { role: { $ne: 'superAdmin' }}]});

    res.status(200).json({
      approveCompany: approveCompany.isApproved,
    });
  } catch (err) {
    next(err);
  }
};

//Block COMPANY
exports.blockCompany = async (req, res, next) => {
  try {
    const email = req.body.email;
    console.log(email);
    const blockedCompany = await User.findOneAndUpdate(
      { email },
      { $set: { status: 'blocked' } },
      { new: true }
    );
    // const user = await User.find({"$and": [{status: "active"}, { role: { $ne: 'superAdmin' }}]});

    res.status(200).json({
      blockedCompany: blockedCompany,
    });
  } catch (err) {
    next(err);
  }
};


//UNBLOCK COMPANY
exports.unblockCompany = async (req, res, next) => {
  try {
    const email = req.body.email;
    console.log(email);
    const company = await User.findOneAndUpdate(
      { email },
      { $set: { status: 'pending' } },
      { new: true }
    );
    // const user = await User.find({"$and": [{status: "active"}, { role: { $ne: 'superAdmin' }}]});

    res.status(200).json({
      company: company,
    });
  } catch (err) {
    next(err);
  }
};


//GET ALL BLOCKED COMPANY

exports.getAllBlockedCompany = async (req, res, next) => {
  try {
    const user = await User.find({
      $and: [{ status: 'blocked' }, { role: { $ne: 'superAdmin' } }],
    });

    res.status(200).json({
      count: user.length,
      user: user,
    });
  } catch (err) {
    next(err);
  }
};


//Unapprove COMPANY
exports.unApproveCompany = async (req, res, next) => {
  try {
    const email = req.body.email;
    console.log(email);
    const approveCompany = await User.findOneAndUpdate(
      { email },
      { $set: { isApproved: 'false' } },
      { new: true }
    );
    // const user = await User.find({"$and": [{status: "active"}, { role: { $ne: 'superAdmin' }}]});

    res.status(200).json({
      approveCompany: approveCompany.isApproved,
    });
  } catch (err) {
    next(err);
  }
};

//APPROVE COMPANY PAYMENT
exports.approveCompanyPayment = async (req, res, next) => {
  try {
    const email = req.body.email;
    console.log(email);
    const approveCompanyPayment = await User.findOneAndUpdate(
      { email },
      { $set: { isPaid: 'true' } },
      { new: true }
    );


      try {
        await sendEmail({
          email: email,
          subject: 'Your password reset token (valid for 10 min)',
        message,
        });
        res.status(200).json({
          status: 'success',
          message: 'Token sent to email',
        });
    } catch (error) {
      res.status(404).json({
        err
      })
      
    }
    // const user = await User.find({"$and": [{status: "active"}, { role: { $ne: 'superAdmin' }}]});

   
  } catch (err) {
    next(createError(404, err));
  }
};

exports.sendEmail=async (req,res,next)=>{
  
  try {
    // let testAccount = await nodemailer.createTestAccount();
    var transporter = nodemailer.createTransport({
      //service: "hotmail",
      service: 'gmail',
      //port: 587,//Yahoo
      port :465,//Gmail
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: 'mfzyfdiaxqnwmzqi',
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
        console.log(error.message);
        next(error);
       // res.status(404).json(error);
      } else {
        console.log('Email sent: ' + info.response);
        res.status(250).json(info.response);
      }
    });
  } catch (error) {
   next(error)
  }
  
}



//APPROVE COMPANY PAYMENT
exports.approveCompanyPayment = async (req, res, next) => {
      const text='Lorem, ipsum dolor sit amet consectetur adipisicing elit. Obcaecati voluptates accusantium eveniet voluptatum delectus, facere modi quis cupiditate maiores. Soluta, obcaecati enim consequuntur voluptatibus eos vitae fugit exercitationem officiis excepturi.'

  try {
    const email = req.body.email;
    console.log(email);
    const approveCompanyPayment = await User.findOneAndUpdate(
      { email },
      { $set: { isPaid: 'true' } },
      { new: true }
    );
    try {
      await sendEmail({
        email: email,
        subject: 'Thank you for your subscription',
        text
      });
      res.status(200).json({
        status: 'success',
        message: 'Message  sent to email',
      });
    } catch (err) {
   
      return res.status(500).json({
        message: 'There was an error sending the email. Try again later!',
      });
    }
    // const user = await User.find({"$and": [{status: "active"}, { role: { $ne: 'superAdmin' }}]});

   
  } catch (err) {
    next(err);
  }
};
//

//Restricted to
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
/////////
exports.forgotPassword = async (req, res, next) => {
  try {
    // get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!req.body.email) {
      return res.status(400).json({ message: 'please provide an email' });
    }
    if (!user) {
      return res
        .status(404)
        .json({ message: 'There is no user with this email address' });
    }
    //generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    ///send it to users email
    const resetURL = `${req.protocol}://localhost:4000/auth/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your
     new password and confirmPassword to ${resetURL}
     If you didn't forgot your password, please ignore this email`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        message: 'There was an error sending the email. Try again later!',
      });
    }
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
////
exports.resetPassword = async (req, res, next) => {
  try {
    //get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    //id token has not expired and there is user set the new password
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Token is invalid or has expired' });
    }
    user.password = req.body.password;
    //  user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    // update changedPasswordAt property for the user

    // log the user in, send jwt
    // createSendToken(user, 200, res);
    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

///

exports.updatePassword = async (req, res, next) => {
  try {
    console.log(hello);

    //   //get user from collection
    //   const user = await User.findById('req.user.id').select('+password');
    //   console.log(req.user.id);
    //   //check if posted password is correct
    //   if (!user.correctPassword(req.body.currentPassword, user.password)) {
    //     return res
    //       .status(401)
    //       .json({ message: 'Your current password is not correct' });
    //   }
    //   //id so, update the password
    //   user.password = req.body.password;
    //   console.log(req.body.password)
    //   // user.confirmPassword = req.body.confirmPassword;
    //   await user.save();
    //   //log the user in, send JWT
    //  // createSendToken(user, 200, res);

    // const token=signToken(user._id);
    // res.status(200).json({
    //  status:'success',
    //  token
    // })
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    //create error if user post password data
    if (req.body.password || req.body.confirmPassword) {
      res.status(400).json({
        message:
          'This route is not for password update. please use updateMyPassword for password update',
      });
    }
    //filter object
    const filteredBody = filterObj(req.body, 'email');
    //update user document data
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
    next();
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: {
      user: null,
    },
  });
};

exports.searchCompanyByName


exports.logout = async (req, res) => {
  
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    secure: process.env.NODE_ENV === 'production' ? true : false,
    httpOnly: true,
  };
 // console.log(req.headers.authorization.split(' ')[1]);
  res.cookie('jwt', 'expiredtoken', cookieOptions);
  

  res.status(200).json({
    status: 'success',
    message: 'logged out successfully',
  });
};
