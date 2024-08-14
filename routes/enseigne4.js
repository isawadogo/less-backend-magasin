var express = require('express');
var router = express.Router();


const Produit = require('../models/produit');
const Enseigne = require('../models/enseigne');

const nomEnseigneAPI = process.env.NOM_API_ENSEIGNE4;

/*
Route : GET - Get product details - /enseigne1/categories
IN : body = {  }
Returns : 
    OK = { result: true, categories: [categories_list],  }
    KO = { result: false, error: error_message }

Description : This route retrieves all categories it provides
*/
router.get('/categories', async function(req, res, next) {
    try {
      // EnseigneID
      const regex = new RegExp(nomEnseigneAPI, 'i')
      const enseigneData = await Enseigne.findOne({
        nom: {$regex: regex}
      })
      console.log('enseigne data : ', enseigneData);
      if (enseigneData === null) {
        res.json({result: false, error: `the enseigne ${nomEnseigneAPI} has been found in the DB`})
        return
      }
      const categories = await Produit.distinct('categorieDeProduit', {enseigne: enseigneData._id});
      console.log('categories : ', categories);  
      res.json({ result: true, categories: categories });
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

/*
Route : GET - Get product details - /enseigne1/categories/nom?&page=pageNumber&limit=resultsPerPage
IN : params =
      nom: name of the categorie 
Returns : 
    OK = { result: true, produits: [produits_list], page: page_requested, totalPages: Number_of_pages, totalProduits: total_number_of_produits  }
    KO = { result: false, error: error_message }

Description : This route retrieves all the produits for a categorie
*/
router.get('/categories/:nom', async function(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

    try {
      // EnseigneID
      const regex = new RegExp(nomEnseigneAPI, 'i')
      const enseigneData = await Enseigne.findOne({
        nom: {$regex: regex}
      })
      console.log('enseigne data : ', enseigneData);
      if (enseigneData === null) {
        res.json({result: false, error: `the enseigne ${nomEnseigneAPI} has been found in the DB`})
        return
      }
      const produits = await Produit.find({
        enseigne: enseigneData._id,
        categorieDeProduit: req.params.nom
      }).limit(limit).skip(offset).populate('enseigne');
      //console.log('produits for categorie : ', produits);  
      const totalProduits = await Produit.countDocuments({
        enseigne: enseigneData._id,
        categorieDeProduit: req.params.nom
      });
      const totalPages = Math.ceil(totalProduits / limit);
      res.json({ result: true, produits: produits, page, totalPages, totalProduits });
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
})

/*
Route : GET - Get product details - /enseigne1/produit/:id
IN : body = {  }
Returns : 
    OK = { result: true, produit: {produit_details} }
    KO = { result: false, error: error_message }

Description : This route retrieves a product details
*/
router.get('/produit/:productId', async function (req, res, next) {
    try {
      const excludedFields = { 
        _id: false,
      };
      // EnseigneID
      const regex = new RegExp(nomEnseigneAPI, 'i')
      const enseigneData = await Enseigne.findOne({
        nom: {$regex: regex}
      })
      console.log('enseigne data : ', enseigneData);
      if (enseigneData === null) {
        res.json({result: false, error: `the enseigne ${nomEnseigneAPI} has been found in the DB`})
        return
      }
      const productDetails = await Produit.find({
        _id: req.params.productId,
        enseigne: enseigneData._id
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

module.exports = router;
