import express from "express";
import bcrypt from "bcrypt";

import { UserModel } from "../models";
import { IUser } from "../models/User";
import { createJWTToken } from "../utils";

class UserController {
  getMe = (req: any, res: express.Response) => {
    const userId: string = req.user && req.user._id;
    UserModel.findById(userId).exec((err, user: IUser | any) => {
      if (err || !user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const token = createJWTToken(user);
      res.status(200).json({
        status: "Success",
        token,
      });
    });
  };

  create(req: any, res: express.Response) {
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }
    const postData = {
      login: req.body.login,
      password: req.body.password,
      admin: req.body.admin,
    };
    const user = new UserModel(postData);
    user
      .save()
      .then((obj: any) => {
        res.status(200).json(obj);
      })
      .catch((reason) => {
        res.status(500).json({ message: reason.message });
      });
  }

  login(req: express.Request, res: express.Response) {
    const postData = {
      login: req.body.login,
      password: req.body.password,
    };

    UserModel.findOne({ login: postData.login }, (err: any, user: IUser) => {
      if (err || !user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (bcrypt.compareSync(postData.password, user.password)) {
        const token = createJWTToken(user);
        res.status(200).json({
          status: "Success",
          token,
        });
      } else {
        res.status(401).json({
          message: "Incorrect password or login",
        });
      }
    });
  }
}

export default UserController;
