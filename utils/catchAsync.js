//A function for catching the async errors
const catchAsync = (fn)=>{
    return function (req, res, next){
        fn(req, res, next).catch(e => next(e))
    }
}

module.exports = catchAsync