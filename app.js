import mongoose from 'mongoose';
mongoose.Promise = Promise;
import * as config from './config.js';
mongoose.connect(config.databaseUrl);
import express from "express";
import createError from "http-errors";
import logger from "morgan";
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import NfcRouter from "./routes/nfc.js";
import ImageRouter from "./routes/images.js";
import projectsRouter from "./routes/projects.js";
import authRouter from "./routes/auth.js";
import cors from 'cors';

// Documentation api
import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';


const app = express();

// Documentation
// Parse the OpenAPI document.
const openApiDocument = yaml.load(fs.readFileSync('./openapi.yml'));
// Serve the Swagger UI documentation.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", config.corsDomain); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.redirect("/api-docs/")
});

app.use(cors({
  origin: [config.corsDomain]
}));

app.use("/tasks", tasksRouter);
app.use("/projects", projectsRouter);
app.use("/users", usersRouter);
app.use("/nfc", NfcRouter);
app.use("/images", ImageRouter);
app.use("/auth", authRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Send the error status
  res.status(err.status || 500);
  res.send(err.message);
});



export default app;
