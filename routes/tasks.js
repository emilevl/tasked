import express from "express";
import Task from "../models/task.js"
import Project from "../models/project.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";
// import { paginate } from "./utils.js";

const tasksRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;


tasksRouter.get("/", authenticate, function (req, res, next) {
  const authorized = req.role.includes("user") || req.role.includes("editor") || req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    const filters = req.query;
    // get all the tasks and the infos of the user who created it.
    Task.find().sort('name').populate("user").populate("project").exec(function(err, tasks) {
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
          } else if(key) {
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

    Project.findById(req.body.project, function(err, project) {
      if (err) return res.send(err);
      console.log(project);
      project.tasks.push(savedTask._id);
      project.save(function(err) {
        if (err) return res.send(err);
        // res.json({ status : 'done' });
      });
    });

    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedTask);
  });
});

tasksRouter.get("/:id", function (req, res, next) {
  const taskId = req.params.id;
  if (!ObjectId.isValid(taskId)) {
    return taskNotFound(res, taskId);
  }
  
  Task.findById(taskId, function (err, task) {
    if (err) {
      return next(err);
    } else if (!task) {
      return taskNotFound(res, taskId);
    }
    
    res.send(task);
  });
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

tasksRouter.post('/end/:id', authenticate, function (req,res,next) {
  Task.findById(req.params.id).exec(function(err, task) {
    if (err) {
      return next(err);
    }
    const authorized = req.userId === task.user.toString();
      if (!authorized) {
        return res.status(403).send("Please mind your own things.")
      }

      const dataToUpdate = {endDate: Date.now()};
    
      Task.findByIdAndUpdate(req.params.id, dataToUpdate, {new: true}).then((task) => {
        if (!task) {
          return res.status(404).send();
        }
        res.send(task);
      }).catch((error) => {
        res.status(500).send(error);
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

/**
 * Responds with 404 Not Found and a message indicating that the task with the specified ID was not found.
 */
 function taskNotFound(res, taskId) {
  return res.status(404).type('text').send(`No task found with ID ${taskId}`);
}
export default tasksRouter;