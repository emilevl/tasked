import express from "express";
import Task from "../models/task.js"
import { authenticate } from "./auth.js";

const tasksRouter = express.Router();


tasksRouter.get("/", authenticate, function (req, res, next) {
  const authorized = req.role.includes("user");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    const filters = req.query;
    // get all the tasks and the infos of the user who created it.
    Task.find().sort('name').populate("user").exec(function(err, tasks) {
      if (err) {
        console.log(err);
        return next(err);
      }

      const filteredTasks = tasks.filter(task => {
        let isValid = true;
        for (const key in filters) {
          // console.log(key, task[key], filters[key]);
          if (key==='id') {
            isValid = isValid && task[key] == filters[key];
          }else if (key === 'user'){
            const regex = new RegExp(`^${filters[key]}`);
            isValid = isValid && task.user.username.toLowerCase().match(regex);
          } else {
            const regex = new RegExp(`${filters[key]}`);
            isValid = isValid && task[key].toLowerCase().match(regex);
          }
        }
        return isValid;
      });
      res.send(filteredTasks);
    });
});


// tasksRouter.post("/" /*...*/);
tasksRouter.post("/", authenticate, function (req, res, next) {
  req.body.user = req.userId;
  const newTask = new Task(req.body);
  // Save that document
  // console.log(req.userId);

  newTask.save(function(err, savedTask) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedTask);
  });
});

tasksRouter.get("/:id", function (req, res, next) {
  const book = { title: "Fahrenheit 451", year: 1953, author: "Ray Bradburry" };
  res.send(book);
});


tasksRouter.delete('/all', authenticate, function (req,res,next) {
  const authorized = req.role.includes("admin")
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

  Task.collection.drop(function (err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(204);
  })
});

tasksRouter.delete('/:id', authenticate, function (req,res,next) {
  Task.findById(req.params.id).exec(function(err, task) {
    if (err) {
      return next(err);
    }

    const authorized = req.role.includes("admin") ||  req.userId === task.user.toString();
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    console.log(req.params.id)
    Task.findOneAndDelete({ _id: req.params.id }, function (err) {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  });
});

tasksRouter.patch('/:id', authenticate, function (req,res,next) {
  Task.findById(req.params.id).exec(function(err, task) {
    if (err) {
      return next(err);
    }

    const authorized = req.role.includes("admin") || req.userId === task.user.toString();
      if (!authorized) {
        return res.status(403).send("Please mind your own things.")
      }
      
      console.log(req.params.id)
      Task.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((task) => {
        if (!task) {
          return res.status(404).send();
        }
        res.send(task);
      }).catch((error) => {
        res.status(500).send(error);
      });
    });
});
export default tasksRouter;