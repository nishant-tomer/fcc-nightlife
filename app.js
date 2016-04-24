var express = require("express"),
    fs = require("fs"),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    helmet = require('helmet'),
    assets = require("path").join(process.cwd(), "/assets"),
    views = require("path").join(process.cwd(), "/views");


var app = express()
require('dotenv').load()



var mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);


app.set("views", views);
app.set("view engine", "jade");
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(helmet())
app.use(session({
    secret: 'fcc-nightlife-app-secret',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(assets))
app.use("/js", express.static(__dirname + "/node_modules/validator"))
app.use(express.logger('dev'));
app.use(passport.initialize());
app.use(passport.session());


fs.readdirSync('./controllers').forEach(function(file) {
    if (file.substr(-3) == '.js') {
        var route = require('./controllers/' + file);
        route.controller(app, passport);
    }
});

app.use(function(req, res) {
    res.redirect("/")
});


app.listen(process.env.PORT || 8080)
