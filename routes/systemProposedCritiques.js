/** Generate corresponding critiques by systems using Apriori algorithms and some utility functions
 * @param {object} user a specific user object containing userId, user preference data and weight data for each attribute
 * @param {object} itemData item datasets used to generate corresponding critique
 * @param {object} curRecItem the information of the last recommended item {itemID:'fff','attribut':'fd'....}
 * @param {object} nominalAttributes a list of names of nominalAttributes
 * @param {object} numericalAttributes a list of names of numericalAttributes
 * @param {int} numOfDiversifiedCritiques the number of critiques required 
 * @example systemProposedCritiques(...)
 * @returns {object} 
**/
const fi = require('./frequent-itemset-new');
//const fi = require('./relim_frequent_itemsets');
const _ = require('lodash');


// ------------------------------------------------------------------
// Value function
// ------------------------------------------------------------------
function nearIsBetter_ValueFunction(user, item, itemData, attribute)
{
	let maxAttrV = user.preferenceData_max[attribute]  ;
	let minAttrV = user.preferenceData_min[attribute] ;
	let range = user.preferenceData_max[attribute] - user.preferenceData_min[attribute]
	let itemAttrV = itemData[item][attribute];
	if (itemAttrV <= maxAttrV && itemAttrV >= minAttrV)
	{
		return 1;
	}
	else if (itemAttrV > maxAttrV)
	{
		return range/(itemAttrV-minAttrV); 	
	}
	else
	{
		return range/(maxAttrV-itemAttrV); 	
	}
}

function nominalAttribute_ValueFunction(user, item , itemData, attribute)
{
	if (user.preferenceData[attribute].includes(itemData[item][attribute]))
	{
		return 1;
	}
	else{
		
		return 0;
	}
}

// ------------------------------------------------------------------
// Multi-attribute Utility Theory (MAUT) : Get Utility for each items
// ------------------------------------------------------------------
function MAUT(user, itemData, numericalAttributes, nominalAttributes)
{

	//console.log("-----------         MAUT          --------------");

	var utility = [];
	let preferenceValue = [];
	let value = 0;

	for (let i = 0; i < itemData.length; i++){
		
		preferenceValue = {};
		let itemID = itemData[i]['id'];
		// Step 1: Obtain the value for each attributes
		// [1] Nominal Attributes
		
		for (let attribute of nominalAttributes)
		{	
			value = nominalAttribute_ValueFunction(user,i, itemData, attribute);		
			preferenceValue[attribute] = value ;
		}
		// [2] Numerical Attributes
		for (let attribute of numericalAttributes)
		{
			value = nearIsBetter_ValueFunction(user,i, itemData, attribute);	
			preferenceValue[attribute] = value;
		}
		//console.log(preferenceValue);
		
		// Step 2: calculate the utility
		let itemUtility = 0;
		for (let attribute of nominalAttributes)
		{
			
			itemUtility += preferenceValue[attribute] * user.attributeWeight[attribute];
		}
		for (let attribute of numericalAttributes)
		{
			itemUtility += preferenceValue[attribute] * user.attributeWeight[attribute];
		}
		//console.log(itemUtility)
		utility[i]= {'itemID':itemID, 'utility':itemUtility};
		
	}
	
	return utility;
	
}


// ------------------------------------------------------------------
// Generate Critique Array
// ------------------------------------------------------------------ 

