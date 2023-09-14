import express from "express";

import { CommentModel } from "../models";

class CommentController {
  showAll(req: express.Request, res: express.Response) {
    CommentModel.find()
      .sort({ date: -1 })
      .exec((err, comments) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(200).json(comments);
      });
  }

  showByPage(req: express.Request, res: express.Response) {
    const pageOptions = {
      page: 1,
      limit: 9,
    };

    CommentModel.find()
      .sort({ date: -1 })
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .limit(pageOptions.limit)
      .exec((err, comments) => {
        if (err) {
          return res.status(500).json(err);
        }
        CommentModel.countDocuments({}, (err, count) => {
          const maxPage = Math.ceil(count / pageOptions.limit);

          if (pageOptions.page > maxPage) {
            return res.status(404).json({
              message: `Page ${pageOptions.page} not found`,
            });
          }

          res.status(200).json({
            page: pageOptions.page,
            total_page: Math.ceil(count / pageOptions.limit),
            results: comments,
          });
        });
      });
  }

  showLast(req: express.Request, res: express.Response) {
    CommentModel.find({}, "_id name comment date")
      .sort({ date: -1 })
      .limit(3)
      .exec((err, comments) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json(comments);
      });
  }

  create(req: express.Request, res: express.Response) {
    const postData = {
      name: req.body.name,
      comment: req.body.comment,
      date: req.body.date,
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
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

    const id: string = req.params.id;
    const postData = {
      name: req.body.name,
      comment: req.body.comment,
      date: req.body.date,
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
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

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
