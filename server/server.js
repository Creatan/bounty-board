import express from 'express'
import mongoose from 'mongoose'
import P from 'bluebird'
import dotenv from 'dotenv'
import path from 'path'
import bodyParser from 'body-parser'
import session from 'express-session'
import connectMongoDBSession from 'connect-mongodb-session'
import passport from 'passport'
import passportReddit from 'passport-reddit'

import logger from './logger'
import bounties from './routes/index'
import teams from './routes/team'
import season from './routes/season'
import auth from './routes/auth'
import userRoute from './routes/user'

import User from './models/user'
import { HttpError } from './utils'

dotenv.config()

const port = process.env.PORT || 4000

mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P })

const MongoDBStore = connectMongoDBSession(session)
const store = new MongoDBStore({
  uri: process.env.DBURI,
  collection: 'sessions',
})

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
  secret: process.env.SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 180 * 24 * 60 * 60 * 1000,
  },
  resave: false,
  saveUninitialized: false,
  store,
}))

const RedditStrategy = passportReddit.Strategy
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({ _id: id }).exec()
  return done(null, user)
})

passport.use(new RedditStrategy({
  clientID: process.env.REDDIT_ID,
  clientSecret: process.env.REDDIT_SECRET,
  callbackURL: process.env.REDDIT_CALLBACK,
}, async (accessToken, refreshToken, profile, done) => {
  const user = await User.findOne({ redditName: profile.name }).exec()
  if (!user) {
    const newUser = await (new User({
      redditId: profile.id,
      redditName: profile.name,
    }).save())
    return done(null, newUser)
  }
  return done(null, user)
}))

app.use(passport.initialize())
app.use(passport.session())
app.use('/', express.static(path.join(__dirname, 'static')))

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

app.use('/api/v1/bounty', bounties)
app.use('/api/v1/team', teams)
app.use('/api/v1/season', season)
app.use('/api/v1/user', userRoute)
app.use('/auth', auth)

// Error handler
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  if (error instanceof HttpError) {
    res.status(error.status)
    res.json({ status: error.status, message: error.message })
  } else {
    console.log(error)
    res.status(500)
    res.send(error)
  }
})

app.listen(port)
logger.info(`Server listening in port ${port}`)
