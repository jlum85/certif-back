const loginPassword = "tothemoon";

// il n'y a pas de login et un seul mot de passe donc pas de mot mais on utilise un token unique pour les routes protégées
const dummyToken =
  "2L8FR0BI8aItiE8FfOs4qOpYBnQ5cqcjhDKBhzjlUHxEdDA2P9sDbL55hR25M87x";

const tabType = ["MAISON", "APPARTEMENT"];
const tabState = ["ANCIEN", "NEUF"];
const tabUsage = [
  "Résidence principale",
  "Résidence secondaire",
  "Investissement locatif"
];
const tabSituation = [
  "Locataire",
  "Propriétaire",
  "Bénéficiaire d'un logement de fonction",
  "Hébergé à titre gratuit"
];

module.exports = {
  loginPassword,
  dummyToken,
  tabType,
  tabState,
  tabUsage,
  tabSituation
};
