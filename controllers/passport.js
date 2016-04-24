var GoogleStrategy = require('passport-google-oauth2').Strategy
var User = require('../models/user')

var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL = process.env.APP_URI + "/callback/google";

module.exports.controller = function(app, passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({

            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            passReqToCallback: true

        },

        function(request, accessToken, refreshToken, profile, done) {

            process.nextTick(function() {

                User.findOne({
                    'uid': profile.id
                }, function(err, user) {
                    if (err) {
                        return done(err);
                    }

                    if (user) {
                        if(  request.query.state.split("&&&")[1] != "new" ){
                            user.lastSearch = request.query.state.split("&&&")[1]
                            user.bars.addToSet(request.query.state.split("&&&")[0])
                            user.save(function(err) {
                                if (err) {
                                    throw err;
                                }
    
                                return done(null, user);
                            }); 
                        }
                        
                        else{
                            return done(null, user);
                            
                        } 
                    } else {
                        var newUser = new User();

                        newUser.uid = profile.id;
                        newUser.firstName = profile.name.givenName;
                        newUser.lastName = profile.name.familyName;
                        newUser.displayName = profile.displayName;
                        newUser.image = profile._json.image.url;
                        newUser.lastSearch = request.query.state.split("&&&")[1]
                        newUser.bars.addToSet(request.query.state.split("&&&")[0])

                        newUser.save(function(err) {
                            if (err) {
                                throw err;
                            }

                            return done(null, newUser);
                        });
                    }
                });
            });
        }
    ));
}
