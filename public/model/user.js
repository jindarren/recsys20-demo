"use strict";

/**
Schema to store user data in database
**/

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	id: String,
    logger:{},
    new_pool:[],
	pool:[],
    que1:[],
    que2:[],
    que3:[],
    timestamp: Date,
    topRecommendedSong:{},
    user:{},

});

var User = mongoose.model('User', userSchema);
module.exports = User;