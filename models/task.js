  import mongoose from 'mongoose';
  const Schema = mongoose.Schema;
  // Define the schema for the tasks
  const taskSchema = new Schema({
    name: String,
    startDate: { type: Date, default: Date.now  },
    endDate: { type: Date, default: Date.now  },
    duration: Number,
    description: {
      type: String, // Type validation
      maxlength: 200 // Maximum length
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  });

  taskSchema.index({ startDate: 1, name: 1 });

  // Create the model from the schema and export it: Task = tasks in the DB
  export default mongoose.model('Task', taskSchema);