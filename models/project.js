import mongoose from 'mongoose';
const Schema = mongoose.Schema;
// Define the schema for users
const projectSchema = new Schema({
  name: String
});
// Create the model from the schema and export it
export default mongoose.model('User', projectSchema);