const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title : {
        type : string ,
        required : true,
        
    },
    description : {
        type : string ,
        
        
    },
    image : {
        type : string ,
        required : true,
        
    },
    price : {
        type : number ,
        required : true,
        
    },
    location : {
        type : string ,
        required : true,
        
    },
    country : {
        type : string ,
        
    }
})


     