const fs = require('fs');
const csv = require('csv-parser');
const sysCritique = require('./systemProposedCritiques.js');
const _ = require('lodash');

// User Class
class User
{
	constructor(id, preferenceData, preferenceData_variance, attributeWeight){
		this.id = id;
		this.preferenceData = preferenceData;
		this.preferenceData_variance = preferenceData_variance;
		this.attributeWeight = attributeWeight;
	}
};



// Item attributes 
let numericalAttributes = ['popularity', 'danceability', 'energy', 'speechiness', 'tempo', 'liveness', 'valence'];
let nominalAttributes = ['artist','genre','language'];
let attributes = numericalAttributes.concat(nominalAttributes);



// User Data
// Get user id and corresponding data, including preference data and attribute weight for each attribute of item
// if user is new user, we set default preference / weight for he/her.

let userId = '5';
let defaultWeight = 1/(numericalAttributes.length+nominalAttributes.length);
let default_varience = 0.01;

// may be revised if needed
let preferenceData = {'artist':['Kevin Hart','Halsey'],'genre':['comedy','brostep'], 'popularity': 50, 'danceability': 0.5, 'energy':0.5,
 'speechiness':0.5, 'tempo':0.5, 'liveness':0.5, 'valence':0.5};
let preferenceData_variance = { 'popularity': 3, 'danceability': default_varience, 'energy':default_varience, 'speechiness':default_varience, 
'acousticness':default_varience, 'instrumentalness':default_varience, 'liveness':default_varience, 'valence':default_varience};


let attributeWeight = {'artist':defaultWeight,'genre':defaultWeight, 'language':defaultWeight, 'popularity':defaultWeight, 
'danceability': defaultWeight, 'energy':defaultWeight, 'speechiness':defaultWeight, 'tempo':defaultWeight, 'liveness':defaultWeight, 'valence':defaultWeight};

let user = new User(userId, preferenceData,preferenceData_variance, attributeWeight);

//Item Data
let inputFilePath = "spotify_tracks_new.csv";
let itemData = [];


// 

// -----------------------------------------------------------------------------------------

fs.createReadStream(inputFilePath)
	.pipe(csv())
	.on('data', function(data) {
		// load item data
		itemData.push(data);
	})
	.on('end', () => {
		
		console.log("------------------------------------------------");
		console.log("Total Item Data: "+itemData.length + " records");
		console.log("Read Music Data Finished!");
		console.log("------------------------------------------------");
		
		// Step 1: Find a top recommended item using Spotify API
		

        // Suppose top recommended item 
	    let topRecItem = itemData[2];
        
		// Step 2: Produce critiques using Apriori algorithm and select the most favorite critique with higher tradeoff utility
		
		start = new Date().getTime();
		// control parameter
		let numfCompoundCritiques = [2,3];
		let supportValue = 0.2;
		let numOfUtilityCritiques = 3; 
		let numOfDiversifiedCritiques = 3;    // the number of items that satisfy favorite critique and that will be presented
		
		// get favor critique and diversified critique 
		let systemCritiquing = sysCritique(user, itemData, topRecItem, nominalAttributes, numericalAttributes, numfCompoundCritiques,
			 supportValue, numOfUtilityCritiques, numOfDiversifiedCritiques);

		end = new Date().getTime();
		console.log("------------------------------------------------");
		console.log('-----Execution time: ' + (end-start) + 'ms.');
		console.log("------------------------------------------------"); 

        console.log("favor critique: ");
        console.log(systemCritiquing.favorCritique);
        console.log("diversify critique: ");
        console.log(systemCritiquing.diversifyCritique);

		// When system get the response from user, we need to revise users' preference and adjust attribute weight respectively.
	});  

