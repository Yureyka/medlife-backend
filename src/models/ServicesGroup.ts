import mongoose, { Schema, Document } from "mongoose";

export interface IServiceGroup extends Document {
  name: string;
  key: string;
  services: Array<Object>;
}

const ServicesGroupSchema = new Schema(
  {
    name: {
      type: String,
      required: "Group name is required",
    },
    key: {
      type: String,
      required: "Key is required",
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
  },

  {
    timestamps: true,
  }
);

const ServicesGroupModel = mongoose.model<IServiceGroup>(
  "Group",
  ServicesGroupSchema
);

export default ServicesGroupModel;
