const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");
const mailgun = require("mailgun-js");
const Devis = require("../models/Devis");
const global = require("./global");

const getRandomDossier = () => {
  // génération d'un numéro de dossier sur 8 caractères
  return Math.floor(Math.random() * 100000000);
};

const sendMail = async newDevis => {
  const to = newDevis.mail;
  const subject = "Devis meilleurtaux.com";

  const text = ` Bonjour

  Votre devis ${newDevis.dossierNumber} a bien été enregistré.

  Récapitulatif de la demande : 
  - Type de bien : ${global.tabType[newDevis.propertyType]}
  - Etat du bien : ${global.tabState[newDevis.propertyState]}
  - Usage du bien : ${global.tabUsage[newDevis.propertyUse]}

  - Votre situation actuelle : ${
    global.tabSituation[newDevis.propertySituation]
  }

  Localisation du bien à financer : 
  - Pays : ${newDevis.country}
  - Ville : ${newDevis.city}

  - Montant estimé de votre acquisition : ${newDevis.acquisitionAmount}
  - Montant estimé des travaux : ${newDevis.workingAmount}
  - Frais de notaire : ${newDevis.notaryFees}
  - Budget total estimé du projet : ${newDevis.totalBudget}


  Cordialement

  meilleurtaux.com `;

  const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAINE
  });
  const data = {
    from: "meilleurTaux  <postmaster@" + process.env.MAILGUN_DOMAINE + ">",
    to: to,
    subject: subject,
    text: text
  };

  try {
    mg.messages().send(data, (error, body) => {
      console.log(body);
    });
  } catch (error) {
    console.log("An error occured while sending mail");
  }
};

// POST  /create
router.post("/devis/create", async (req, res) => {
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
    await newDevis.save(); // sauvegarde en base

    // !!!!!!!!  désactivation temporaire du mail
    //await sendMail(newDevis); // mail de récapitulatif

    res.json(newDevis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST   /delete ,  on utilise un midddleware car seul l'admin peut supprimmer
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

// GET  Liste des devis , on utilise un midddleware car seul l'admin peut consulter
router.get("/devis", middlewares.authenticate, async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  try {
    let devis = await Devis.find().sort({ created: -1 });
    res.json(devis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET calcul des frais de notaire et du total budget
router.get("/devis/budget", async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  // destructuring pour récupérer les paramètres
  const { acquisitionAmount, workingAmount, propertyState } = req.body;

  // contrôles des éléments nécessaires au calcul
  if (
    !acquisitionAmount ||
    acquisitionAmount <= 0 ||
    (propertyState !== 0 && propertyState !== 1)
  ) {
    res.status(400).json({ message: "Missing or Invalid Parameter" });
    return;
  }
  let works = 0; // le montant des travaux  n'est pas obligatoire
  if (workingAmount && workingAmount >= 0) {
    works = workingAmount;
  }

  try {
    // conversion montant formaté en nombre
    const castToNum = value => {
      if (value && typeof value === "string") {
        return parseInt(value.replace(/\D/g, "")); // on enlève tous les caractères non numériques
      } else if (value && typeof value === "number") {
        return value;
      } else {
        return 0;
      }
    };

    // calcul des frais de notaire
    const getNotaryFees = acquisitionFee => {
      const value = castToNum(acquisitionFee);
      if (value > 0) {
        // un taux de 1,80% sur le prix de l'achat, pour un bien neuf : radioState = 1
        // un taux de 7,38% sur le prix de l'achat, pour un bien ancien :radioState= 0
        if (propertyState === 1) {
          return Math.round((value * 1.8) / 100);
        } else {
          return Math.round((value * 7.38) / 100);
        }
      }
      return 0;
    };

    const notaryFees = getNotaryFees(acquisitionAmount);

    // calcul du total budget
    const totalBudget = Math.round(
      castToNum(acquisitionAmount) + castToNum(works) + notaryFees
    );

    res.json({ notaryFees: notaryFees, totalBudget: totalBudget });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET   Sélection d'un devis par son n° de dossier , on utilise un midddleware car seul l'admin peut consulter
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
