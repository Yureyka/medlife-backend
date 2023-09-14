import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  image: string;
  fullName: string;
  position: string;
  experience: number;
  experienceDetails: Array<Object>;
}

const DoctorSchema = new Schema(
  {
    fullName: {
      type: String,
      required: "Fullname is required",
    },
    position: {
      type: String,
      required: "Position is required",
    },
    experience: {
      type: Number,
      required: "Experience is required",
    },
    experienceDetails: [
      {
        year: {
          type: Number,
          required: "Year title is required",
        },
        description: {
          type: String,
          required: "Description content is required",
        },
      },
    ],
    image: {
      type: String,
      required: "Image is required",
    },
  },
  {
    timestamps: true,
  }
);

const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default DoctorModel;