function getItemCritique(user, itemData, curRecItem, nominalAttributes, numericalAttributes){

    // Data Structure :construct item attribute pairs set (improved or compromised)
	let itemCritiqueArray = [];  //  itemCritiqueArray[item_pos] = ['critique_1','critique_2',...]
	let itemCritiqueDict = [];   //  itemCritiqueDict = {key:item, value: critique_array}

	// obtain critiques for each item by comparing with the top recommended items
	for (let i=0; i < itemData.length; i++){
		let item = itemData[i];
		let itemAttrV = '';
		let critiqueArray = [];  

		//  obtain critiques for nominal attributes
		for (let attribute of nominalAttributes)
		{
			itemAttrV = item[attribute];

			//if (_.isEqual(curRecItem[attribute],itemAttrV))
			//{
			//	continue;
			//}
			critiqueArray.push([attribute,itemAttrV].join('|'));
		}

		//  obtain critiques for numerical attributes
		for (let attribute of numericalAttributes)
		{
			itemAttrV = item[attribute];
			let maxAttrV = curRecItem[attribute] + user.preferenceData_variance[attribute] ;
			let minAttrV = curRecItem[attribute] - user.preferenceData_variance[attribute] ;
			
			if(itemAttrV < minAttrV)
			{
				critiqueArray.push([attribute,'lower'].join('|'));
			}
			if(itemAttrV > maxAttrV)
			{
				critiqueArray.push([attribute,'higher'].join('|'));
			}
			if (itemAttrV <= maxAttrV && itemAttrV >= minAttrV)
			{
				critiqueArray.push([attribute,'similar'].join('|'));
			}
		}

		itemCritiqueArray.push(critiqueArray);
		itemCritiqueDict[i]={'itemID':item['id'], 'critiques':critiqueArray};
		
	}
    return {'itemCritiqueArray':itemCritiqueArray,'itemCritiqueDict':itemCritiqueDict};
}


// ------------------------------------------------------------------
// Tradeoff Utility (without tradeoff but with support value)
// ------------------------------------------------------------------
function computeTradeoffUtility (user, frequentCritiqueSet, itemCritiqueDict, utilityDict){
    
    let critiqueUtilityDict = [];
	let allCritique2ItemDict = [];
	//let critique2SupportValDict = [];
    for (let critique of frequentCritiqueSet)
	{
		// Obtain the set of products satisfy critique
		let critique2ItemSet = [];  // store the set of items that satisfy the specific critique
		let itemCritiques = [];
		for (let i = 0; i < itemCritiqueDict.length; i++)
		{	
			itemCritiques = itemCritiqueDict[i]['critiques'];
			let flag = 1;
			for (let c of critique)
			{
				if (!itemCritiques.includes(c))
				{
					flag = 0;	
				}
			}
			if (flag == 1)
			{
				critique2ItemSet.push({'id': itemCritiqueDict[i]['itemID'], 'utility': utilityDict[i]['utility']});
			}
		}

		//calculate the support value of current critique
		//let supportVal = critique2ItemSet.length/itemCritiqueDict.length; 

        
        //console.log("compute tradeoff utility for critiques");
	    let tradeoffUtility = 0;
		
		let firstTerm = 0;
		// consider the user attribute weight 
    	for (let c of critique)
	    {
			let critique = c.split("|");	
			let attribute = critique[0];	
			let weight = user.attributeWeight[attribute];	
			firstTerm += weight;
		}
		
		// consider the utility of top K items in the current critique
		let secondTerm = 0;
		let topK = 5;
		let sorted_itemSet = _.orderBy(critique2ItemSet, ['utility'], ['desc']);
		//console.log(sorted_itemSet);
	    for (let i = 0; i < topK; i++)
	    {
	    	secondTerm += sorted_itemSet[i]['utility'];
		}
		
		secondTerm = secondTerm/topK;
		
		// calculate the utility of compound critique
		//tradeoffUtility = firstTerm * secondTerm * supportVal;
		tradeoffUtility = firstTerm * secondTerm ;
		
		critiqueUtilityDict.push({'critique':critique, 'tradeoffUtility':tradeoffUtility});
		allCritique2ItemDict.push({'critique':critique, 'itemSet':critique2ItemSet}); // used to get recommender item when proposing critiques
    
    }
	
	return {'critiqueUtilityDict':critiqueUtilityDict, 'allCritique2ItemDict': allCritique2ItemDict};
}



