const Campground = require('../models/campground')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')

module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    if (campgrounds) {
        res.render('campgrounds/index', { campgrounds })
    } else {
        res.send('No campgrounds found!!')
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 2
    }).send()
    let campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.author = req.user._id
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await campground.save()
    campground = await Campground.findById(campground._id)
    console.log(campground)
    req.flash('success', 'Campground Created Successfully!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')

    if (campground) {
        res.render('campgrounds/show', { campground })
    } else {
        req.flash('error', 'can not find that campground')
        res.redirect('/campgrounds')
    }
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (campground) {
        res.render('campgrounds/edit', { campground })
    } else {
        req.flash('error', 'can not find that campground')
        res.redirect('/campgrounds')
    }
}

module.exports.editCampground = async (req, res, next) => {
    const { id } = req.params
    //can't create another instance with new details and findByIdAndUpdate it in the collection
    //as it would try to modify the immutable object ObjectId --> _id field and result in error
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id)
    if (campground) {
        req.flash('success', `Successfully deleted campground named '${campground.title}'`)
        res.redirect('/campgrounds')
    } else {
        req.flash('error', 'can not find that campground')
        res.redirect('/campgrounds')
    }
}