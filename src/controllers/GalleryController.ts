import express from "express";

import { GalleryModel } from "../models";
import { IGallery } from "../models/Gallery";
import { PaginationRequest, removeNullField } from "../utils";

class GalleryController {
  showAll(req: express.Request, res: express.Response) {
    GalleryModel.find().exec((err, gallery) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(200).json(gallery);
    });
  }

  showPaginated(req: PaginationRequest, res: express.Response) {
    const pageOptions = {
      page: parseInt(req.query.page),
      limit: parseInt(req.query.pageSize),
    };

    GalleryModel.find()
      .sort({ date: -1 })
      .skip((pageOptions.page - 1) * pageOptions.limit)
      .limit(pageOptions.limit)
      .exec((err, gallery) => {
        if (err) {
          return res.status(500).json(err);
        }
        GalleryModel.countDocuments({}, (err, count) => {
          const maxPage = Math.ceil(count / pageOptions.limit);

          if (pageOptions.page > maxPage) {
            return res.status(404).json({
              message: `Page ${pageOptions.page} not found`,
            });
          }

          res.status(200).json({
            page: pageOptions.page,
            totalCount: Math.ceil(count / pageOptions.limit),
            data: gallery,
          });
        });
      });
  }

  showById(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    GalleryModel.findById(id).exec((err, galleryItem) => {
      if (err || !galleryItem) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.status(200).json(galleryItem);
    });
  }

  create(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const postData = {
      name: req.body.name,
      image: (req.file && req.file.path) || null,
    };
    const galleryItem = new GalleryModel(postData);
    galleryItem
      .save()
      .then((obj: IGallery) => {
        res.status(200).json(obj);
      })
      .catch((reason) => {
        res.status(500).json({ message: reason.message });
      });
  }

  delete(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const id: string = req.params.id;
    GalleryModel.findOneAndRemove({ _id: id })
      .then((galleryItem) => {
        if (galleryItem) {
          res.status(200).json({
            message: `Gallery item '${galleryItem.name}' deleted`,
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: `Gallery item not found` });
      });
  }
}

export default GalleryController;
