import mongoose from 'mongoose'

const UserSchema = mongoose.Schema({
  redditId: String,
  redditName: String,
  discord: String,
})

export default mongoose.model('user', UserSchema)
