var mongoose = require('mongoose')
    ,Schema = mongoose.Schema
    ,userSchema = Object.create(
                        Schema({
                        		uid: String,
                        		displayName: String,
                        		firstName: String,
                                lastName: String,
                                image: String,
                                lastSearch: String,
                                bars:  [],
                            })
                    );

var User = mongoose.model('User', userSchema)

module.exports = User
