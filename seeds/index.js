const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mongoose = require('mongoose')

//Aquiring the model(which is basically a JS class) from the models directory
const Campground = require('../models/campground')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const { schema } = require('../models/campground')

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

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 200; i++) {
        const city = sample(cities)
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author: '628e06b8c02687772cb15761',
            location: `${city.city}, ${city.state}`,
            geometry: { 
                type: 'Point', 
                coordinates: [city.longitude, city.latitude]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/saditya/image/upload/v1653507003/YelpCamp/hwivpbeidwxroamvyhpz.jpg',
                    filename: 'YelpCamp/hwivpbeidwxroamvyhpz',
                },
                {
                    url: 'https://res.cloudinary.com/saditya/image/upload/v1653507005/YelpCamp/m7wttkb8qpo6y3oodl6y.jpg',
                    filename: 'YelpCamp/m7wttkb8qpo6y3oodl6y',
                },
                {
                    url: 'https://res.cloudinary.com/saditya/image/upload/v1653507008/YelpCamp/etmsmia6kv08t0tvobag.jpg',
                    filename: 'YelpCamp/etmsmia6kv08t0tvobag',
                }
            ],
            
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste, officiis! Culpa veniam similique repellat quas, aspernatur quaerat quam esse perferendis accusantium odio autem mollitia ducimus itaque exercitationem eaque! Distinctio, soluta.',
            price: price
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close()
        console.log("Seed file connection terminated")
    })
    .catch(() => {
        console.log('Error in saving data')
    })

