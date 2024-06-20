module.exports = function  asyncWrap(fn) {
    return function(req , res , next){
      fn(req, res, next).catch( (err) => next(err));
    }
  }

