var express = require('express');
var router = express.Router();

require("../models/connection");
const Produit = require('../models/produit');
//const Enseigne = require('../models/enseigne');


/*
Route : GET - Get product details - /produit/:id
IN : body = {  }
Returns : 
    OK = { result: true, produit: {produit_details} }
    KO = { result: false, error: error_message }

Description : This route retrieves a product details
*/
router.get('/:productId', async function (req, res, next) {
    try {
      const excludedFields = { 
        _id: false,
      };
      const productDetails = await Produit.find({
        _id: req.params.productId
      }, excludedFields).populate('enseigne');
      
      if (productDetails.length === 0){
        res.json({result: false, error: `Product with id ${req.params.productId} does not exist`});
        return;
      }

      res.json({ result: true, user: productDetails[0] });

    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

/*
Route : GET - Get all products with details - /produit
IN : body = {  }
Returns : 
    OK = { result: true, produits: [{produit_details}] }
    KO = { result: false, error: error_message }

Description : This route retrieves a product details
*/
router.get('/', async function (req, res, next) {
    try {
      const productDetails = await Produit.find({}).populate('enseigne');
      
      if (productDetails.length === 0){
        res.json({result: false, error: `No produuit present in the DB`});
        return;
      }
      res.json({ result: true, user: productDetails });
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

module.exports = router;