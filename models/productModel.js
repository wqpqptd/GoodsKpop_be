const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    tiltle:{
        type:String,
        required:true,
        trim: true,
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
    },
    desciption:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    quantity: Number,
    images:{
        type: Array,
    },
    color:{
        type: String,
        enum: ["Black", "Brown", "Red"],
    }, 
    ratings:{
        star: Number,
        postedby: { type: mongoose.Schema.Types.ObjectId,
            ref: "Category", }
    }
});

//Export the model
module.exports = mongoose.model('product', productSchema);