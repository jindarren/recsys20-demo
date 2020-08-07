"use strict";

/**
Schema to store user data in database
**/

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	id: String,
    platform: String,
    setting:String,
    logger:{},
	pool:[],
    que1:[],
    que2:[],
    que3:[],
    topRecommendedSong:{},
    user:{},
    completionCode:String,
    startTimestamp: Date,
    que1Timestamp: Date,
    taskStartTimestamp: Date,
    taskEndTimestamp: Date,
    endTimestamp: Date,
    codeTimestamp: Date,
    bonusTimestamp: Date,
});

var User = mongoose.model('User', userSchema);
module.exports = User;