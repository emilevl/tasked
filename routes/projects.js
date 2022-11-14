import express from "express";
import Project from "../models/project.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";
import { broadcastMessage } from '../ws.js';

const projectsRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;

// projectsRouter.post("/" /*...*/);
projectsRouter.get("/", authenticate, function (req, res, next) {

    const filters = req.query;
    // get all the project and the infos of the user who created it.
    Project.find().sort('name').populate("author").populate("tasks").exec(function(err, projects) {
      if (err) {
        console.log(err);
        return next(err);
      }

      const filteredProjects = projects.filter(project => {
        let isValid = true;
        for (const key in filters) {
          // console.log(key, project[key], filters[key]);
          if (key==='id') {
            isValid = isValid && project[key] == filters[key];
          }else if (key === 'user'){
            const regex = new RegExp(`^${filters[key]}`);
            isValid = isValid && project.user.username.toLowerCase().match(regex);
          } else {
            const regex = new RegExp(`${filters[key]}`);
            isValid = isValid && project[key].toLowerCase().match(regex);
          }
        }
        return isValid;
      });
      res.send(filteredProjects);
    });
});

// TODO: Create a get with the :id
projectsRouter.get("/:id", function (req, res, next) {
  const projectId = req.params.id;
  if (!ObjectId.isValid(projectId)) {
    return projectNotFound(res, projectId);
  }
  
  Project.findById(projectId).populate("author").populate("tasks").exec(function (err, project) {
    if (err) {
      return next(err);
    } else if (!project) {
      return projectNotFound(res, projectId);
    }
    
    res.send(project);
  });
  
});

// projectsRouter.post("/" /*...*/);
projectsRouter.post("/", authenticate, function (req, res, next) {
  
  // Only editors or admin can create a project
  const authorized = req.role.includes("admin") ||  req.role.includes("editor");
  if (!authorized) {
    return res.status(403).send("Please mind your own things.")
  }
  req.body.author = req.userId;
  const newProject = new Project(req.body);
  // Save that document
  // console.log(req.userId);

  newProject.save(function(err, savedProject) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedProject);

    broadcastMessage({message:{
        event: "projectCreated",
        name: savedProject.name,
        data: ""
      } 
    });
  });
});

//projectsRouter.put("/:id" /*...*/);

projectsRouter.delete("/:id", authenticate, function (req,res,next) {
  Project.findById(req.params.id).exec(function(err, project) {
    if (err) {
      return next(err);
    }

    // Only admin or the author can edit a project
    const authorized = req.role.includes("admin") ||  req.userId === project.user.toString();
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    console.log(req.params.id)
    Project.findOneAndDelete({ _id: req.params.id }, function (err) {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  });
});

projectsRouter.patch('/:id', authenticate, function (req,res,next) {
  Project.findById(req.params.id).exec(function(err, project) {
    if (err) {
      return next(err);
    }

    const authorized = req.role.includes("admin") || (req.role.includes("editor") && req.userId === project.user.toString());
      if (!authorized) {
        return res.status(403).send("Please mind your own things.")
      }
      
      Project.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((project) => {
        if (!project) {
          return res.status(404).send();
        }
        res.send(project);
        broadcastMessage({message:{
          event: "projectUpdated",
          name: project.name,
          data: project
          }
        });
      }).catch((error) => {
        res.status(500).send(error);
      });
    });
});

projectsRouter.get('/:id/toggleactivity', authenticate, function (req,res,next) {
  Project.findById(req.params.id).exec(function(err, project) {
    if (err) {
      return next(err);
    }

    const authorized = req.role.includes("admin") || (req.role.includes("editor") && req.userId === project.user.toString());
      if (!authorized) {
        return res.status(403).send("Please mind your own things.")
      }
      Project.findByIdAndUpdate(req.params.id, {active: !project.active}, {new: true}).then((project) => {
        if (!project) {
          return res.status(404).send();
        }
        res.send(project);
        broadcastMessage({message:{
          event: "projectToggled",
          name: project.name,
          data: project.active
          } 
        });
      }).catch((error) => {
        res.status(500).send(error);
      });
    });
});

function toggleActivity(project) {
  if (project.active)
    return {active: false}
  else
    return {active: true }
}



/**
 * Responds with 404 Not Found and a message indicating that the project with the specified ID was not found.
 */
 function projectNotFound(res, projectId) {
  return res.status(404).type('text').send(`No project found with ID ${projectId}`);
}


export default projectsRouter;