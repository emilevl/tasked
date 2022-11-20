import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const imageSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    img: {
        type: String,
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    }
});

// Create the model from the schema and export it
export default mongoose.model('Image', imageSchema);