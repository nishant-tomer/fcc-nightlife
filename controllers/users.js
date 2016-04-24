var mongoose = require('mongoose')
var User = require('../models/user')

module.exports.controller = function(app, passport) {
    
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
    
    app.get('/', function(req, res) {
        res.render('index', {
            user: req.user
        });
    });
    
    app.get("/bars", isLoggedIn, function(req, res) {
        function err() {
            res.json({
                ok: "failed"
            })
        }
        getBars(req.user.uid).then(function(bars) {
            res.json(JSON.stringify(bars))
        }, err)
    })
    
    
    app.get("/bar/:id", isLoggedIn, function(req, res) {
        
         function err() {
            res.json({
                ok: "failed"
            })
        }
        
       deleteBar(req.user.uid,req.params.id)
            .then(function(bars) {
            res.json({ok:"ok"})
        }, err)
        
        
        
    })
    
    
    app.get('/auth/google/:id/:name', function(req, res) {
    
        passport.authenticate('google', {
            scope: ['profile'],
            state : req.params.id + "&&&" + req.params.name
        })(req,res);
    
    
    
    });
    
    app.get('/callback/google', passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/'
    }));
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
   
}

function deleteBar(uid,bar){
   
   console.log(uid + " "+ bar)
  var promise = User.findOneAndUpdate( {uid:uid}, { $pull: { bars: { $in: [bar] } } } ).exec()
  return promise
}



function getBars(uid) {
    var bars = User.findOne({uid:uid}, 'bars').exec()
    return bars
}


  
