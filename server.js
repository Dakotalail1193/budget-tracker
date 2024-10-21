const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require ('morgan')
require ('dotenv').config()
const {expressjwt} = require('express-jwt')
const path = require('path')

app.use(express.json())
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, "client", "dist")))

async function connectToDb(){
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to DB')
    } catch (error) {
        console.log(error)
    }
}

connectToDb()

app.use('/api/auth', require('./routes/authRouter'))
app.use('/api/main', expressjwt({secret: process.env.SECRET, algorithms:['HS256']}))
app.use('/api/main/withdrawal', require('./routes/withdrawalRouter'))
app.use('/api/main/deposit', require('./routes/depositRouter'))


app.use ((err, req, res, next) =>{
    console.log(err)
    if (err.name === "UnauthorizedError"){
        res.status(err.status)
    }
    return res.send({errMsg: err.message})
})

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "client", "dist", "index.html")))

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})