const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
// const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middlewares

app.use(cors());
app.use(express.json());

//database connection

const uri = `mongodb+srv://${process.env.DB_ADMIN}:${process.env.DB_PASSWORD}@cluster0.oe1j3.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client
      .db("Online-trainer")
      .collection("services");
    const reviewsCollection = client.db("Online-trainer").collection("reviews");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/services-home", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query).limit(3);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.post("/add-services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });
    app.post("/add-review", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const query = {};
      const sort = { date: -1 };
      const cursor = reviewsCollection.find(query).sort(sort);
      const services = await cursor.toArray();
      res.send(services);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/myproducts", (req, res) => {
  res.send("hello from product");
});

app.get("/", (req, res) => {
  res.send("hello from the server");
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

// Date.parse(new Date())
