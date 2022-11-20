import mongoose from 'mongoose';
const Schema = mongoose.Schema;
// Define the schema for nfcs
const nfcSchema = new Schema({
  codeNfc: {
    type: String, 
    unique: [true, 'This NFC already exist.'],
    required: true
  },
  active: { 
    type: Boolean, default: true 
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
});

// Create the model from the schema and export it
export default mongoose.model('Nfc', nfcSchema);