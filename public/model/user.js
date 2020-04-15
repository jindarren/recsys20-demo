"use strict";

/**
Schema to store user data in database
**/

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	id: String,
	preferenceData:{	
		artist: [],
		genre: [],
		track: [],
		language: String,
		popularityRange: [],
		danceabilityRange: [],
		energyRange: [],
		speechinessRange: [],
		valenceRange: [],
		tempoRange: [],
		popularity: Number,
		danceability: Number,
		energy: Number,
		speechiness: Number,
		valence: Number,
		tempo: Number,
		timestamp: Date
	},
	attributeWeight:{
		artistWeight: Number,
		genreWeight: Number,
		languageWeight: Number,
		popularityWeight: Number,
		danceabilityWeight: Number,
		energyWeight: Number,
		speechinessWeight: Number,
		valenceWeight: Number,
		tempoWeight: Number,
		timestamp: Date,
	},
	logger:{}
});

var User = mongoose.model('User', userSchema);
module.exports = User;