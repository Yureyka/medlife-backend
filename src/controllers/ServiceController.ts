import express from "express";

import { ServiceModel, ServicesGroupModel } from "../models";
import { PaginationRequest } from "../utils";
import { IService } from "../models/Service";

class ServiceController {
  showAll(req: PaginationRequest<{ filter: string }>, res: express.Response) {
    const pageOptions = {
      page: parseInt(req.query.page),
      limit: parseInt(req.query.pageSize),
      filter: new RegExp(req.query.filter, "i"),
    };

    ServiceModel.find(
      pageOptions.filter
        ? {
            $or: [
              { name: { $regex: pageOptions.filter } },
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$price" },
                    regex: pageOptions.filter,
                  },
                },
              },
            ],
          }
        : {}
    )
      .countDocuments()
      .then((count) => {
        const totalCount = Math.ceil(count / pageOptions.limit);
        const skip = (pageOptions.page - 1) * pageOptions.limit;

        ServiceModel.find(
          pageOptions.filter
            ? {
                $or: [
                  { name: { $regex: pageOptions.filter } },
                  {
                    $expr: {
                      $regexMatch: {
                        input: { $toString: "$price" },
                        regex: pageOptions.filter,
                      },
                    },
                  },
                ],
              }
            : {}
        )
          .populate("serviceGroup")
          .sort({ name: 1 })
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

  create(req: any, res: express.Response) {
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

    const postData = {
      name: req.body.name,
      price: req.body.price,
      serviceGroup: req.body.serviceGroupId,
    };
    const service = new ServiceModel(postData);
    service
      .save()
      .then((service: IService) => {
        ServicesGroupModel.findByIdAndUpdate(
          postData.serviceGroup,
          { $push: { services: service._id } },
          { upsert: true },
          (err) => {
            if (err) {
              return res.status(500).json({ message: err });
            }
          }
        );

        res.status(200).json(service);
      })
      .catch((reason) => {
        res.status(500).json({ message: reason.message });
      });
  }

  delete(req: any, res: express.Response) {
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

    const id: string = req.params.id;

    ServiceModel.findOneAndRemove({ _id: id })
      .then((service) => {
        if (service) {
          ServicesGroupModel.findOneAndUpdate(
            { services: id },
            { $pull: { services: id } },
            { upsert: true },
            (err) => {
              if (err) {
                return res.status(500).json({ message: err });
              }
            }
          );

          return res.status(200).json({
            message: "Service deleted",
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: "Service not found" });
      });
  }

  update(req: any, res: express.Response) {
    const admin: string = req.user && req.user.admin;
    if (!admin) {
      return res.status(403).json({ message: "No access" });
    }

    const id: string = req.params.id;
    const postData: any = {
      name: req.body.name,
      price: req.body.price,
      serviceGroup: req.body.serviceGroupId,
    };

    ServiceModel.findByIdAndUpdate(
      id,
      { $set: postData },
      { new: true },
      (err, service) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(service);
      }
    );
  }
}

export default ServiceController;
