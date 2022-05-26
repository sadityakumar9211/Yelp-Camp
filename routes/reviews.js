const express = require('express')
const router = express.Router({mergeParams: true})
const Review = require('../models/review')
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const reviews = require('../controllers/reviews')
const {ensureAuthenticated, isReviewAuthor} = require('../middleware')
const {validateReview} = require('../middleware')



router.post('/', ensureAuthenticated, 
    validateReview, 
    catchAsync(reviews.createReview))

router.delete('/:reviewId', ensureAuthenticated, 
    isReviewAuthor, 
    catchAsync(reviews.deleteReview))

module.exports = router