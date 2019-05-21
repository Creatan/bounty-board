import mongoose from 'mongoose'

const SeasonSchema = mongoose.Schema({
  identifier: String,
})

export default mongoose.model('Season', SeasonSchema)
