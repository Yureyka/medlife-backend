import express from "express";

import { CallRequestModel } from "../models";
import { PaginationRequest } from "../utils";

class CallRequestController {
  showAll(req: PaginationRequest<{ filter: string }>, res: express.Response) {
    const pageOptions = {
      page: parseInt(req.query.page),
      limit: parseInt(req.query.pageSize),
      filter: new RegExp(req.query.filter, "i"),
    };

    CallRequestModel.find(
      pageOptions.filter
        ? {
            $or: [
              { name: { $regex: pageOptions.filter } },
              { phone: { $regex: pageOptions.filter } },
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$createdAt" },
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

        CallRequestModel.find(
          pageOptions.filter
            ? {
                $or: [
                  { fullName: { $regex: pageOptions.filter } },
                  { position: { $regex: pageOptions.filter } },
                  {
                    $expr: {
                      $regexMatch: {
                        input: { $toString: "$createdAt" },
                        regex: pageOptions.filter,
                      },
                    },
                  },
                ],
              }
            : {}
        )
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageOptions.limit)
          .then((results) => {
            if (pageOptions.page > totalCount) {
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
      phone: req.body.phone,
      isHandled: false,
    };
    const callRequest = new CallRequestModel(postData);
    callRequest
      .save()
      .then((obj: any) => {
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
    CallRequestModel.findOneAndRemove({ _id: id })
      .then((callRequest) => {
        if (callRequest) {
          res.status(200).json({
            message: `Request '${callRequest.name}' deleted`,
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: `Request not found` });
      });
  }

  update(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const id: string = req.params.id;
    const postData: any = {
      name: req.body.name,
      phone: req.body.phone,
      isHandled: req.body.isHandled,
    };

    CallRequestModel.findByIdAndUpdate(
      id,
      { $set: postData },
      { new: true },
      (err, request) => {
        if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(request);
      }
    );
  }
}

export default CallRequestController;
