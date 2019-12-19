require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const devisRoutes = require("./routes/devis");
const sendMailRoutes = require("./routes/sendMail");
const userRoutes = require("./routes/user");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(devisRoutes);
app.use(sendMailRoutes);
app.use(userRoutes);

mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/meilleurtaux",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.all("*", (req, res) => {
  res.status(404).send("Page introuvable");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  const date = new Date().toLocaleString("fr-FR", { hour12: false });
  console.log(`Server started : ${date} on port ${port}`);
});
