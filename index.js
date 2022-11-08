const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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

// jwt verify function

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorizes access" });
  }
  const token = authHeader.split(" ")[1];
  const secretToken = process.env.JWT_SECRET;

  console.log(token);

  jwt.verify(token, secretToken, function (err, decoded) {
    if (err) {
      return res.status(403).send({
        status: "error",
        message: "forbidden",
      });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const servicesCollection = client
      .db("Online-trainer")
      .collection("services");
    const reviewsCollection = client.db("Online-trainer").collection("reviews");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const secret = process.env.JWT_SECRET;
      jwt.sign(user, secret, (err, token) => {
        if (err) {
          return res.send({
            status: "error",
            message: "something went wrong",
          });
        }
        res.send({
          status: "success",
          token,
        });
      });
    });
    // services route
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

    // review route
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

    app.get("/custom-reviews", verifyJwt, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        return res.status(403).send({ message: "Unauthorized access" });
      }

      let query = {};
      if (!req.query.email) {
        return res.send({ message: "wrong query" });
      }
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewsCollection.find(query);
      const customReviews = await cursor.toArray();
      res.send(customReviews);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const options = { upsert: true };
      const updateReview = {
        $set: {
          review: review.review,
        },
      };
      const filter = { _id: ObjectId(id) };
      const result = await reviewsCollection.updateOne(
        filter,
        updateReview,
        options
      );
      res.send(result);
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
