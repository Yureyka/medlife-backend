import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  name: string;
  comment: string;
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
    isShowing: Boolean,
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model<IComment>("Comment", CommentSchema);

export default CommentModel;
