const Joi = require('joi');

module.exports.listingsSchema = Joi.object({

  title: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  price: Joi.number().required().min(0),
  image: Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
  })

});

module.exports.reviewsSchema = Joi.object({

  content: Joi.string().required(),
  rating: Joi.number().required().min(1).max(5),

});