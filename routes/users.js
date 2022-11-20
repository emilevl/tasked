import express from "express";
import User from "../models/user.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";
import * as utils from "./utils.js";

const usersRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;

// Only admins can access the users in any way

usersRouter.get("/", authenticate, function (req, res, next) {
    const authorized = req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }
    const countQuery = queryUser(req);
  countQuery.countDocuments(function (err, total) {
    if (err) {
      return next(err);
    }

    // Parse pagination parameters from URL query parameters.
    const { page, pageSize } = utils.getPaginationParameters(req);

    // Count the number of tasks done for each users
    User.aggregate(
      [
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'user',
            as: 'tasksdone'
          }
        },
        {
          $unwind: {
            path: '$tasksdone',
            // Preserve users who didn't created a task yet.
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            tasksdone: {
              $cond: {
                if: '$tasksdone',
                then: 1,
                else: 0
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            firstName: { $first: '$firstName' },
            lastName: { $first: '$lastName' },
            username: { $first: '$username' },
            tasksdone: {$sum: '$tasksdone'}
          }
        },
        {
          $sort: {
            username: 1
          }
        },
        {
          $skip: (page - 1) * pageSize
        },
        {
          $limit: pageSize
        }
      ],
      (err, users) => {
        if (err) {
          return next(err);
        }

        utils.addLinkHeader('/users', page, pageSize, total, res);
        // res.send(users);
        res.send(
          users.map(user => {
            // Transform the aggregated object into a Mongoose model.
            const serialized = new User(user).toJSON();

            // Add the aggregated property.
            serialized.tasksdone = user.tasksdone;

            return serialized;
          })
        );
      }
    );
  });
});

/* POST create a new user */
usersRouter.post('/', authenticate, function(req, res, next) {
  // Only admins can create a user
  const authorized = req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }
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

/* POST register as a new user */
usersRouter.post('/register', function(req, res, next) {

  // Create a new document from the JSON in the request body
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    password: req.body.password
  }
  const newUser = new User(user);
  // Save that document
  newUser.save(function(err, savedUser) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send({message: "User successfuly created !", savedUser});
  });
});

/* PATCH edit a user */
usersRouter.patch('/:id', authenticate, function (req,res,next) {
  User.findById(req.params.id).exec(function(err, task) {
    if (err) {
      return next(err);
    }
  });

  // Only the admin can edit a user's information
  const authorized = req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }
    
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((user) => {
      if (!user) {
        return res.status(404).send();
      }
      res.send(user);
    }).catch((error) => {
      res.status(500).send(error);
    });
});

// Router to delete all users. Dev purpose only.
// usersRouter.delete('/all', authenticate, function (req,res,next) {
  
//   const authorized = req.role.includes("admin");
//     if (!authorized) {
//       return res.status(403).send("Please mind your own things.")
//     }

//   User.collection.drop(function (err) {
//     if (err) {
//       return next(err);
//     }

//     res.sendStatus(204);
//   })
// });

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

/**
 * Returns a Mongoose query that will retrieve users filtered with the URL query parameters.
 */
 function queryUser(req) {
  
  let query = User.find();

  if (typeof req.query.id == 'string') {
    query = query.where('_id').equals(req.query.id);
  }
  if (typeof req.query.username == 'string') {
    query = query.where('username').equals(req.query.username);
  }
  if (typeof req.query.firstName == 'string') {
    query = query.where('name').equals(req.query.firstName);
  }

  return query;
}

/**
 * Responds with 404 Not Found and a message indicating that the user with the specified ID was not found.
 */
 function userNotFound(res, userId) {
  return res.status(404).type('text').send(`No user found with ID ${userId}`);
}

export default usersRouter;

