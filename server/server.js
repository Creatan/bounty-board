import express from 'express'
import mongoose from 'mongoose'
import P from 'bluebird'
import dotenv from 'dotenv'
import path from 'path'
import bodyParser from 'body-parser'

import logger from './logger'
import bounties from './routes/index'

dotenv.config()

const port = process.env.PORT || 4000

mongoose.Promise = P
mongoose.connect(process.env.DBURI, { useNewUrlParser: true, promiseLibrary: P })

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

app.use('/', bounties)

app.get('/api/:id', (req, res) => {
  logger.info(`${new Date()} ${req.params.id}`)
  res.json({})
})

app.listen(port)
logger.info(`Server listening in port ${port}`)
