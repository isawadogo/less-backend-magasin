const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
    nom: String,
    categorieDeProduit: String,
    prix: Number,
    enseigne: { type: mongoose.Schema.Types.ObjectId, ref: 'enseignes' },
    nutriscore: Number,
    enpreinteCarbonne: String,
    listeIngredients: [String],
    tauxDeSucre: Number,
    tauxDeMatiereGrasse: Number,
    //vegan: Boolean,       // from listeIngredients
    //vegetarien: Boolean,  // from listeIngredients
    bio: Boolean,
    codePostal: Number, // For local criteria
    poids: {
        quantite: Number,
        unite: String
    }
});

const Produit = mongoose.model('produits', produitSchema);

module.exports = Produit