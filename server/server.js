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
import auth from './routes/auth'

import User from './models/user'

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

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

app.use('/', bounties)
app.use('/api/v1/teams', teams)
app.use('/auth', auth)

app.listen(port)
logger.info(`Server listening in port ${port}`)
