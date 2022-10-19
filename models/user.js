import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;
// Define the schema for users
const userSchema = new Schema({
  firstName: {
    type: String, // Type validation
    required: true, // Mandatory
    minlength: [ 3, 'First name is too short' ], // Minimum length
    maxlength: 20 // Maximum length
  },
  lastName: {
    type: String,
    required: true,
    minlength: [ 2, 'Last name is too short' ],
    maxlength: 20
  },
  username: {
    type: String, 
    required: true,
    minlength: [ 3, 'username is too short' ],
    maxlength: 20,
    unique: true
  },
  // TODO: Change type of password ? 
  passwordHash: {
    type: String,
    // required: true,
    minlength: [ 8, 'password is too short' ],
    maxlength: 20
  },
  //Roles: admin have all rights. editors can create and edit projects. Users can create tasks and edit them.
  role: {
    type: String,
    enum: [ 'admin', 'editor', 'user'],
    default: 'user'
  },
});

userSchema.virtual('password');

userSchema.pre('save', async function() {
  const passwordHash = await bcrypt.hash(this.password, 10)
  this.username = this.username.toLowerCase()
  this.passwordHash = passwordHash;
})

// Removing the password when sending through API.
userSchema.set("toJSON", {
  transform: transformJsonUser
});
function transformJsonUser(doc, json, options) {
 // Remove the hashed password from the generated JSON.
 json.id = json._id;
 delete json._id;
 delete json.__v;
 delete json.passwordHash;
 return json;
}

// Create the model from the schema and export it
export default mongoose.model('User', userSchema);