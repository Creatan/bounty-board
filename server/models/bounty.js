import mongoose from 'mongoose'

const BountySchema = mongoose.Schema({
  player: {
    id: Number,
    name: String,
  },
  team: {
    id: Number,
    name: String,
  },
  league: String,
  provider: String,
  requirement: String,
  prize: String,
  reason: String,
  claimed: Boolean,
})

export default mongoose.model('Bounty', BountySchema)
