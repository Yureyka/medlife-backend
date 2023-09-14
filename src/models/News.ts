import mongoose, { Schema, Document } from "mongoose";

export interface INews extends Document {
    image: string;
    title: string;
    short_description: string;
    description: string;
    date: Date;
}

const NewsSchema = new Schema(
    {
        image: {
            type: String,
            required: "Image is required"
        },
        title: {
            type: String,
            required: "Title is required"
        },
        short_description: String,
        description: {
            type: String,
            required: "Content is required"
        },
        date: {
            type: Date,
            default: new Date()
        }
    },
    {
        timestamps: true
    }
);

const NewsModel = mongoose.model<INews>("News", NewsSchema);

export default NewsModel;
