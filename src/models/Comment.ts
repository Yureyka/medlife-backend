import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  name: string;
  comment: string;
  date: Date;
}

const CommentSchema = new Schema(
  {
    name: {
      type: String,
      required: "Name is required",
    },
    comment: {
      type: String,
      required: "Comment is required",
    },
    date: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;
