const userModel = require('../models/user.model')
const {userValidate} = require('../validations/validation')
const createError = require('http-errors')
const {signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken} = require('../helpers/jwt-service')

const client = require('../helpers/connect_redis')

module.exports.register = async (req, res,next)=>{
  try {
    const {email, password} = req.body;

    // Validate 
    const {error} = userValidate(req.body)
    if(error){
      throw createError(error.details[0].message)
    }
  
    const user = new userModel({ email, password});
    const savedUser = await user.save()
    return res.json({
      message: "create success",
      data:savedUser
    })
  } catch (error) {
    next(error);
  }

}

module.exports.login = async(req, res, next) => {
  try {
    // Validate email and password 
    const {error} = userValidate(req.body);
    if(error) throw createError(error.details[0].message)

    const {email, password} = req.body;

    const user = await userModel.findOne({email:email})
    if(!user) throw createError(error.NotFound('User not registered'))
    
    // check password
    const isValid = await user.isCheckPassword(password);
    if(!isValid) throw createError.Unauthorized();

    const accessToken = await signAccessToken(user._id)
    const refreshToken = await signRefreshToken(user._id)
    res.json({
      message:"login success",
      accessToken:accessToken,
      refreshToken:refreshToken,
    })

  } catch (error) {
    next(error);
  }
}

module.exports.refreshToken =async (req, res,next)=>{
  try {
    const {refreshToken} =req.body;
    if(!refreshToken){
      throw createError.BadRequest();
    }

    const payload = await verifyRefreshToken(refreshToken);
    const {userId} = payload;
    const accToken = await signAccessToken(userId)
    const refToken = await signRefreshToken(userId)
    res.json({
      accessToken: accToken, 
      refreshToken: refToken
    });
    console.log(`payload::: ${payload}`);
  } catch (error) {
    next(error);
  }

}

module.exports.getLists = async (req, res,next)=>{
  console.log(req.headers);
  const listUsers=[
    {email:"abc@gmail.com"}, 
    {email:"def@gmail.com"}
  ]
  res.json(listUsers)
}

module.exports.logout = async (req, res, next) => {
  try {
    const {refreshToken} = req.body;
    if(!refreshToken){
      throw createError.BadRequest();
    }
    const payload = await verifyRefreshToken(refreshToken);
    const {userId} = payload;

    client.del(userId.toString(), (err, reply)=>{
      if(err){
        throw createError.InternalServerError();
      }
      res.json({
        message:"Logout success"
      })
    });

  } catch (error) {
    next(error);
  }
}

