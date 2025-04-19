const mongoose = require("mongoose")
const initData = require("./data.js")
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
        owner: "6803742a3670285b2a76f654", // Hi Contributer, please change the owner to your user id
    }))
    await Listing.insertMany(initData.data)
    console.log("data was initialized")
}

initDB()
