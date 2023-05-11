const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel.js");
const customRole = require("../models/customRole.js");
const Employee = require("../models/employee.js");

//Check

exports.checkPermissions = ({ name, value }) => {
  // console.log('per', permission.name)
  return function (req, res, next) {
    // console.log("permission",permission)
    // console.log(name, value)
    // console.log('hello', req.user.role)
    if (req.user.role === "employee") {
      // Get the user's permissions from the database
      const userPermissions = req.user.permissions;

      // console.log("userPermissions", userPermissions);
      console.log("permission", userPermissions[`${name}`][`${value}`]);
      // console.log("first",userPermissions[permission])
      // Check if the user has the required permission
      if (userPermissions[`${name}`][`${value}`]) {
        // User has permission, allow access to the route
        next();
      } else {
        // User does not have permission, deny access to the route
        res.status(403).send("Access denied");
      }
    } else {
      next();
    }
  };
};

//Verification
exports.protectUser = async (req, res, next) => {
  try {
    //getting token check if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token || token === "expiredtoken") {
      return res.status(401).json({
        message: "You are not logged in, please log in to get access",
      });
    }
    //console.log(token);
    //console.log(process.env.JWT_CODE);
    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_CODE);

    //check if user still exists
    let currentUser;
    currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      currentUser = await Employee.findById(decoded.id);
      if (!currentUser) {
        return res.status(401).json({ message: "user does not longer exists" });
      }
    }
    //check if user change password after jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "user recently changed password! please log in again.",
      });
    }
    //grant access to protected route
    req.user = currentUser;

    next();
  } catch (err) {
    res.status(404).json({
      status: "Error occured",
      message: err,
    });
  }
};

//Verification
// exports.protect = async (req, res, next) => {
//   try {
//     //getting token check if its there
//     let token;
//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies.jwt) {
//       token = req.cookies.jwt;
//     }
//     if (!token || token === "expiredtoken") {
//       return res.status(401).json({
//         message: "You are not logged in, please log in to get access",
//       });
//     }
//     //console.log(token);
//     //console.log(process.env.JWT_CODE);
//     //verification token
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_CODE);

//     //check if user still exists
//     const currentUser = await User.findById(decoded.id);

//     if (!currentUser) {
//       return res.status(401).json({ message: "user does not longer exists" });
//     }
//     //check if user change password after jwt was issued
//     if (currentUser.changedPasswordAfter(decoded.iat)) {
//       return res.status(401).json({
//         message: "user recently changed password! please log in again.",
//       });
//     }
//     //grant access to protected route
//     req.user = currentUser;

//     next();
//   } catch (err) {
//     res.status(404).json({
//       status: "Error occured",
//       message: err,
//     });
//   }
// };

//Verification
exports.protect = async (req, res, next) => {
  try {
    //getting token check if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token || token === "expiredtoken") {
      return res.status(401).json({
        message: "You are not logged in, please log in to get access",
      });
    }
    //console.log(token);
    //console.log(process.env.JWT_CODE);
    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_CODE);

    //check if user still exists
    let currentUser;
    currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      currentUser = await Employee.findById(decoded.id).populate("customRole");
      if (!currentUser)
        return res.status(401).json({ message: "user does not longer exists" });
    }
    //check if user change password after jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "user recently changed password! please log in again.",
      });
    }
    //grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(404).json({
      status: "Error occured",
      message: err,
    });
  }
};

//Restricted to
exports.restrictTo = (roles) => {
  return async (req, res, next) => {
    // console.log("employee user", JSON.stringify(req.user, null, 3));
    // let user;
    // user = await User.findById({ _id: req.user._id });

    // if (!user) {
    //   user = await Employee.findById({ _id: req.user._id }).populate(
    //     "customRole"
    //   );
    // }

    // console.log("user", req.user.companyId);

    if (req.user.role === "Companyadmin") {
      next();
    } else {
      const permissions = req.user.customRole[0].permissions.find(
        (per) => per.module === Object.keys(roles).toString()
      );
      if (permissions[Object.values(roles)]) {
        next();
      } else {
        return res.status(403).json({
          message: "You do not have permission to perform this action",
        });
      }
    }
  };
};

//Restricted to
exports.restrictToA = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

//Verify Employee
exports.protectE = async (req, res, next) => {
  try {
    //getting token check if its there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token || token === "expiredtoken") {
      return res.status(401).json({
        message: "You are not logged in, please log in to get access",
      });
    }
    console.log(token);
    console.log(process.env.JWT_CODE);
    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_CODE);
    // console.log(decoded.id);
    //check if user still exists
    const currentUser = await Employee.findById(decoded.id);

    console.log(currentUser);

    if (!currentUser) {
      return res.status(401).json({ message: "user does not longer exists" });
    }
    //check if user change password after jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "user recently changed password! please log in again.",
      });
    }
    //grant access to protected route
    req.user = currentUser;
    // console.log(currentUser);
    next();
  } catch (err) {
    res.status(404).json({
      status: "Error occured",
      message: err,
    });
  }
};
