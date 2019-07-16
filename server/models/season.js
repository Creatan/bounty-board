import mongoose from 'mongoose'

const SeasonSchema = mongoose.Schema({
  identifier: String,
  leagues: [{
    name: String,
    divisions: [String],
  }],
  active: Boolean,
})
if (!SeasonSchema.options.toJSON)SeasonSchema.options.toJSON = {}
SeasonSchema.options.toJSON.transform = (doc, ret) => {
  const { _id, __v, ...json } = ret
  return json
}
export default mongoose.model('Season', SeasonSchema)
