import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  price: string;
  serviceGroup: Schema.Types.ObjectId
}

const ServiceSchema = new Schema(
  {
    name: {
      type: String,
      required: "Service name is required",
    },
    price: {
      type: String,
      required: "Price is required",
    },
    serviceGroup: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
  },

  {
    timestamps: true,
  }
);

const ServiceModel = mongoose.model<IService>("Service", ServiceSchema);

export default ServiceModel;
