"use strict";

/**
Schema to store user data in database
**/

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	id: String,
	pool:[],
	new_pool:[],
	user:{},
    topRecommendedSong:{},
	timestamp: Date,
    logger:{},
	que1:[],
	que2:[]
});

var User = mongoose.model('User', userSchema);
module.exports = User;