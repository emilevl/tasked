import express from "express";
import User from "../models/user.js"
const router = express.Router();

router.get("/", function (req, res, next) {
  User.find().sort('name').exec(function(err, users) {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.send(users);
  });
});

/* POST new user */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newUser = new User(req.body);
  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedUser);
  });
});

export default router;

