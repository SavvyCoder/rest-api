const express = require("express");
const mongoose = require("mongoose");
const app = express();


const users = require("./routes/api/users.js");
const posts = require("./routes/api/posts.js");
const profile = require("./routes/api/profile.js");


const db = require('./config/keys').mongoURI;

mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello"));

//Use routes 
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);


app.listen(process.env.PORT, process.env.IP, function(){
     console.log(`Dissuade Server running on port ${process.env.PORT}`);
});
