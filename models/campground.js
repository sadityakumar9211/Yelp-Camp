const mongoose = require('mongoose')
const Schema = mongoose.Schema;      //This is a class


//Defining the Schema
const CampgroundSchema = new Schema({
    title: String,
    image: String, 
    price: Number, 
    description: String,
    location: String
});

//Creating and exporting a model
module.exports = mongoose.model('Campground', CampgroundSchema)

