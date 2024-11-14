const mongoose = require("mongoose")const initData = require("./data.js")
const Listing = require("../models/listing.js")
require("dotenv").config()

main()
    .then(() => {
        console.log("connected to DB")
    })
    .catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(process.env.MONGO_URL)
}

const initDB = async () => {
    await Listing.deleteMany({})
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "670783fb0e409f5a8cfcf582",
    }))
    await Listing.insertMany(initData.data)
    console.log("data was initialized")
}

initDB()
