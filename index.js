const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASSWORD)

//mongo connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nlu12w4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //main work

    //mongodb connnection insert value
    const coffeeCollection = client.db("coffeeShopDB").collection("coffee");

    // showing newcoffee data in server
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //create new coffee using post mehtod
    app.post("/coffee", async (req, res) => {
      const newCoffeeInfo = req.body;
      console.log(newCoffeeInfo);

      //new coffee data into DB
      const result = await coffeeCollection.insertOne(newCoffeeInfo);
      res.send(result);
    });

    // delete data from DB and server
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // get data by specific id in server for update
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });
    // update by client response
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffeeInfo = req.body;
      const updatedCoffee = {
        $set: {
          title: updatedCoffeeInfo.title,
          taste: updatedCoffeeInfo.taste,
          quantity: updatedCoffeeInfo.quantity,
          photo: updatedCoffeeInfo.photo,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updatedCoffee,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//loaclhost 5000 show this text in root
app.get("/", (req, res) => {
  res.send("Coffee Shop Server is running");
});
// showing text in cmd
app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
