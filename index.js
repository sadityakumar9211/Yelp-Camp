if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')      //One of many engines which are used to parse and make sense of ejs
const methodOverride = require('method-override')
const passport = require('passport')     //helps us to implement various local strategies
const localStrategy = require('passport-local')
const ExpressError = require('./utils/ExpressError')
const campgroundRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const session = require('express-session')
const flash = require('connect-flash')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const MongoStore = require('connect-mongo')(session)
const helmet = require('helmet')


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
//Connecting the Database
async function main() {
    try {
        
        await mongoose.connect(dbUrl)
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
app.use(express.static(path.join(__dirname, '/public')))

const secret = process.env.SECRET||'32fajdlf'
const store = new MongoStore({
    url: dbUrl,
    secret:secret,
    touchAfter: 24*60*60
})

store.on('error',function(e){
    console.log('session store error')
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret, 
    resave: false,
    saveUninitialized: true,
    //Adding fancier options for the cookie itself.
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,        //aboslute date
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}

// @ts-ignore
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})
app.use(mongoSanitize())

// app.use(
//     helmet({
//       frameguard: false,
//     })
//   );

// const scriptSrcUrls = [
//     "https://cdn.jsdelivr.net/",
//     "https://api.tiles.mapbox.com",
//     "https://api.mapbox.com",
//     "https://kit.fontawesome.com",
//     "https://cdnjs.cloudflare.com",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com",
//     "https://cdn.jsdelivr.net/",
//     "https://api.mapbox.com",
//     "https://api.tiles.mapbox.com",
//     "https://fonts.googleapis.com",
//     "https://use.fontawesome.com",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com",
//     "https://*.tiles.mapbox.com",
//     "https://events.mapbox.com",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             childSrc: ["blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/saditya",
//                 "https://images.unsplash.com",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/', userRoutes)
app.get('/', (req, res) => {
    res.render('home')
})




app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not found', 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err
    if (!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(status).render('error', { err })
})


app.listen(port, () => {
    console.log('Serving at port 3000...')
})