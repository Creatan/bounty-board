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
  division: String,
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  requirement: [String],
  prize: String,
  reason: String,
  status: {
    type: String,
    enum: ['open', 'claimable', 'claimed'],
  },
  season: String,
  match: String,
  deleted: { type: Boolean, default: false },
})

export default mongoose.model('Bounty', BountySchema)
