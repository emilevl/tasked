import express from "express";
import User from "../models/user.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";

const usersRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;

usersRouter.get("/", authenticate, function (req, res, next) {
  // usersRouter.get("/", function (req, res, next) {
  User.find().sort('firstName').exec(function(err, users) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.send(users);
  });
});

/* POST create a new user */
usersRouter.post('/', function(req, res, next) {
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

// TODO: improve the delete all (authentication, role...)
usersRouter.delete('/all', function (req,res,next) {
  User.collection.drop(function (err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  })
});
usersRouter.delete('/:id', loadUserFromParamsMiddleware, function (req, res, next) {
  
  req.user.remove(function (err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  });
  // Check if a movie exists before deleting
  // Movie.findOne({ directorId: req.user._id }).exec(function (err, movie) {
  //   if (err) {
  //     return next(err);
  //   } else if (movie) {
  //     // Do not delete if any movie is directed by this user
  //     return res
  //       .status(409)
  //       .type('text')
  //       .send(`Cannot delete user ${req.user.name} because movies are directed by them`);
  //   }

  //   req.user.remove(function (err) {
  //     if (err) {
  //       return next(err);
  //     }

  //     debug(`Deleted user "${req.user.name}"`);
  //     res.sendStatus(204);
  //   });
  // });
});

function loadUserFromParamsMiddleware(req, res, next) {
  const userId = req.params.id;
  if (!ObjectId.isValid(userId)) {
    return userNotFound(res, userId);
  }
  
  User.findById(req.params.id, function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return userNotFound(res, userId);
    }
    
    req.user = user;
    next();
  });
}

export default usersRouter;

