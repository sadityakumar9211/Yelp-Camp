const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')  //One of many engines which are used to parse and make sense of ejs
const methodOverride = require('method-override')

//Aquiring the model(which is basically a JS class) from the models directory
const Campground = require('./models/campground')
const { findByIdAndUpdate } = require('./models/campground')

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


app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)

app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))

app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    if (campgrounds) {
        res.render('campgrounds/index', { campgrounds })
    } else {
        res.send('No campgrounds found!!')
    }
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})
app.post('/campgrounds', async (req, res) => {
    let campground = new Campground(req.body.campground)
    await campground.save()
    campground = await Campground.findById(campground._id)
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (campground) {
        res.render('campgrounds/show', { campground })
    } else {
        res.send("Couldn't find this particular campground in the database!!")
    }
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render('campgrounds/edit', { campground })
})

app.put('/campground/:id',async (req,res)=>{
    const {id} = req.params
    //can't create another instance with new details and findByIdAndUpdate it in the collection
    //as it would try to modify the immutable object ObjectId --> _id field and result in error
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, {new: true})
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})
app.listen(port, () => {
    console.log('Serving at port 3000...')
})