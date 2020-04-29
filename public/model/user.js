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
	logger:{},
});

var User = mongoose.model('User', userSchema);
module.exports = User;