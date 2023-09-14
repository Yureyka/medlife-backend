import express from "express";

import { NewsModel } from "../models";
import { removeNullField } from "../utils";

class NewsController {
  showAll(req: express.Request, res: express.Response) {
    NewsModel.find()
      .sort({ date: -1 })
      .exec((err, news) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(200).json(news);
      });
  }

  showByPage(req: express.Request, res: express.Response) {
    const pageOptions = {
      page: 1,
      limit: 9,
    };

    NewsModel.find()
      .sort({ date: -1 })
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .limit(pageOptions.limit)
      .exec((err, news) => {
        if (err) {
          return res.status(500).json(err);
        }
        NewsModel.countDocuments({}, (err, count) => {
          const maxPage = Math.ceil(count / pageOptions.limit);

          if (pageOptions.page > maxPage) {
            return res.status(404).json({
              message: `Page ${pageOptions.page} not found`,
            });
          }

          res.status(200).json({
            page: pageOptions.page,
            total_page: maxPage,
            results: news,
          });
        });
      });
  }

  showById(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    NewsModel.findById(id)
      .then((news) => {
        if (!news) {
          return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json(news);
      })
      .catch((err) => {
        return res.status(404).json({ message: "News not found" });
      });
  }

  showLast(req: express.Request, res: express.Response) {
    NewsModel.find({}, "_id image title short_description date")
      .sort({ date: -1 })
      .limit(3)
      .exec((err, news) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(200).json(news);
      });
  }

  create(req: any, res: express.Response) {
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

    const postData = {
      image: req.file.path,
      title: req.body.title,
      short_description: req.body.short_description,
      description: req.body.description,
      date: req.body.date,
    };
    const news = new NewsModel(postData);
    news
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
      image: (req.file && req.file.path) || null,
      title: req.body.title,
      short_description: req.body.short_description,
      description: req.body.description,
      date: req.body.date,
    };
    removeNullField(postData);
    NewsModel.findByIdAndUpdate(
      id,
      { $set: postData },
      { new: true },
      (err, news) => {
        if (err) {
          return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json(news);
      }
    );
  }

  delete(req: any, res: express.Response) {
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

    const id: string = req.params.id;
    NewsModel.findOneAndRemove({ _id: id })
      .then((news) => {
        if (news) {
          res.status(200).json({
            message: `News '${news.title}' deleted`,
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: `News not found` });
      });
  }
}

export default NewsController;
