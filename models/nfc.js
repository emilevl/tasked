import mongoose from 'mongoose';
const Schema = mongoose.Schema;
// Define the schema for nfcs
const nfcSchema = new Schema({
  codeNfc: {type: String, unique: [true, 'This NFC already exist.']},
  active: { type: Boolean, default: true  }, // If the project is not active: cannot add tasks on it.
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
});

// Create the model from the schema and export it
export default mongoose.model('Nfc', nfcSchema);