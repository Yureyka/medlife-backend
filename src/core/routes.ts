import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  UserController,
  DoctorController,
  ServicesGroupController,
  ServiceController,
  NewsController,
  GalleryController,
  CommentController,
  CallRequestController,
  AppointmentController,
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
  const CallRequest = new CallRequestController();
  const Appointment = new AppointmentController();

  app.get("/api/user/me", User.getMe);
  // app.post("/api/user/create", User.create);
  app.post("/api/user/login", User.login);

  app.get("/api/doctors", Doctor.showPaginated);
  app.get("/api/doctors/showAll", Doctor.showAll);
  app.get("/api/doctors/:id", Doctor.showById);
  app.post("/api/doctors/create", upload.single("image"), Doctor.create);
  app.put("/api/doctors/update/:id", upload.single("image"), Doctor.update);
  app.delete("/api/doctors/delete/:id", Doctor.delete);

  app.get("/api/service-groups-all", ServicesGroup.showAll);
  app.get("/api/services-groups-paginated", ServicesGroup.showPaginated);
  app.get("/api/service-groups/:key", ServicesGroup.showOneGroupServices);
  app.get("/api/service-groups", ServicesGroup.showGroups);
  app.get("/api/service-groups/table", ServicesGroup.getServicesTable);
  app.post("/api/service-groups/create", ServicesGroup.create);
  app.put("/api/service-groups/update/:id", ServicesGroup.update);
  app.delete("/api/service-groups/delete/:id", ServicesGroup.delete);

  app.get("/api/services", Service.showAll);
  app.post("/api/services/create", Service.create);
  app.put("/api/services/update/:id", Service.update);
  app.delete("/api/services/delete/:id", Service.delete);

  app.get("/api/comments", Comment.showAll);
  app.get("/api/comments-paginated", Comment.showPaginated);
  app.post("/api/comments/create", Comment.create);
  app.put("/api/comments/update/:id", Comment.update);
  app.delete("/api/comments/delete/:id", Comment.delete);

  app.get("/api/news", News.showPaginated);
  app.get("/api/news/all", News.showAll);
  app.get("/api/news/:id", News.showById);
  app.post("/api/news/create", upload.single("image"), News.create);
  app.put("/api/news/update/:id", upload.single("image"), News.update);
  app.delete("/api/news/delete/:id", News.delete);

  app.get("/api/gallery", Gallery.showAll);
  app.get("/api/gallery-paginated", Gallery.showPaginated);
  app.post("/api/gallery/create", upload.single("image"), Gallery.create);
  app.delete("/api/gallery/delete/:id", Gallery.delete);

  app.get("/api/call-requests", CallRequest.showAll);
  app.post("/api/call-requests/create", CallRequest.create);
  app.delete("/api/call-requests/delete/:id", CallRequest.delete);
  app.put("/api/call-requests/update/:id", CallRequest.update);

  app.get("/api/appointments", Appointment.showAll);
  app.post("/api/appointments/create", Appointment.create);
  app.delete("/api/appointments/delete/:id", Appointment.delete);
  app.put("/api/appointments/update/:id", Appointment.update);
};

export default createRoutes;
