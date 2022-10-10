import express from "express";
import Project from "../models/project.js"

const projectsRouter = express.Router();

// projectsRouter.post("/" /*...*/);
/*projectsRouter.get("/", function (req, res, next) {
  const books = ["Catch-22", "Fahrenheit 451"];
  res.send(books);
});
projectsRouter.get("/:id", function (req, res, next) {
  const book = { title: "Fahrenheit 451", year: 1953, author: "Ray Bradburry" };
  res.send(book);
});*/

//projectsRouter.put("/:id" /*...*/);
//projectsRouter.delete("/:id" /*...*/);
export default projectsRouter;