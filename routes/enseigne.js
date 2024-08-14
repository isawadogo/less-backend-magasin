var express = require('express');
var router = express.Router();
var path = require('path');

const { body, validationResult } = require('express-validator');
const Produit = require('../models/produit');
const Enseigne = require('../models/enseigne');

let enseignesList = {};
let productsList = {};

// Set data files if data loading is enabled
const enableLoad = process.env.LOAD_PRODUCT
if (enableLoad === 'TRUE') {
  const productsFile = path.join(__dirname,`../data/${process.env.PRODUCTS_FILE_NAME}`);
  const enseignesFile = path.join(__dirname, `../data/${process.env.ENSEIGNES_FILE_NAME}`);
  enseignesList = require(enseignesFile);
  productsList = require(productsFile);
}

//console.log('Product list : ', productsList);
//console.log('Enseignes List : ', enseignesList)
/*
Route : GET - Get product details - /enseigne1/produit/:id
IN : body = {  }
Returns : 
    OK = { result: true, produit: {produit_details} }
    KO = { result: false, error: error_message }

Description : This route retrieves an enseigne by its name
*/
router.get('/:nom', async function (req, res, next) {
    try {
      const excludedFields = { 
        __v: false,
      };
      const nomEnseigne = req.params.nom;
      console.log('Searched enseigne : ', nomEnseigne)
      const enseigneRes = await Enseigne.find({
        nom: nomEnseigne
      }, excludedFields);
      console.log(enseigneRes);
      if ( enseigneRes.length === 0) {
        res.json({result: false, error: `no enseigne with the name ${nomEnseigne} exists`})

      } else {
        res.json({ result: true, enseigne: enseigneRes[0] });
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

/*
Route : POST - Enseigne add - /enseigne/add
IN : body = {  nom: String, adresse: {commune: String, codePostal: String, numeroDeRue: String, nomDeRue: String},
               localistation: {longitude: Number, latitude: Number}, apikey: String }
Returns : 
    OK = { result: true, token: The_User_Token, id: ObjectId }
    KO = { result: false, error: error_message }

Description : This will just create the user in the DB, its profil update will
              be handled by  the route /utilisateur/update
*/
router.post('/add', 
  body('nom').notEmpty(),
  async function (req, res, next) {
  // validate params: email and password are mandatory
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.json({result: false, error: result.array()})
      return
    }
    try {
      const findEnseigne = await Enseigne.findOne({ 
        nom: req.body.nom
      })
      console.log(findEnseigne)
      if ( findEnseigne === null) {
          const newEnseigne = new Enseigne({
            ...req.body
          });
          const newEnseigneSave = await newEnseigne.save();
          res.json({ result: true, enseigne: newEnseigneSave });
      } else {
          // Eneigne already exists in database
          res.json({ result: false, error: `An enseigne with name ${req.body.nom} already exists` });
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed create enseigne. Please see logs for more details"});
      next(err);
  }
});

/*
Route : DELETE - Remove an enseigne from DB - /enseigne/:nom
IN : body = {  }
Returns : 
    OK = { result: true, msg: String }
    KO = { result: false, error: error_message }

Description : This route retrieves an enseigne by its name
*/
router.delete('/:nom', async function (req, res, next) {
    try {
      // Find enseigne
      const nomEnseigne = req.params.nom;
      const findEnseigne = await Enseigne.findOne({ nom: nomEnseigne })
      if ( findEnseigne !== null) {
          // delete all the products for that enseigne
          await Produit.deleteMany({
            enseigne: findEnseigne._id
          });
      } 
      const delEnseigne = await Enseigne.deleteOne({
        nom: nomEnseigne
      });
      // Delete all products for the enseigne
      if ( delEnseigne.acknowledged) {
        res.json({result: true, error: `enseigne with the name ${nomEnseigne} deleted`})
      } else {
        console.log(delEnseigne);
        res.json({result: true, error: `Issue with enseigne ${nomEnseigne} removal. See logs for more details`})
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get user details. Please see logs for more details"});
      next(err);
    }
});

/*
Route : DELETE - Remove all the enseignes and thus all the products from the DB - /enseigne
IN : body = {  }
Returns : 
    OK = { result: true, msg: String }
    KO = { result: false, error: error_message }

Description : This route retrieves an enseigne by its name
*/
router.delete('/', async function (req, res, next) {
    try {
      // delete all the products for that enseigne
      await Produit.deleteMany({});
      // Find enseigne
      const delEnseigne = await Enseigne.deleteMany({});
      // Delete all products for the enseigne
      if ( delEnseigne.acknowledged) {
        res.json({result: true, error: `All the enseignes have been deleted`})
      } else {
        console.log(delEnseigne);
        res.json({result: true, error: `Issue with enseigne removal. See logs for more details`})
      }
    } catch(err) {
      console.error(err.stack);
      res.json({result: false, error: "Failed to get delete all the enseignes details. Please see logs for more details"});
      next(err);
    }
});


/*
Route : Load enseignes and products in the DB - /enseigne/load
IN : body = {  }
Returns : 
    OK = { result: true, message: "Data has been loaded" }
    KO = { result: false, error: error_message }

Description : This route loads to the DB.
*/
router.put('/load', async function (req, res, next) {
    if (enableLoad === 'TRUE') {
      const authorization = req.headers['x-load-key'];
      if (!authorization) {
          res.json({result: false, error: 'no load key provided'});
          return;
      }
      if (authorization !== process.env.LOAD_AUTH_KEY) {
        res.json({result: false, error: 'The load key is incorrect'});
        return;
      }

      try {
        // Delete the products
        await Produit.deleteMany({});
        // Delete thes enseigne
        await Enseigne.deleteMany({});
        //Create the enseignes
        const enseignesLoaded = await Enseigne.insertMany(enseignesList);
        // Create the products
        const productToload = productsList.map((p) => {
          const enseigneId = enseignesLoaded.find((e) => e.nom.includes(p.enseigne));
          return {...p, enseigne: enseigneId._id};
        })
        const productLoaded = await Produit.insertMany(productToload);
        res.json({result: true, message: "Data has been loaded"});
      } catch(err) {
        console.error(err.stack);
        res.json({result: false, error: "Failed to load data. Please see logs for more details"});
        next(err);
      }
    } else {
      res.json({result: false, message: 'Loading data is not enabled in the configuration'});
    }
});

module.exports = router;
