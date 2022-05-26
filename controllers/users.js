const User = require('../models/user')

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
}

module.exports.registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body
        const newUser = new User({ username, email })
        const registeredUser = await User.register(newUser, password)    //this is not an object, it parameter
        req.login(registeredUser, e => {
            if (e) {
                next(e)
            }
            req.flash('success', 'Welcome to Yelp Camp!')
            res.redirect('/campgrounds')
        })
    } catch (e) {
        req.flash('error', e.message)    //This error has the message property and this will be flashed in the next screen
        res.redirect('register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Logged in Successfully')
    let redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logoutUser = (req, res, next) => {
    req.logout()
    req.flash('success', 'You are successfully logged out.')
    res.redirect('/campgrounds')
}
