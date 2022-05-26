const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = Schema({
    email: {
        type: String, 
        required: true,
        unique: true
    }
})

//This is gonna add username and password to our schema and 
//make sure username is unique and also give some additional methods
UserSchema.plugin(passportLocalMongoose)      

module.exports = mongoose.model('User', UserSchema)



