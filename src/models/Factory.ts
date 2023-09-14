import mongoose, { Schema, Document } from "mongoose";

export interface IFactory extends Document {
    about: {
        text: string;
    };
    service: {
        payment: Array<{ title: string; content: string }>;
        delivery: Array<{ title: string; content: string }>;
    };
    contacts: {
        number: string;
        email: string;
        time: Array<string>;
        address_office: string;
        address_prod: string;
    };
}

const FactorySchema = new Schema({
    about: {
        text: String
    },
    service: {
        payment: [
            {
                title: String,
                content: String
            }
        ],
        delivery: [
            {
                title: String,
                content: String
            }
        ]
    },
    contacts: {
        number: String,
        email: String,
        time: [String],
        address_office: String,
        address_prod: String
    }
});

const FactoryModel = mongoose.model<IFactory>("Factory", FactorySchema);

export default FactoryModel;
