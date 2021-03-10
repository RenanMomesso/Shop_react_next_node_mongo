const express = require('express')
const app = express();
const cors = require('cors')
const morgan = require('morgan')
const cloudinary = require('cloudinary')


const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middleware/errors')

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(morgan('dev'))


//cloudinary files
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

//import all routes
const products =  require('./routes/product')
const auth = require('./routes/auth')

app.use('/api/v1', products)
app.use('/api/v1', auth)

app.use(errorMiddleware)


module.exports = app;