// ------------------------------------------------------------------
// Diversity Utility
// ------------------------------------------------------------------
function computeDiversityUtility(critiqueSet, sortedcritiqueUtilityDict, allCritique2ItemDict,numOfDiversifiedCritiques)
{
    
	let selectedCritiqueDict = []; // store so far selected critiques
	let currentCritiqueDict = []; // store others critiques that has not beed selected 
	
	// First one : put in the compound critique with the highest utility
	selectedCritiqueDict.push({'critique':sortedcritiqueUtilityDict[0]['critique'], 'diversityUtility':sortedcritiqueUtilityDict[0]['tradeoffUtility']});
	
	for (let i=1; i<sortedcritiqueUtilityDict.length; i++)
	{
		currentCritiqueDict.push(sortedcritiqueUtilityDict[i]);
	}
	//console.log(currentCritiqueDict.length);
	
	while (selectedCritiqueDict.length < numOfDiversifiedCritiques)
	{	
		let diversityDegreeDict = []; // 
		let diversityUtilityDict = [] ;
		let sortedDiversityUtilityDict = [];
		
		for (let i=0; i < currentCritiqueDict.length; i++)
		{

			let currentCritique = currentCritiqueDict[i]['critique'];
			let currentCritiqueUtility =  currentCritiqueDict[i]['tradeoffUtility'];

        	let diversity = 0;
       	 	let diversityArray = [];
			for (let j=0; j<selectedCritiqueDict.length; j++)
	    	{   
				let compareCritique = selectedCritiqueDict[j]['critique'];
				//let compareCritiqueUtility = selectedCritiqueDict[j]['tradeoffUtility'];
            	if (_.isEqual(currentCritique, compareCritique))
            	{
                	continue;
            	}
				else
				{
               		intersection_critique = _.intersection(currentCritique, compareCritique);
					let diversity = 1 - intersection_critique.length/currentCritique.length ;
					diversityArray.push(diversity);
				
            	}
        	}
			diversity = _.min(diversityArray);
			//console.log(diversity)
			let diversityUtility = diversity * currentCritiqueUtility;
			//console.log(diversityUtility)
        	diversityDegreeDict.push({'critique':currentCritique, 'diversity':diversity});
        	diversityUtilityDict.push({'critique':currentCritique, 'diversityUtility':diversityUtility});
		}
		
		sortedDiversityUtilityDict = _.orderBy(diversityUtilityDict, ['diversityUtility'], ['desc']); 
		selectedCritiqueDict.push(sortedDiversityUtilityDict[0]);
		selectedCritique = sortedDiversityUtilityDict[0]['critique'];

		//console.log(sortedDiversityUtilityDict[0]);
		selectedCritique_index = _.findIndex(currentCritiqueDict, function(o) { return o.critique == selectedCritique ; });
		
		currentCritiqueDict.splice(selectedCritique_index, 1);
	}
    return selectedCritiqueDict;

}


//============================================================ 
// Main Program
//============================================================

