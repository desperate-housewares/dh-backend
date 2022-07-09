const express = require("express")
const router = express.Router()
const session = require('express-session')
const MongoStore = require('connect-mongo')
const authRoutes = require('./auth-routes')
const itemRoutes = require('./item_routes')
const userRoutes = require('./user-routes')
const auth = require('../middleware/authenticate')

const sessionConfig = {
  name: 'UID', // name of cookie
  secret: process.env.COOKIE_SECRET, // secret that makes the cookie effective
  cookie: {
    maxAge: 1000 * 60 * 60, // time span of cookie in ms
    secure: false, // set to true in production for HTTPS only access
    httpOnly: true // true = no access from js
  },
  resave: false,
  saveUninitialized: true, // set to false in production, user has to give consent
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_STORE_URI
  })
}

router.use(session(sessionConfig))

router.use('/auth', authRoutes)
router.use('/items', itemRoutes)
router.use('/user', auth, userRoutes)

module.exports = router