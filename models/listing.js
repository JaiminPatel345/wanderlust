const mongoose = require('mongoose');
const default_img = 'https://img.freepik.com/free-vector/wanderlust-explore-adventure-landscape_24908-55313.jpg?w=740&t=st=1711876159~exp=1711876759~hmac=b91c9ca5ccaf8ba289e930b3c62030b97c46e70ad36177b312e199938db1c47c';

const listingSchema = new mongoose.Schema({
    title : {
        type : String ,
        required : true,
        
    },
    description : {
        type : String ,
        
        
    },
    image : {
        type : String ,
        default : default_img,
        set : (v) => v==="" ? default_img : v 
    },
    price : {
        type : Number ,
        required : true,
        
    },
    location : {
        type : String ,
        required : true,
        set: (v) => v.toUpperCase()
        
    },
    country : {
        type : String ,
        set: (v) => v.toUpperCase()
        
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;


     