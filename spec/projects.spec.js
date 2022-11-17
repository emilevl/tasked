import mongoose from "mongoose"
import supertest from "supertest";
import app from "../app.js";
import { cleanUpDatabase } from "./utils.js"

beforeEach(cleanUpDatabase);

describe(`GET /projects`, function() {
    test.todo('should create a project');
  });
  
describe(`DELETE /projects?id=id`, function() {
    test.todo('should refuse deleting the project (a task exist in it)');
  });
  

  describe(`DELETE /projects?id=id`, function() {
    test.todo('should delete a project');
  });
  
  afterAll(async () => {
    await mongoose.disconnect();
  });