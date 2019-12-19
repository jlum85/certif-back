const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");

const Devis = require("../models/Devis");

const getRandomDossier = () => {
  // génération d'un numéro de dossier sur 8 caractères
  return Math.floor(Math.random() * 100000000);
};

// POST  /create
router.post("/devis/create", middlewares.authenticate, async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  // destructuring pour récupérer les paramètres
  const {
    mail,
    propertyType,
    propertyState,
    propertyUse,
    propertySituation,
    country,
    city,
    acquisitionAmount,
    workingAmount,
    notaryFees
  } = req.body;

  const tabOption1 = [0, 1]; // listes des valeurs possibles pour propertyType , propertyState
  const tabOption2 = [0, 1, 2, 3]; // listes des valeurs possibles pour propertyUse , propertySituation

  // tous les paramètres doivent être correctement alimentés
  if (
    !mail ||
    !tabOption1.includes(propertyType) || // les seules valeurs valides pour propertyType sont dans tabOption1
    !tabOption1.includes(propertyState) ||
    !tabOption2.includes(propertyUse) ||
    !tabOption2.includes(propertySituation) ||
    !country ||
    !city ||
    acquisitionAmount === undefined ||
    acquisitionAmount <= 0 ||
    notaryFees === undefined ||
    notaryFees <= 0
  ) {
    res.status(400).json({ message: "Missing or Wrong Parameter" });
    return;
  }
  try {
    const newDevis = new Devis({
      mail,
      propertyType,
      propertyState,
      propertyUse,
      propertySituation,
      country,
      city,
      acquisitionAmount,
      workingAmount,
      notaryFees
    });
    newDevis.totalBudget = acquisitionAmount + workingAmount + notaryFees;
    newDevis.dossierNumber = getRandomDossier();

    await newDevis.save();

    res.json(newDevis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST   /delete
router.post("/devis/delete/:id", middlewares.authenticate, async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Missing Parameter" });
    return;
  }

  try {
    let devisToDelete = await Devis.findOne({ dossierNumber: id });
    if (devisToDelete) {
      await devisToDelete.remove();
      res.json({ message: "Deleted" });
    } else {
      res.status(400).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET  Liste des devis
router.get("/devis", middlewares.authenticate, async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  try {
    let devis = await Devis.find().sort({ created: -1 });
    res.json(devis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET   Sélection d'un devis par son n° de dossier
router.get("/devis/:id", middlewares.authenticate, async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  const { id } = req.params;
  if (!id) {
    res.status(400).json({ message: "Missing Parameter" });
    return;
  }
  try {
    let devis = await Devis.findOne({ dossierNumber: id });
    if (devis) {
      res.json(devis);
    } else {
      res.status(400).json({ message: "Item not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
