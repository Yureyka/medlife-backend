import express from "express";

import { CommentModel } from "../models";
import { PaginationRequest } from "../utils";

class CommentController {
  showAll(req: express.Request, res: express.Response) {
    CommentModel.find({ isShowing: true })
      .sort({ createdAt: -1 })
      .exec((err, comments) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(200).json(comments);
      });
  }

  showPaginated(
    req: PaginationRequest<{ filter: string }>,
    res: express.Response
  ) {
    const pageOptions = {
      page: parseInt(req.query.page),
      limit: parseInt(req.query.pageSize),
      filter: new RegExp(req.query.filter, "i"),
    };

    CommentModel.find(
      pageOptions.filter
        ? {
            $or: [
              { name: { $regex: pageOptions.filter } },
              { comment: { $regex: pageOptions.filter } },
            ],
          }
        : {}
    )
      .countDocuments()
      .then((count) => {
        const totalCount = Math.ceil(count / pageOptions.limit);
        const skip = (pageOptions.page - 1) * pageOptions.limit;

        CommentModel.find(
          pageOptions.filter
            ? {
                $or: [
                  { name: { $regex: pageOptions.filter } },
                  { comment: { $regex: pageOptions.filter } },
                ],
              }
            : {}
        )
          .populate("serviceGroup")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageOptions.limit)
          .then((results) => {
            if (pageOptions.page > totalCount && results.length !== 0) {
              return res.status(404).json({
                message: `Page ${pageOptions.page} not found`,
              });
            }
            res.status(200).json({
              page: pageOptions.page,
              totalCount: totalCount,
              data: results,
            });
          });
      });
  }

  create(req: express.Request, res: express.Response) {
    const postData = {
      name: req.body.name,
      comment: req.body.comment,
      isShowing: false,
    };
    const comment = new CommentModel(postData);
    comment
      .save()
      .then((obj: any) => {
        res.status(200).json(obj);
      })
      .catch((reason) => {
        res.status(500).json({ message: reason.message });
      });
  }

  update(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const id: string = req.params.id;
    const postData = {
      name: req.body.name,
      comment: req.body.comment,
      isShowing: req.body.isShowing,
    };
    CommentModel.findByIdAndUpdate(
      id,
      { $set: postData },
      { new: true },
      (err, comment) => {
        if (err || !comment) {
          return res.status(404).json({ message: "Comment not found" });
        }
        res.status(200).json(comment);
      }
    );
  }

  delete(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const id: string = req.params.id;
    CommentModel.findOneAndRemove({ _id: id })
      .then((comment) => {
        if (comment) {
          res.status(200).json({
            message: `Comment by author '${comment.name}' deleted`,
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: `Comment not found` });
      });
  }

  getCount(req: express.Request, res: express.Response) {
    Promise.all([
      CommentModel.countDocuments(),
      CommentModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getTime() - 31 * 60 * 60 * 24 * 1000),
        },
      }),
      CommentModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000),
        },
      }),
      CommentModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getTime() - 1 * 60 * 60 * 24 * 1000),
        },
      }),
    ])
      .then((results) => {
        const [all, lastMonth, lastWeek, lastDay] = results;
        res.status(200).json({
          all,
          lastMonth,
          lastWeek,
          lastDay,
        });
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  }
}

export default CommentController;
