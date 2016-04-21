var mongoose = require('mongoose')
var User = require('../models/user')
var Poll = require('../models/poll')
var Option = require('../models/option')

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
    
    app.get("/polls", function(req, res) {
        function err() {
            res.json({
                ok: "failed"
            })
        }
        getPolls().then(function(polls) {
            res.json(JSON.stringify(polls))
        }, err)
    })
    
    app.get("/poll/:id", function(req, res) {
        function err() {
            res.json({
                ok: "failed"
            })
        }
        getPollData(req.params.id).then(function(poll) {
            res.json(JSON.stringify(poll))
        }, err)
    })
    
    app.post("/poll/:id", isLoggedIn, function(req, res) {
        function err() {
            res.json({
                ok: "failed"
            })
        }

        function success() {
            res.json({
                ok: "ok"
            })
        }
        findPoll(req.params.id).then(function(poll) {
            return saveOption(req, poll);
        }, err).then(success, err)
    })
    
    app.get("/option/:optId", function(req, res) {
        function err() {
            res.json({
                ok: "failed"
            })
        }

        function success() {
            res.json({
                ok: "ok"
            })
        }
        findOption(req.params.optId).then(castVote, err).then(
            success, err)
    })
    
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('users/profile', {
            user: req.user
        });
    });
    
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['email', 'profile']
    }));
    
    app.get('/callback/google', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    app.post('/profile/poll', isLoggedIn, function(req, res) {
       savePoll(req, res, savePollCallback);
    });
    
    app.get('/polls/user', isLoggedIn, function(req, res) {
        
        findUserPolls(req.user.uid)
            .then( function(data){ res.json( JSON.stringify(data.polls) ) }, function(err){ throw err} )
        
    });
    
    app.delete('/poll/:id', isLoggedIn, function(req, res) {
        
        findPoll(req.params.id)
            .then( function(data){ return deletePoll(data) }, function (err) { throw err}  )
            .then (  function(data) { res.json({ok:"ok"}) }, function (err) { throw err})
        
        
    });

   
}

function validator(string){
    var pattern = /^[^a-zA-Z_?:&,\.'" 0-9-]+( [^a-zA-Z_?:&,\.'" 0-9-]+ )*$/
    var test = string.match(pattern)
    if (test == null ){ return true }
    return false
}

function deletePoll(poll){
  return  poll.remove()
}

function getPollData(id) {
    var poll = Poll.find({
        _id: id
    }).populate({
        path: "options",
        populate: {
            path: "voters",
            select: 'displayName'
        }
    }).exec()
    return poll
}

function findPoll(id) {
    var poll = Poll.findOne({
        _id: id
    }).exec()
    return poll
}

function findOption(optId) {
    var option = Option.findOne({
        _id: optId
    }).exec()
    return option
}

function saveOption(req, poll) {
    req.body.options.forEach(function(val, index, array) {
        if ( !validator(val)){ throw new Error('Whoops!'); }
        var option = new Option({
            _id: mongoose.Types.ObjectId(),
            name: val,
            creator: req.user.uid,
            count: 0,
            belongsTo: poll.name
        })
        poll.options.push(option)
        option.save(function(err) {
            if (err) throw err
        });
    })
    return poll.save();
}

function castVote(option) {
    option.count += 1
    return option.save()
}

function getPolls() {
    var polls = Poll.find({}).populate('options', 'count').exec()
    return polls
}

function findUserPolls(uid){
    
    var polls = User.findOne({uid:uid})
                    .populate({
                        path: "polls",
                        populate: {
                            path: "options",
                            select: 'count'
                        }
                    }).exec()
    
    return polls
    
}

function savePollCallback(res, flag) {
    res.json ({ok: flag})
}

function savePoll(req, res, func) {
    var uid = req.user.uid
    var result = "ok";
    User.findOne({
        uid: uid
    }).exec(function(err, person) {
        if (err) {
            result = "failed";
            func(res,result)
        }
         if ( !validator(req.body.name)){ throw new Error('Whoops!'); }
        if ( !validator(req.body.desc)){ throw new Error('Whoops!'); }

        var poll = new Poll({
            _id: mongoose.Types.ObjectId(),
            creator: uid,
            name: req.body.name,
            desc: req.body.desc
        });
        req.body.options.forEach(function(val, index, array) {
            
            if ( !validator(val)){ throw new Error('Whoops!'); }

            var option = new Option({
                _id: mongoose.Types.ObjectId(),
                name: val,
                creator: uid,
                count: 0,
                belongsTo: req.body.name
            })
            poll.options.push(option)
            option.save(function(err) {
                if (err) {
                    result = "failed";
                    func(res, result)
                }
            });
        })
        poll.save(function(err) {
            if (err) {
                result = "failed";
                func(res, result)
            }
            person.polls.push(poll)
            person.save(function(err) {
                if (err) {
                    result = "failed";
                    func(res, result)
                }
                
                func(res, result)
            });
        })
    })
}