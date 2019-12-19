const express = require("express");
const global = require("./global");

const authenticate = async (req, res, next) => {
  // on lit le header authorization
  const auth = req.headers.authorization;

  if (!auth) {
    console.log("Missing Authorization Header");
    res.status(401).json({ message: "Missing Authorization Header" });
    return;
  }
  // on extrait le token et on vérifie que c'est bien un Bearer
  const parts = req.headers.authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.log("Invalid Authorization Header");
    res.status(401).json({ message: "Invalid Authorization Header" });
    return;
  }

  const token = parts[1];
  // vérification du token reçu
  if (token != global.dummyToken) {
    console.log("Invalid Token");
    res.status(401).json({ message: "Invalid Token" });
    return;
  }

  // le token est valide, on appelle next() pour exécuter le code de la route
  return next();
};

module.exports = {
  authenticate
};
