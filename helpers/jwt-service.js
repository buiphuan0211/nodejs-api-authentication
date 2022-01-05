const jwt = require('jsonwebtoken');
const createError = require('http-errors')
const client = require('../helpers/connect_redis')

const signAccessToken = async( userId)=>{
  return new Promise(function(resolve, reject) {
    const payload ={
      userId,
    }
    const secret = process.env.ACCESS_TOKEN_SECRET;
    console.log(secret);
    const options = {
      expiresIn:'10s'
    }
    jwt.sign(payload, secret, options, (err, token)=>{
      if(err) reject(err)
      resolve(token)
    })
  })
}

const verifyAccessToken = (req, res, next) => {
  if(!req.headers['authorization']){
    return next(createError.Unauthorized())
  }
  const authHeader = req.headers['authorization']
  const bearerToken = authHeader.split(' ');
  const token = bearerToken[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,payload) => {
    if(err){ 
      if(err.name ==='JsonWebTokenError'){
        return next(createError.Unauthorized())
      }
      return next(createError.Unauthorized(err.message))
    }
    req.payload = payload;
    next()
  })
}

const signRefreshToken = async( userId)=>{
  return new Promise(function(resolve, reject) {
    const payload ={
      userId,
    }
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn:'1y'
    }
    jwt.sign(payload, secret, options, (err, token)=>{
      if(err) reject(err)
      // Set refreshToken vào redis
      client.set(userId.toString(), token, 'EX', 365*24*60*60,(err, reply)=>{
        if(err) return reject(createError.InternalServerError())
        resolve(token)
      })
    })
  })
}

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject)=>{
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,payload) => {
      if(err){ 
        return reject(err)
      }
      // get refreshToken in Redis by userID
      client.get(payload.userId,(err, reply)=>{
        if(err){ 
          return reject(createError.InternalServerError())
        }
        // Kiểm tra refreshToken người dùng gửi lên có giống trong Redis ko 
        if(refreshToken===reply){
          return resolve(payload)
        }
        return reject(createError.Unauthorized())
      })
    })
  })
}

module.exports = { 
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken
};


//---------------- req.headers
// {
//   authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MWQ0YjI4NzRlZmFjNjU1ZmI1ZTZkZmQiLCJpYXQiOjE2NDEzNjMwOTAsImV4cCI6MTY0MTM2NjY5MH0.NvjxOzhDz7pXliyknhLUl5Qhub6Jc8igpY43GgOh54E',
//   'user-agent': 'PostmanRuntime/7.28.4',
//   accept: '*/*',
//   'postman-token': 'ff2eb63f-f041-4cd1-934a-2494edb441da',
//   host: 'localhost:8080',
//   'accept-encoding': 'gzip, deflate, br',
//   connection: 'keep-alive'
// }