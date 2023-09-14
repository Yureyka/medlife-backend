import express from "express";
import bcrypt from "bcrypt";

import { UserModel } from "../models";
import { IUser } from "../models/User";
import { createJWTToken } from "../utils";

class UserController {
    getMe = (req: any, res: express.Response) => {
        const userId: string = req.user && req.user._id;
        UserModel.findById(userId)
            .populate({
                path: "orders",
                select: "_id createdAt cart status",
                populate: { path: "cart.product", select: "_id name price" }
            })
            .exec((err, user: IUser | any) => {
                if (err || !user) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }
                res.status(200).json(user);
            });
    };

    create(req: express.Request, res: express.Response) {
        const postData = {
            fullname: req.body.fullname,
            email: req.body.email,
            password: req.body.password
        };
        const user = new UserModel(postData);
        user.save()
            .then((obj: any) => {
                res.status(200).json(obj);
            })
            .catch(reason => {
                res.status(500).json({ message: reason.message });
            });
    }

    login(req: express.Request, res: express.Response) {
        const postData = {
            email: req.body.email,
            password: req.body.password
        };

        UserModel.findOne({ email: postData.email }, (err: any, user: IUser) => {
            if (err || !user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (bcrypt.compareSync(postData.password, user.password)) {
                const token: string = createJWTToken(user);
                res.status(200).json({
                    status: "Success",
                    token,
                    admin: user.admin
                });
            } else {
                res.status(401).json({
                    message: "Incorrect password or email"
                });
            }
        });
    }

    update(req: any, res: express.Response) {
        const userId: string = req.user && req.user._id;
        const postData: any = {
            fullname: req.body.fullname,
            phone: req.body.phone,
            address: req.body.address
        };
        if (req.body.password) {
            postData.password = req.body.password;
        }

        UserModel.findByIdAndUpdate(userId, { $set: postData }, { new: true })
            .populate({
                path: "orders",
                select: "_id createdAt cart status",
                populate: { path: "cart.product", select: "_id name price" }
            })
            .exec((err, user) => {
                if (err || !user) {
                    return res.status(404).json({ message: "User not found" });
                }

                res.status(200).json(user);
            });
    }

    getCount(req: express.Request, res: express.Response) {
        Promise.all([
            UserModel.countDocuments(),
            UserModel.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getTime() - 31 * 60 * 60 * 24 * 1000)
                }
            }),
            UserModel.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000)
                }
            }),
            UserModel.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().getTime() - 1 * 60 * 60 * 24 * 1000)
                }
            })
        ])
            .then(results => {
                const [all, lastMonth, lastWeek, lastDay] = results;
                res.status(200).json({
                    all,
                    lastMonth,
                    lastWeek,
                    lastDay
                });
            })
            .catch(err => {
                res.status(500).json(err);
            });
    }
}

export default UserController;
