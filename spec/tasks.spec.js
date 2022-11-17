import mongoose from "mongoose"
import supertest from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.js"

beforeEach(cleanUpDatabase);


describe(`GET /tasks`, function() {
    test.todo('should get a list of tasks');
  });
  
  describe(`POST /tasks`, function() {
    test.todo('should refuse the task creation (no project)');
  });
  
  describe(`POST /tasks`, function() {
    test.todo('should create a new task');
  });
  
  describe(`PATCH /tasks?id=id`, function() {
    test.todo('should edit a task information');
  });
  
  describe(`DELETE /tasks?id=id`, function() {
    test.todo('should delete a specific task');
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
  });