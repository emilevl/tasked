import express from "express";
import Nfc from "../models/nfc.js"
import Project from "../models/project.js"
import mongoose from 'mongoose';
import { authenticate } from "./auth.js";

const NfcRouter = express.Router();
const ObjectId = mongoose.Types.ObjectId;

//TODO: filter by project name
NfcRouter.get("/", authenticate, function (req, res, next) {

    const authorized = req.role.includes("admin") ||  req.role.includes("editor");
    // get all the project and the infos of the user who created it.
    Nfc.find().populate("project").exec(function(err, nfc) {
      if (err) {
        console.log(err);
        return next(err);
      }
      res.send(nfc);
    });
});


NfcRouter.get("/:id", function (req, res, next) {
  const nfcId = req.params.id;

  Nfc.findOne({codeNfc: nfcId}).exec(function (err, nfc) {
    if (err) {
      return next(err);
    } else if (!nfc) {
      return nfcNotFound(res, nfcId);
    }
    
    res.send({project: nfc.project});
  });
  
});


NfcRouter.post("/", authenticate, async function (req, res, next) {
  
  // Only editors or admin can create a project
  const authorized = req.role.includes("admin") ||  req.role.includes("editor");
  if (!authorized) {
    return res.status(403).send("Please mind your own things.")
  }
  const projectExist =  await Project.findOne({_id: req.body.project });
  if(!projectExist) {
    return res.status(400).send("Project not found");
  }
// req.body.author = req.userId;
  const newNfc = new Nfc(req.body);
  // Save that document
  // console.log(req.userId);

  newNfc.save(function(err, savedNfc) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedNfc);
  });
});

//projectsRouter.put("/:id" /*...*/);

NfcRouter.delete("/:id", authenticate, function (req,res,next) {
  Nfc.findOne({codeNfc: req.params.id}).exec(function(err, aNfc) {
    if (err) {
      return next(err);
    }

    // Only admin or editor can edit a project
    const authorized = req.role.includes("admin") || req.role.includes("editor");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }

    console.log(req.params.id)
    Nfc.findOneAndDelete({ codeNfc: req.params.id }, function (err) {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  });
});

NfcRouter.patch('/:id', authenticate, function (req,res,next) {
  Nfc.findById(req.params.id).exec(function(err, aNfc) {
    if (err) {
      return next(err);
    }

    const authorized = req.role.includes("admin") || req.role.includes("editor");
      if (!authorized) {
        return res.status(403).send("Please mind your own things.")
      }
      
      Nfc.findByIdAndUpdate(req.params.id, req.body, {new: true}).then((aNfc) => {
        if (!aNfc) {
          return res.status(404).send();
        }
        res.send(aNfc);
      }).catch((error) => {
        res.status(500).send(error);
      });
    });
});




/**
 * Responds with 404 Not Found and a message indicating that the project with the specified ID was not found.
 */
 function nfcNotFound(res, nfcId) {
  return res.status(404).type('text').send(`No nfc found with ID ${nfcId}`);
}


export default NfcRouter;