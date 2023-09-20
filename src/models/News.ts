import mongoose, { Schema, Document } from "mongoose";

export interface INews extends Document {
  image: string;
  title: string;
  description: string;
  isShowing: boolean;
}

const NewsSchema = new Schema(
  {
    image: {
      type: String,
      required: "Image is required",
    },
    title: {
      type: String,
      required: "Title is required",
    },
    description: {
      type: String,
      required: "Content is required",
    },
    isShowing: Boolean,
  },
  {
    timestamps: true,
  }
);

const NewsModel = mongoose.model<INews>("News", NewsSchema);

export default NewsModel;
