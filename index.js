require('dotenv').config()
const express = require('express')
const app = express()
const createError = require('http-errors')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const port = 8080

const db = require("./configs/db.config");
db.connect();

app.use(morgan("tiny"))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use("/user", require("./routes/user.routes"))

app.get('/', (req, res) => {
  res.json("Hello, world!");
})

// Lỗi Route ko tồn tại
app.use((req, res, next) => {
  next(createError.NotFound("This route does not"));
})

// Tất cả các lỗi sẽ được hứng tại đây
app.use((error, req, res, next) => {
  res.json({
    status: error.status || 500,
    message: error.message
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})