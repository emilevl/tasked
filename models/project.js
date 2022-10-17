import mongoose from 'mongoose';
const Schema = mongoose.Schema;
// Define the schema for projects
const projectSchema = new Schema({
  name: String,
  active: Boolean,
  description: String,
  company: String
});
// Create the model from the schema and export it
export default mongoose.model('Project', projectSchema);