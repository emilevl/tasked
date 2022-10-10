import express from "express";
import Task from "../models/task.js"

const tasksRouter = express.Router();

// tasksRouter.post("/" /*...*/);
/*tasksRouter.get("/", function (req, res, next) {
  const books = ["Catch-22", "Fahrenheit 451"];
  res.send(books);
});
tasksRouter.get("/:id", function (req, res, next) {
  const book = { title: "Fahrenheit 451", year: 1953, author: "Ray Bradburry" };
  res.send(book);
});*/

//tasksRouter.put("/:id" /*...*/);
//tasksRouter.delete("/:id" /*...*/);
export default tasksRouter;