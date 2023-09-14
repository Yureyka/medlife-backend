import mongoose from "mongoose";

mongoose.connect("mongodb+srv://qwerty123:qwerty123@showfinder.cnjciui.mongodb.net/sample?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});