const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");
const mailgun = require("mailgun-js");

// route uniquement pour tester mailgun, A SUPPRIMER !!
router.post("/mail/send", middlewares.authenticate, async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  const { to, subject, dossier } = req.body;
  if (!to || !subject || !dossier) {
    res.status(400).json({ message: "Missing or Wrong Parameter" });
    return;
  }

  // construction du message du mail avec un template litteral pour une version ligth en test
  const text = `Bonjour

Votre devis ${dossier} a bien été enregistré.

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
      res.json(body);
    });
  } catch (error) {
    res.status(400).json({ message: "An error occured while sending mail" });
  }
});

module.exports = router;
