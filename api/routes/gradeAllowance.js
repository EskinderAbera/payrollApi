const express = require('express');
const router = express.Router();
const allowanceController = require('../controllers/gradeAllowance.js');
const middleware = require('../middleware/auth.js')
//ADD ALLOWANCE
router.post('/',
    middleware.protect,
    middleware.restrictTo('Companyadmin'),
    allowanceController.add_Allowance);

   

//CREATE
router.put('/:gradeId',
    middleware.protect,
    middleware.restrictTo('Companyadmin'),
    allowanceController.Add_Allowance_to_Grade);


    router.put('/update/:id',
    
        middleware.protect,
        middleware.restrictTo('Companyadmin'),
        allowanceController.updateAllowances);
    
    

//UPDATE
router.post('/:gradeId/:id',
    middleware.protect,
    middleware.restrictTo('Companyadmin'),
    allowanceController.Update_Allowances),


    ///DELETE
    router.delete('/:gradeId/:allowanceId',
        middleware.protect,
        middleware.restrictTo('Companyadmin'),
        allowanceController.delete_Allowances);

//GET ONE
router.get('/:id',
    middleware.protect,
    middleware.restrictTo('Companyadmin'),
    allowanceController.get_single_Allowance);
//GET ALL 
router.get('/',

    middleware.protect,
    middleware.restrictTo('Companyadmin'),
    allowanceController.get_All_Allowance);

//ADD EXISTING ALLOWANCE TO EMPLOYEE
router.put('/add/:gradeId/:allowanceId', middleware.protect,
    middleware.restrictTo('Companyadmin'), allowanceController.addExistingAllowances);

//DELETE Allowance
  router.delete('/:id',
    middleware.protect,
    middleware.restrictTo('Companyadmin'),
    allowanceController.delete_from_allowancecollection_Allowances);


//UPDATE
router.put('/update/:gradeId/:allowanceId',
middleware.protect,
middleware.restrictTo('Companyadmin'), 
allowanceController.updateGradeandAllowance);

module.exports = router;
