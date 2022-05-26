const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')


module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    console.log('passed validateReview...')
    next()
}


module.exports.validateCampground = (req, res, next) => {
    //This is a Server-Side Validation

    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    //This is not a mongoose schema, It is used to validate data before even we attempt to save the data.
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        //result.error.details is an array of objects and we need to map over that to convert it into array of strings and then join them
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400)
    }
    console.log('passed validateCampground...')
    next()
}


module.exports.ensureAuthenticated = function (req, res, next){
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You are not logged in.')
        return res.redirect('/login')
    }
    console.log('passed from ensureAuthenticated...')
    next()
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if(!campground){
        res.flash('error', "Couldn't find that Campground in our databases")
        return res.redirect('/campgrounds')
    }else{
        if(!campground.author.equals(req.user._id)){
            req.flash('error', 'Unauthorized Access: You are not the author of the campground!')
            return res.redirect(`/campgrounds/${id}`)
        }
    }
    console.log('Passed isAuthor...')
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    console.log('from middleware function...', review)
    if(!review){
        res.flash('error', "Couldn't find that review in our databases")
        return res.redirect(`/campgrounds/${id}`)
    }else{
        if(!review.author.equals(req.user._id)){
            req.flash('error', 'Unauthorized Access: You are not the author of the review!')
            return res.redirect(`/campgrounds/${id}`)
        }
    }
    console.log('passed from isReviewAuthor...')
    next()
}


