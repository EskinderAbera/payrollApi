const express = require('express');
const router = express.Router();
const taxSlabController = require('../controllers/taxSlab.js');

const middleware=require('../middleware/auth.js')

//CREATE
//router.post('/:payrollId', taxSlabController.add_TaxSlab);
//UPDATE
// router.put('/:id/payrollId',taxSlabController.updateTaxSlab),
  //DELETE
  router.delete('/:id/:payrollId',
  middleware.protect,
middleware.restrictTo('Companyadmin'),  
taxSlabController.delete_TaxSlab);



//DELETE
router.delete('/:id',
  middleware.protect,
  middleware.restrictTo('Companyadmin'),
  taxSlabController.delete_SINGLE_TAXSLAB);

//GET SINGLE Payroll
router.get('/find/:id',
middleware.protect,
middleware.restrictTo('Companyadmin'),

taxSlabController.get_single_TaxSlab);
// //GET ALL 
router.get('/',

middleware.protect,
middleware.restrictTo('Companyadmin'),
taxSlabController.get_All_TaxSlab);
router.post('/:payrollId',
middleware.protect,
middleware.restrictTo('Companyadmin'),
taxSlabController.add_taxslab);


//ADD GENERAL TAXSLAB
router.post('/general',
  middleware.protect,
  middleware.restrictTo('superAdmin'),
  taxSlabController.generalTaxslab)


router.post('/', 
middleware.protect,
middleware.restrictTo('Companyadmin'),
taxSlabController.add_only_taxslab);
//add Existing taxslab on payroll
router.put('/:payrollId/:taxslabId',

middleware.protect,
middleware.restrictTo('Companyadmin'),

taxSlabController.add_taxslab_on_payroll)
module.exports = router;
