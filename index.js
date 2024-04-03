const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ejsMate = require('ejs-mate');

const port = 3000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.engine('ejs' , ejsMate);

main()
  .then(() => console.log("connection successfully"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("./Listings/index.ejs", { allListings });
});

app.get("/listings/new", async (req, res) => {
  res.render("./Listings/new.ejs");
});

app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let oneListing = await Listing.findById(id);
  res.render("./Listings/show.ejs", { listing: oneListing });
});

app.post("/listings", async (req, res) => {
  let { title, description, image, price, location, country } = req.body;
  const newListing = new Listing({
    title: title,
    description: description,
    image: image,
    price: price,
    location: location,
    country: country,
  });

  await newListing.save();
  res.redirect("/listings");
});

app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  let oneListing = await Listing.findById(id);
  res.render("./Listings/edit.ejs", { listing: oneListing });
});

//update route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, req.body);

  res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

app.listen(port, () => console.log(`listen on port ${port}`));
