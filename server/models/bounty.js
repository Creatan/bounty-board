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
  provider: {
    name: String,
    id: mongoose.Schema.Types.ObjectId,
  },
  requirement: [String],
  prize: String,
  reason: String,
  status: {
    type: String,
    enum: ['open', 'claimable', 'claimed'],
  },
  season: String,
  match: String,
})

export default mongoose.model('Bounty', BountySchema)
