const express = require("express");
const cors = require("cors");
// const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middlewares

app.use(cors());
app.use(express.json());

app.get("/myproducts", (req, res) => {
  res.send("hello from product");
});

app.get("/", (req, res) => {
  res.send("hello from the server");
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
