const express = require("express");
const router = express.Router();
const global = require("./global");

router.post("/user/signin", async (req, res) => {
  console.log(">> Method : " + req.method + " , Route : " + req.route.path);

  const { password } = req.body;
  if (!password) {
    res.status(400).json({ message: "Missing Parameter" });
    return;
  }

  // page administration protégée par un mot de passe
  if (password === global.loginPassword) {
    res.json({ token: global.dummyToken });
  } else {
    res.status(401).json({ message: "Invalid User or Password" });
  }
});

module.exports = router;
