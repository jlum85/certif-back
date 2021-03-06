# Backend Certif React

[![Netlify Status](https://api.netlify.com/api/v1/badges/a9409782-01f8-4e15-93a5-6cef16970804/deploy-status)](https://app.netlify.com/sites/jl-meilleurtaux/deploys)

Reproduction d'un formulaire de demande de devis pour un emprunt immobilier sur MeilleurTaux.com

![Gif demo](./demo/certif-react.gif)

## Liste des routes

- POST /user/signin : page administration protégée par un mot de passe
- POST /devis/create : création d'un nouveau devis
- POST /devis/budget : Calcul des frais de notaire et du total budget

Routes protégées avec un midddleware car seul l'admin peut les utiliser

- GET  /devis : Liste des devis
- GET /devis/:id : Sélection d'un devis par son n° de dossier
- POST /devis/delete/:id : supprression d'un devis par l'admin

## Dependencies

- "body-parser": "^1.19.0"
- "cors": "^2.8.5"
- "dotenv": "^8.2.0"
- "express": "^4.17.1"
- "mailgun-js": "^0.22.0"
- "mongoose": "^5.8.1"
