const Joi = require('joi');

// Validate email and password
const userValidate= (data)=>{
  const userSchema = Joi.object({
    email:Joi.string().pattern(new RegExp('gmail.com$')).email().lowercase().required(),
    password:Joi.string().min(4).max(32).required(),
  })
  return userSchema.validate(data)
}

module.exports ={userValidate};

/*
*-------
* .pattern : Định dạng 'gmail.com'
*  nếu sai throw "\"email\" with value \"buiphuan@.com\" fails to match the required pattern: /gmail.com$/" 
*-------
*/