import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  UserController,
  DoctorController,
  ServicesGroupController,
  ServiceController,
  FactoryController,
  NewsController,
  GalleryController,
  CommentController,
  OrderController,
  CallRequestController,
} from "../controllers";
import { checkAuth } from "../middlewares";

const createRoutes = (app: express.Express, upload: any) => {
  app.use(cors());
  app.use(bodyParser.json());
  app.use(checkAuth);

  const User = new UserController();
  const Doctor = new DoctorController();
  const Service = new ServiceController();
  const ServicesGroup = new ServicesGroupController();
  const Gallery = new GalleryController();
  const News = new NewsController();
  const Comment = new CommentController();
  const Order = new OrderController();
  const CallRequest = new CallRequestController();

  app.get("/user/me", User.getMe);
  app.get("/user/stats", User.getCount);
  app.post("/user/signup", User.create);
  app.post("/user/signin", User.login);
  app.put("/user/update", User.update);

  app.get("/doctors", Doctor.showPaginated);
  app.get("/doctors/showAll", Doctor.showAll);
  app.get("/doctors/:id", Doctor.showById);
  app.post("/doctors/create", upload.single("image"), Doctor.create);
  app.put("/doctors/update/:id", upload.single("image"), Doctor.update);
  app.delete("/doctors/delete/:id", Doctor.delete);

  app.get("/service-groups-all", ServicesGroup.showAll);
  app.get("/service-groups", ServicesGroup.showGroups);
  app.get("/service-groups/table", ServicesGroup.getServicesTable);
  app.post(
    "/service-group/create",
    upload.single("file"),
    ServicesGroup.create
  );
  app.put("/service-group/:id", ServicesGroup.update);
  app.delete("/service-group/:id", ServicesGroup.delete);

  // app.get("/service/:id", Service.showById);
  app.get("/services", Service.showAll);
  app.post("/services/create", Service.create);
  app.put("/services/update/:id", Service.update);
  app.delete("/services/delete/:id", Service.delete);

  app.get("/comments", Comment.showAll);
  app.post("/comments/create", Comment.create);
  app.put("/comments/:id", Comment.update);
  app.delete("/comments/:id", Comment.delete);

  app.get("/news", News.showByPage);
  app.get("/news/all", News.showAll);
  app.get("/news/last", News.showLast);
  app.get("/news/:id", News.showById);
  app.post("/news/create", upload.single("file"), News.create);
  app.put("/news/update/:id", upload.single("file"), News.update);
  app.delete("/news/delete/:id", News.delete);

  app.get("/gallery", Gallery.showAll);
  app.get("/gallery-paginated", Gallery.showPaginated);
  app.post("/gallery/create", upload.single("image"), Gallery.create);
  app.delete("/gallery/delete/:id", Gallery.delete);

  app.get("/call-requests", CallRequest.showAll);
  app.post("/call-requests/create", CallRequest.create);
  app.delete("/call-requests/delete/:id", CallRequest.delete);
  app.put("/call-requests/update/:id", CallRequest.update);
};

export default createRoutes;
