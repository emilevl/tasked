import express from "express";
import Image from "../models/image.js"
import Project from "../models/project.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";

const ImageRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;

ImageRouter.get("/", authenticate, async function (req, res, next) {

    const authorized = req.role.includes("user") || req.role.includes("admin") ||  req.role.includes("editor");
    // get all the project and the infos of the user who created it.
        let query = Image.find();  
    if (req.query) {
      if (typeof req.query.name == 'string') {
            // query = query.where('name').equals(`/^${req.query.name}*/`);
            query = Image.find({ name: new RegExp(req.query.name, 'i')})
        }
        if (typeof req.query.id == 'string') {
            query = query.where('_id').equals(req.query.id);
        }
        if (typeof req.query.project == 'string') {
            query = query.where('project').equals(req.query.project);
        }
        
    }
  
    // const allImages = await queryImage(req);
    // res.send(allImages);
    query.exec(function(err, images) {
      if (err) {
        return next(err);
      }
      res.send(images);
    });
});


ImageRouter.get("/:id", function (req, res, next) {
  const idImg = req.params.id;

  Image.findOne({_id: idImg}).exec(function (err, image) {
    if (err) {
      return next(err);
    } else if (!image) {
      return imageNotFound(res, idImg);
    }
    
    res.send(image);
  });
  
});


ImageRouter.post("/", authenticate, async function (req, res, next) {

  const authorized = req.role.includes("user") || req.role.includes("admin") ||  req.role.includes("editor");
  if (!authorized) {
    return res.status(403).send("Please mind your own things.")
  }
  const projectExist =  await Project.findOne({_id: req.body.project });
  if(!projectExist) {
    return res.status(400).send("Project not found");
  }

  // req.body.author = req.userId;
  const newImage = new Image(req.body);
  // Save that document

  newImage.save(function(err, savedImage) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedImage);
  });
});

//projectsRouter.put("/:id" /*...*/);

ImageRouter.delete("/:id", authenticate, function (req,res,next) {
  Image.findOne({_id: req.params.id}).exec(function(err, image) {
    if (err) {
      return next(err);
    }

    // Only admin or editor can edit a project
    const authorized = req.role.includes("user") || req.role.includes("admin") || req.role.includes("editor");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    Image.findOneAndDelete({ _id: req.params.id }, function (err) {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  });
});

ImageRouter.patch('/:id', authenticate, function (req,res,next) {
  Image.findById(req.params.id).exec(function(err, image) {
    if (err) {
      return next(err);
    }

    const authorized = req.role.includes("user") || req.role.includes("admin") || req.role.includes("editor");
      if (!authorized) {
        return res.status(403).send("Please mind your own things.")
      }
      
      Image.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((image) => {
        if (!image) {
          return res.status(404).send();
        }
        res.send(image);
      }).catch((error) => {
        res.status(500).send(error);
      });
    });
});




/**
 * Responds with 404 Not Found and a message indicating that the project with the specified ID was not found.
 */
 function imageNotFound(res, imageName) {
  return res.status(404).type('text').send(`No image found with ID ${imageName}`);
}

/**
 * Returns a Mongoose query that will retrieve users filtered with the URL query parameters.
 */
 function queryImage(req) {
  
    let query = Image.find();
  
    if (typeof req.query.id == 'string') {
      query = query.where('_id').equals(req.query.id);
    }
    if (typeof req.query.project == 'string') {
      query = query.where('project').equals(req.query.project);
    }
    if (typeof req.query.name == 'string') {
      query = query.where('name').equals(req.query.name);
    }
  
    return query;
  }
  


export default ImageRouter;
