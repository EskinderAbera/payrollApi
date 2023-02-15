const Department = require('../models/department.js');
const Employee = require('../models/employee.js');

exports.add_dept = async (req, res) => {

  try {
    const employeeId = req.params.employeeId;
    const {

      deptName,
      location
    } = req.body;
    //companyName,
   // const departmentName = await Department.find({deptName:deptName,companyName: req.user.CompanyName});

    const departmentName = await Department.find({
      $and: [ { companyName:req.user.CompanyName },{ deptName: deptName },],}
    );
const len=departmentName.length;
    console.log(departmentName)
    if (len===0) {
          const newDept = await Department.create({
        companyName: req.user.CompanyName,
        deptName: deptName,
        location: location
      });
      //const savedDept = await newDept.save();
      console.log(req.body);

      res.status(200).json({ newDept });
    }
    else{
      res.status(404).json('already entered')
    }
   
  } catch (err) {
    res.status(404).json({
      error: 'Department name cannot be the same',
    });
  }
};

//GET ALL
exports.get_All_Dept = async (req, res, next) => {
  const failed = true;
  // if(failed) return next(createError(401,"You are not authenticated"));

  try {
    const depts = await Department.find({companyName: req.user.CompanyName});
    res.status(200).json({
      count: depts.length,
      depts,
    });
  } catch (err) {
    next(err);
  }
};
//GET SINGLE DEPT
exports.get_singe_Dept = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    res.status(200).json(dept);
  } catch (error) {
    res.status(500).json(error);
  }
};
//UPDATE

exports.updateDept = async (req, res) => {
  try {
    const updatedDept = await Department.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedDept);
  } catch (error) { }
};
//DELETE
exports.delete_Dept = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json('Department has been deleted');
  } catch (error) {
    res.status(500).json(error);
  }
};

//SEARCH BY DEPARTMENT IDD

exports.search_By_Department = async (req, res) => {
  const departmentId = req.params.departmentId;
  try {
  } catch (err) {
    next(err);
  }
};
//SEARCH DEPARTMENT

exports.searchDepartment = async (req, res, next) => {
  try {
    const key = req.params.key;

    const department = await Department.find(
      {
        $and: [{ deptName: { $regex: new RegExp(key, 'i'), } },],

      }
    );
    res.status(200).json({
      count: department.length,
      department: department,
    });
  } catch (err) {
    next(err);
  }
}