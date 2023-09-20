import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  name: string;
  comment: string;
  date: Date;
}

const AppointmentSchema = new Schema(
  {
    name: {
      type: String,
      required: "Name is required",
    },
    phone: {
      type: String,
      required: "Phone is required",
    },
    serviceGroup: {
      type: String,
      required: "Service is required",
    },
    online: String,
    message: String,
    isHandled: Boolean,
  },
  {
    timestamps: true,
  }
);

const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);

export default AppointmentModel;
