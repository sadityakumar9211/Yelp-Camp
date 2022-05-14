const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mongoose = require('mongoose')

//Aquiring the model(which is basically a JS class) from the models directory
const Campground = require('../models/campground')
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')

//Connecting the Database
async function main() {
    try {
        await mongoose.connect('mongodb://localhost:27017/yelp-camp')
        console.log("Database Connected")
    } catch (e) {
        console.log('Database Connection Error')
    }
}
main()

const sample = array => array[Math.floor(Math.random()*array.length)]

const seedDB = async()=>{
    await Campground.deleteMany({})
    for(let i=0;i<50;i++){
        const city = sample(cities)
        const price = Math.floor(Math.random()*20) + 10
        const camp = new Campground({
            location: `${city.city}, ${city.state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://source.unsplash.com/1600x900/?campground`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste, officiis! Culpa veniam similique repellat quas, aspernatur quaerat quam esse perferendis accusantium odio autem mollitia ducimus itaque exercitationem eaque! Distinctio, soluta.',
            price: price
        })
        await camp.save()
    }
}

seedDB()
    .then(()=>{
        mongoose.connection.close()
        console.log("Seed file connection terminated")
    })
    .catch(()=>{
    console.log('Error in saving data')
})

