const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { validateCampground, isAuthor } = require('../middleware')
const { ensureAuthenticated } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campgrounds.index))

    .post(ensureAuthenticated, 
        upload.array('image'),
        validateCampground, 
        catchAsync(campgrounds.createCampground))
    

router.get('/new', ensureAuthenticated, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))

    .put(ensureAuthenticated,
        isAuthor,
        upload.array('image'),
        validateCampground,
        catchAsync(campgrounds.editCampground))

    .delete(ensureAuthenticated,
        isAuthor,
        catchAsync(campgrounds.deleteCampground))



router.get('/:id/edit', ensureAuthenticated,
    isAuthor,
    catchAsync(campgrounds.renderEditForm))

module.exports = router