import mongoose from 'mongoose';
const Schema = mongoose.Schema;
// Define the schema for projects
const projectSchema = new Schema({
  name: String,
  active: Boolean, // If the project is not active: cannot add tasks on it.
  description: String,
  company: String,
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: "Task"
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

projectSchema.pre('remove', async function() {
  console.log(this.tasks);
  console.log("HELOOOO");
})

// Create the model from the schema and export it
export default mongoose.model('Project', projectSchema);