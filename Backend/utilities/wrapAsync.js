const { handleError } = require('./errorHandler');

module.exports = function asyncWrap(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      handleError(err, res);
    });
  }
}

