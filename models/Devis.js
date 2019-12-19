const mongoose = require("mongoose");

const Devis = mongoose.model("Devis", {
  mail: String,

  // page 1  : Type de bien >>  0 = "MAISON", 1 = "APPARTEMENT"
  propertyType: Number,
  // page 2  : Etat du bien >> 0 = "ANCIEN", 1 = "NEUF"
  propertyState: Number,
  // page 3  : Usage du bien >>  0 = "Résidence, 1 = principale", 2 = "Résidence secondaire", 3 = "Investissement locatif"
  propertyUse: Number,
  // page 4  : Situation actuelle >> 0 = "Locataire", 1 = "Propriétaire", 2 = "Bénéficiaire d'un logement de fonction", 3 = "Hébergé à titre gratuit"
  propertySituation: Number,

  // Page 5 : localisation du bien
  country: String,
  city: String,
  zipCode: String,

  // Page 6 : Budget
  acquisitionAmount: Number, // "Montant estimé de votre acquisition*"
  workingAmount: Number, // "Montant estimé des travaux"
  notaryFees: Number, // "Frais de notaire*"
  totalBudget: Number, // "Budget total estimé du projet"

  dossierNumber: Number, // numéro de dossier

  // date de création du devis
  created: {
    type: Date,
    default: Date.now()
  }
});
module.exports = Devis;
