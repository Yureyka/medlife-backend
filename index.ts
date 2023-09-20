import express from "express";
import dotenv from "dotenv";

dotenv.config();

import "./core/db";
import upload from "./core/multer";
import createRoutes from "./core/routes";

const app = express();

createRoutes(app, upload);

const PORT = process.env.PORT || 3004;

app.use(express.static(__dirname + "/build"));
app.get("*", function (request, response) {
  response.sendFile(__dirname + "/build/index.html");
});

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});

app.use("/uploads", express.static("uploads"));
