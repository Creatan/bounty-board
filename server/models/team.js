import mongoose from 'mongoose'

const TeamSchema = mongoose.Schema({
  id: Number,
  name: String,
  league: String,
  seasons: [String],
  roster: [{
    id: Number,
    name: String,
  }],
})

export default mongoose.model('team', TeamSchema)
