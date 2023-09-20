import express from "express";

import { DoctorModel } from "../models";
import { IDoctor } from "../models/Doctor";
import { removeNullField, PaginationRequest } from "../utils";

class DoctorController {
  showAll(req: express.Request, res: express.Response) {
    DoctorModel.find().exec((err, doctors) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(200).json(doctors);
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

    DoctorModel.find(
      pageOptions.filter
        ? {
            $or: [
              { fullName: { $regex: pageOptions.filter } },
              { position: { $regex: pageOptions.filter } },
              {
                $expr: {
                  $regexMatch: {
                    input: { $toString: "$experience" },
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

        DoctorModel.find(
          pageOptions.filter
            ? {
                $or: [
                  { fullName: { $regex: pageOptions.filter } },
                  { position: { $regex: pageOptions.filter } },
                  {
                    $expr: {
                      $regexMatch: {
                        input: { $toString: "$experience" },
                        regex: pageOptions.filter,
                      },
                    },
                  },
                ],
              }
            : {}
        )
          .sort({ fullName: 1 })
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

  showById(req: express.Request, res: express.Response) {
    const id: string = req.params.id;
    DoctorModel.findById(id).exec((err, doctor) => {
      if (err || !doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    });
  }

  create(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const postData = {
      fullName: req.body.fullName,
      position: req.body.position,
      experience: req.body.experience,
      experienceDetails: req.body.experienceDetails,
      image: (req.file && req.file.path) || null,
    };
    const doctor = new DoctorModel(postData);
    doctor
      .save()
      .then((obj: IDoctor) => {
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
      image: (req.file && req.file.path) || null,
      fullName: req.body.fullName,
      position: req.body.position,
      experience: req.body.experience,
      experienceDetails: req.body.experienceDetails,
    };

    removeNullField(postData);
    DoctorModel.findByIdAndUpdate(
      id,
      { $set: postData },
      { new: true },
      (err, doctor) => {
        if (err) {
          return res.status(404).json({ message: "Doctor not found" });
        }
        res.status(200).json(doctor);
      }
    );
  }

  delete(req: any, res: express.Response) {
    // const admin: string = req.user && req.user.admin;
    // if (!admin) {
    //   return res.status(403).json({ message: "No access" });
    // }

    const id: string = req.params.id;
    DoctorModel.findOneAndRemove({ _id: id })
      .then((doctor) => {
        if (doctor) {
          res.status(200).json({
            message: `Doctor '${doctor.fullName}' deleted`,
          });
        }
      })
      .catch(() => {
        res.status(404).json({ message: `Doctor not found` });
      });
  }
}

export default DoctorController;
