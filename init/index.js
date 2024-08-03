const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb+srv://jaiminDetroja345:oiwzizcpxXLYKufb@cluster0.oehzpww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "66a343a50ff99cdefc1a4657" }))
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();