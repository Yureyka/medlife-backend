import mongoose, { Schema, Document } from "mongoose";

export interface ICallRequest extends Document {
  name: string;
  comment: string;
  date: Date;
}

const CallRequestSchema = new Schema(
  {
    name: {
      type: String,
      required: "Name is required",
    },
    phone: {
      type: String,
      required: "Phone is required",
    },
    isHandled: Boolean,
  },
  {
    timestamps: true,
  }
);

const CallRequestModel = mongoose.model<ICallRequest>(
  "CallRequest",
  CallRequestSchema
);

export default CallRequestModel;