module.exports = (user, itemData, curRecItem, nominalAttributes, numericalAttributes, numfCompoundCritiques, supportValue, numOfDiversifiedCritiques) => {

    
	//========================================================================================================================  
	console.log("-------   Step 1: Generate a critique array for each item ---------");
	//========================================================================================================================
    itemCritique = getItemCritique(user,itemData, curRecItem, nominalAttributes, numericalAttributes);
    itemCritiqueArray = itemCritique['itemCritiqueArray'];
	itemCritiqueDict = itemCritique['itemCritiqueDict'];

	console.log("-------   Step 1: Finished ---------");
	console.log();
	//========================================================================================================================
	//========================================================================================================================


	//========================================================================================================================
	console.log("-------   Step 2: Find frequent critiques set ---------");
	//========================================================================================================================

	// Use Apriori Algorithms to obtain frequent-critique-itemsets
	// find frequent set -- the package should be checked  !!!!
	let AllfrequentCritiqueSet = fi(itemCritiqueArray,  supportValue, numfCompoundCritiques,  true);
	console.log("All frequent Critique: " + AllfrequentCritiqueSet.length);
	
	
	// filter frequent critique
	let frequentCritiqueSet = [];
	for (let critiqueArray of AllfrequentCritiqueSet)
	{
		let all_similar = 1;
		for (let c of critiqueArray)
		{
			let critique = c.split("|");	
			//let attribute = critique[0];	
			let value = critique[1];
			if (_.isEqual(value,"similar"))
			{
				continue;
			}
			else
			{
				all_similar = 0;
				frequentCritiqueSet.push(critiqueArray);
				break;
			}
		}
		
	}

	console.log("After filtering, frequent Critique: " + frequentCritiqueSet.length);

	console.log("-------   Step 2: Finished ---------");
	console.log();
	//========================================================================================================================
	//========================================================================================================================


	//========================================================================================================================
	console.log("-------  Step 3:  Compute critique utility for frequent critiques  -------");
	//========================================================================================================================

    // select the favor critique by computing the tradeoff utility
    // step A: compute item utility 
    let utilityDict = MAUT(user, itemData, numericalAttributes, nominalAttributes);
	// step B: compute critique utility 
    let critiqueUtility = computeTradeoffUtility(user, frequentCritiqueSet, itemCritiqueDict, utilityDict);
	
	let critiqueUtilityDict = critiqueUtility['critiqueUtilityDict'];
	let allCritique2ItemDict = critiqueUtility['allCritique2ItemDict'];
	// sort
	let sortCritiqueUtility = _.orderBy(critiqueUtilityDict, ['tradeoffUtility'], ['desc']);

	/* 
	// store critiques 
	let favorCritique = []; 
	for (let i=0; i< numOfUtilityCritiques; i++)
	{
		favorCritique.push(sortCritiqueUtility[i]['critique']);
		
	}
	//console.log("Favor Critique: "+ favorCritique);
	*/
    console.log("-------   Step 3: Finished ---------");
	console.log();
	//========================================================================================================================
	//========================================================================================================================

	

	//========================================================================================================================
	console.log("-------  Step 4:  Generate diversified critiques -----------");
	//========================================================================================================================


	let start = new Date().getTime();
	// Diversity degree 
	numOfDiversifiedCritiques = Math.min(numOfDiversifiedCritiques, frequentCritiqueSet.length);
    let diversityUtilityDict =  computeDiversityUtility(frequentCritiqueSet, sortCritiqueUtility, allCritique2ItemDict,numOfDiversifiedCritiques);

	let end = new Date().getTime();

	console.log('-----diversityUtilityDict Execution time: ' + (end-start) + 'ms.');

    // get diversify critique
    //let sortDiversityUtility = _.orderBy(diversityUtilityDict, ['diversityUtility'], ['desc']);
	let diversifyCritique = [];
	for (let i=0; i < diversityUtilityDict.length; i++)
	{
		diversifyCritique.push(diversityUtilityDict[i]['critique']);

	}

	console.log("-------  Step 4:  Finished -----------");
	/*
	let diversifyCritique_occured = [];
	for (let i=0; i< sortDiversityUtility.length; i++)
	{
		let count = 0;
		for (let c=0; c<sortDiversityUtility[i]['critique'].length; c++)
		{
			feature = sortDiversityUtility[i]['critique'][c].split('|');
			//console.log(feature[0]);
			if (diversifyCritique_occured.includes(feature[0]))
			{
				count = count + 1;
			}
		}
		
		if (count < 1)
		{
			diversifyCritique.push(sortDiversityUtility[i]['critique']);
			// print the diversified Critique and the related items
			let critique2ItemSetObject = _.find(allCritique2ItemDict, {'critique': sortDiversityUtility[i]['critique']});
        	let critique2ItemSet = critique2ItemSetObject['itemSet'];
			console.log();
			console.log("Diversify Critiques: "+sortDiversityUtility[i]['critique'] + " sum: "+critique2ItemSet.length)

			console.log(sortDiversityUtility[i]['diversityUtility']);
			
			for (let critique of sortDiversityUtility[i]['critique'])
			{
				feature = critique.split('|');
				diversifyCritique_occured.push(feature[0])

			}
		}
		if (diversifyCritique.length == numOfDiversifiedCritiques)
		{
			console.log("The position of last diversified critique:" + i);
			break;
		}
		
	}
	*/
	
	//========================================================================================================================
	//========================================================================================================================

	return {'diversifyCritique': diversifyCritique }   

}