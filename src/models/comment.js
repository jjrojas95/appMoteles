var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    calification: { type: Number, default: 0},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    like: [
       {
          type: String
       }
    ],
    dislike: [
       {
          type: String
       }
    ]
});

module.exports = mongoose.model("Comment", commentSchema);
