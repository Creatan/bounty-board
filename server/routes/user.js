import express from 'express'
import User from '../models/user'

const router = express.Router()


async function getUser(req, res) {
  if (req.user) {
    const user = await User.findOne({ _id: req.user._id }).exec()
    const { _id, __v, ...userData } = user.toObject()
    res.json(userData)
  } else { res.json({}) }
}

async function updateUser(req, res) {
  if (req.user) {
    console.log('body', req.body)
    const { discord } = req.body
    console.log('discord', discord)
    const user = await User.findOne({ _id: req.user._id }).exec()
    user.discord = discord
    const updatedUser = await user.save()
    const { _id, __v, ...userData } = updatedUser.toObject()
    res.json(userData)
  } else { res.json({}) }
}

router.get('/', getUser)
router.post('/', updateUser)

export default router
