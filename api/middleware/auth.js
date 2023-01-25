const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User=require('../models/userModel.js')
//Verification
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
      console.log(token);
      console.log(process.env.JWT_CODE);
      //verification token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_CODE);
      console.log(decoded.id);
      //check if user still exists
      const currentUser = await User.findById(decoded.id);
      //    console.log(currentUser);
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
      console.log(currentUser);
      next();
    } catch (err) {
      res.status(404).json({
        status: 'Error occured',
        message: err,
      });
    }
  };
  
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