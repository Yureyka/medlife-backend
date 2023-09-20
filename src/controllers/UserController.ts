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

  create(req: express.Request, res: express.Response) {
    const postData = {
      login: req.body.login,
      email: req.body.email,
      password: req.body.password,
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
          message: "Incorrect password or email",
        });
      }
    });
  }

  update(req: any, res: express.Response) {
    const userId: string = req.user && req.user._id;
    const postData: any = {
      fullname: req.body.fullname,
      phone: req.body.phone,
      address: req.body.address,
    };
    if (req.body.password) {
      postData.password = req.body.password;
    }

    UserModel.findByIdAndUpdate(userId, { $set: postData }, { new: true })
      .populate({
        path: "orders",
        select: "_id createdAt cart status",
        populate: { path: "cart.product", select: "_id name price" },
      })
      .exec((err, user) => {
        if (err || !user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
      });
  }
}

export default UserController;
