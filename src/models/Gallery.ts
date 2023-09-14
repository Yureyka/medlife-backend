import mongoose, { Schema, Document } from "mongoose";

export interface IGallery extends Document {
  image: File;
  name: string;
}

const GallerySchema = new Schema(
  {
    image: {
      type: String,
      required: "Image is required",
    },
    name: {
      type: String,
      required: "Name is required",
    },
  },
  {
    timestamps: true,
  }
);

const GalleryModel = mongoose.model<IGallery>("Gallery", GallerySchema);

export default GalleryModel;
