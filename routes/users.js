import express from "express";
import User from "../models/user.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";

const usersRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;

usersRouter.get("/", authenticate, function (req, res, next) {
  // usersRouter.get("/", function (req, res, next) {
    // const authorized = req.role.includes("admin") || req.userId === thing.user.toString();
    const authorized = req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    const filters = req.query;
    // console.log(req.query.username);
    User.find().sort('firstName').exec(function(err, users) {
      if (err) {
        console.log(err);
        return next(err);
      }
      const filteredUsers = users.filter(user => {
        let isValid = true;
        for (const key in filters) {
          // console.log(key, user[key], filters[key]);
          if (key==='id') {
            isValid = isValid && user[key] == filters[key];
          }else {
            const regex = new RegExp(`^${filters[key]}`);
            isValid = isValid && user[key].toLowerCase().match(regex);
          }
        }
        return isValid;
      });
      res.send(filteredUsers);
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
usersRouter.delete('/all', authenticate, function (req,res,next) {
  
  const authorized = req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

  User.collection.drop(function (err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  })
});

usersRouter.delete('/:id', authenticate, loadUserFromParamsMiddleware, function (req, res, next) {
  const authorized = req.role.includes("admin");
  if (!authorized) {
    return res.status(403).send("Please mind your own things.")
  }
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

