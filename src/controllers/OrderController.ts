import express from "express";

import { OrderModel, UserModel } from "../models";

class OrderController {
    showAll(req: any, res: express.Response) {
        const admin: string = req.user && req.user.admin;
        if (!admin) {
            return res.status(403).json({ message: "No access" });
        }

        OrderModel.find()
            .sort({ createdAt: -1 })
            .populate("cart.product")
            .exec((err, orders) => {
                if (err) {
                    return res.status(500).json(err);
                }

                res.status(200).json(orders);
            });
    }

    create(req: any, res: express.Response) {
        const userId: string = req.user && req.user._id;
        const postData = {
            type: req.body.type,
            fullname: req.body.fullname,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            cart: req.body.cart,
            payment: req.body.payment,
            delivery: req.body.delivery,
            comment: req.body.comment,
            time: req.body.time,
            date: req.body.date,
            status: req.body.status
        };
        const order = new OrderModel(postData);
        order
            .save()
            .then((obj: any) => {
                order.populate("cart.product", "_id name price", () => {
                    if (userId && obj.type === "Оформление заказа") {
                        UserModel.findByIdAndUpdate(
                            userId,
                            { $push: { orders: obj._id } },
                            { upsert: true },
                            err => {
                                if (err) {
                                    return res.status(500).json({ message: err });
                                }
                            }
                        );
                    }

                    res.status(200).json(obj);
                });
            })
            .catch(reason => {
                res.status(500).json({ message: reason.message });
            });
    }

    update(req: any, res: express.Response) {
        const admin: string = req.user && req.user.admin;
        if (!admin) {
            return res.status(403).json({ message: "No access" });
        }

        const id: string = req.params.id;
        const postData = {
            status: req.body.status
        };
        OrderModel.findByIdAndUpdate(
            id,
            { $set: postData },
            { new: true },
            (err, order) => {
                if (err || !order) {
                    return res.status(404).json({ message: "Order not found" });
                }
                res.status(200).json(order);
            }
        );
    }

    delete(req: any, res: express.Response) {
        const admin: string = req.user && req.user.admin;
        if (!admin) {
            return res.status(403).json({ message: "No access" });
        }

        const id: string = req.params.id;
        OrderModel.findOneAndRemove({ _id: id })
            .then(order => {
                if (order) {
                    if (order.type === "Оформление заказа") {
                        UserModel.findOneAndUpdate(
                            { orders: id },
                            { $pull: { orders: id } },
                            { upsert: true },
                            err => {
                                if (err) {
                                    return res.status(500).json({ message: err });
                                }
                            }
                        );
                    }

                    res.status(200).json({
                        message: "Order deleted"
                    });
                }
            })
            .catch(() => {
                res.status(404).json({ message: "Order not found" });
            });
    }

    getCount(req: express.Request, res: express.Response) {
        Promise.all([
            OrderModel.countDocuments({ type: "Оформление заказа" }),
            OrderModel.countDocuments({
                type: "Оформление заказа",
                createdAt: {
                    $gte: new Date(new Date().getTime() - 31 * 60 * 60 * 24 * 1000)
                }
            }),
            OrderModel.countDocuments({
                type: "Оформление заказа",
                createdAt: {
                    $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000)
                }
            }),
            OrderModel.countDocuments({
                type: "Оформление заказа",
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

export default OrderController;
