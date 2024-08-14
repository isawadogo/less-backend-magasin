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

      res.json({ result: true, produit: productDetails[0] });

    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

/*
Route : GET - Get all products with details - /produit?page=page_number&limit=number_per_page
IN : body = 
Returns : 
    OK = { result: true, produits: [{produit_details}], page: page_requested, totalPages: Number_of_pages, totalProduits: total_number_of_produits }
    KO = { result: false, error: error_message }

Description : This route retrieves a product details
*/
router.get('/', async function (req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  try {
    const productDetails = await Produit.find({}).limit(limit).skip(offset).populate('enseigne');
      
    if (productDetails.length === 0){
      res.json({result: false, error: `No produuit present in the DB`});
      return;
    }
    const totalProduits = await Produit.countDocuments({});
    const totalPages = Math.ceil(totalProduits / limit);

    res.json({ result: true, produit: productDetails, page, totalPages, totalProduits });
  } catch(err) {
    console.error(err.stack);
    res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
    next(err);
  }
});

module.exports = router;