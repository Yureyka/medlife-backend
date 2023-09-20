import express from "express";
import XLSX, { write, utils } from "xlsx-js-style";

import { ServiceModel, ServicesGroupModel } from "../models";
import { IService } from "../models/Service";
import { IServiceGroup } from "../models/ServicesGroup";
import { PaginationRequest } from "../utils";

class ServicesGroupController {
  showAll(req: express.Request, res: express.Response) {
    ServicesGroupModel.find()
      .populate("services")
      .exec((err, groups) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(200).json(groups);
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

    ServicesGroupModel.find(
      pageOptions.filter
        ? {
            $or: [{ name: { $regex: pageOptions.filter } }],
          }
        : {}
    )
      .countDocuments()
      .then((count) => {
        const totalCount = Math.ceil(count / pageOptions.limit);
        const skip = (pageOptions.page - 1) * pageOptions.limit;

        ServicesGroupModel.find(
          pageOptions.filter
            ? {
                $or: [{ name: { $regex: pageOptions.filter } }],
              }
            : {}
        )
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

  showOneGroupServices(req: express.Request, res: express.Response) {
    const key = req.params.key;

    ServicesGroupModel.findOne({ key: key })
      .populate("services")
      .exec((err, group) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(200).json(group);
      });
  }

  showGroups(req: express.Request, res: express.Response) {
    ServicesGroupModel.find().exec((err, groups) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(200).json(groups);
    });
  }

  getServicesTable(req: express.Request, res: express.Response) {
    ServicesGroupModel.find()
      .populate("services")
      .exec((err, services) => {
        if (err || !services) {
          console.log(err);
          return res.status(404).json({ message: "Services not found" });
        }

        let count = 1;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([]);
        XLSX.utils.sheet_add_aoa(ws, [["Отделение", "Услуга", "Цена"]]);
        services.forEach((data) => {
          count++;
          const departmentRow = [data.name, "", ""];
          XLSX.utils.sheet_add_aoa(ws, [departmentRow], { origin: -1 });

          data.services.forEach((service: any) => {
            count++;
            const serviceRow = ["", service.name, service.price];
            XLSX.utils.sheet_add_aoa(ws, [serviceRow], { origin: -1 });
          });
        });

        const wscols = [{ wch: 40 }, { wch: 70 }, { wch: 50 }];

        ws["!cols"] = wscols;
        ws["!rows"] = Array(count).fill({ hpx: 20 });

        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const binaryWorkbook = write(wb, {
          type: "buffer",
          bookType: "xlsx",
        });

        res.setHeader(
          "Content-Disposition",
          'attachment; filename="SheetJSNode.xlsx"'
        );

        res.setHeader("Content-Type", "application/vnd.ms-excel");

        return res.status(200).send(binaryWorkbook);
      });
  }

  create(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const postData = {
      name: req.body.name,
      key: req.body.key,
      services: req.body.services,
    };
    const serviceGroup = new ServicesGroupModel(postData);
    serviceGroup
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
    ServicesGroupModel.findOneAndRemove({ _id: id })
      .then((group) => {
        if (group) {
          res.status(200).json({
            message: `News '${group.name}' deleted`,
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: `News not found` });
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
      key: req.body.key,
      services: req.body.services,
    };

    ServicesGroupModel.findByIdAndUpdate(
      id,
      { $set: postData },
      { new: true },
      (err, group) => {
        if (err) {
          return res.status(404).json({ message: "News not found" });
        }
        res.status(200).json(group);
      }
    );
  }
}

export default ServicesGroupController;
