var selectedArtists = [],
	selectedTracks = [],
	selectedArtistNames = [],
	selectedTrackNames = [],
	selectedGenres = [],
	selectedFeatures = {};

var storage=window.localStorage;
storage.clear();
var spotifyToken = $.cookie('spotify-token')

storage.language = "zh"

if((navigator.language || navigator.browserLanguage).toLowerCase()!="en")
	alert("Sorry, currently the speech recognition of our system only supports English, please set your browser language to English.")


$("#search-artist").click(function(){
	var name = $("#artist-form").val()
	$.get("/searchOnlyArtist?token="+spotifyToken+"&q="+name,function(data){
		if(data.artists.items.length>0){

			$(".candidate-artists").empty()
			var artists = data.artists.items.slice(0,10)
			if(artists.length>1){
				$(".candidate-artists").append("<div class='list-group'></div>")
				for (var i = 0; i < artists.length; i++) {
					$(".list-group").append("<button id='artist-"+i+"' type='button' class='list-group-item list-group-item-action'>"+artists[i].name+"</button>")
					$("#artist-"+i).click(function(){
						$(".candidate-artists").empty()
						var artistIndex = $(this).attr("id").split("-")[1]
						if(selectedArtists.indexOf(artists[artistIndex].id)<0){
							if(selectedArtists.length==3)
								alert("Sorry, you are only allowed to add at most three artists.")
							else{
								if(artists[artistIndex].images[0])
									$(".selected-artists").append('<div class="card" style="width: 18rem;"><img class="card-img-top" src="'+artists[artistIndex].images[0].url+'" alt="" /><div class="card-body" id="'+artists[artistIndex].id+'"><h5 class="card-title">'+artists[artistIndex].name+'</h5><p class="card-text">Genres: '+artists[artistIndex].genres.toString()+'</p><p class="card-text">Popularity: '+artists[artistIndex].popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')
								else
									$(".selected-artists").append('<div class="card" style="width: 18rem;"><img class="card-img-top" src="/img/singer.jpeg" alt="" /><div class="card-body" id="'+artists[artistIndex].id+'"><h5 class="card-title">'+artists[artistIndex].name+'</h5><p class="card-text">Genres: '+artists[artistIndex].genres.toString()+'</p><p class="card-text">Popularity: '+artists[artistIndex].popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')

								selectedArtists.push(artists[artistIndex].id)
								selectedArtistNames.push(artists[artistIndex].name)
							}

							$(".selected-artists button").click(function(){
								$(this).parent().parent().remove()
					         	var index = selectedArtists.indexOf($(this).parent().attr("id"))
			     				selectedArtists.splice(index,1)
			     				selectedArtistNames.splice(index,1)
							})

							storage.selectedArtists = selectedArtists
			    			storage.selectedArtistNames = selectedArtistNames
						}else{
							alert("You have added the artist "+artists[artistIndex].name+" to the list of your favorite artists.")
						}

					})
				}
			}else{

				var artist = data.artists.items[0]

				if(selectedArtists.indexOf(artist.id)<0){
					if(selectedArtists.length==3)
						alert("Sorry, you are only allowed to add at most three artists.")
					else{
						$(".selected-artists").append('<div class="card" style="width: 18rem;"><img class="card-img-top" src="'+artist.images[1].url+'" alt="" /><div class="card-body" id="'+artist.id+'"><h5 class="card-title">'+artist.name+'</h5><p class="card-text">Genres: '+artist.genres.toString()+'</p><p class="card-text">Popularity: '+artist.popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')
						selectedArtists.push(artist.id)
						selectedArtistNames.push(artist.name)
					}

					$(".selected-artists button").click(function(){
						$(this).parent().parent().remove()
			         	var index = selectedArtists.indexOf($(this).parent().attr("id"))
	     				selectedArtists.splice(index,1)
	     				selectedArtistNames.splice(index,1)
					})

					storage.selectedArtists = selectedArtists
	    			storage.selectedArtistNames = selectedArtistNames
				}else{
					alert("You have added the artist "+artist.name+" to the list of your favorite artists.")
				}
			}

		}else{
			alert("Sorry, no artist is found. Please check your spelling of the artist's name.")
		}
	})
})

$("#search-track").click(function(){
	var name = $("#track-form").val()
	$.get("/searchOnlyTrack?token="+spotifyToken+"&q="+name,function(data){

		if(data.tracks.items.length>0){
			$(".candidate-tracks").empty()
			var tracks = data.tracks.items.slice(0,10)
			if(tracks.length>1){
				$(".candidate-tracks").append("<div class='list-group'></div>")
				for (var i = 0; i < tracks.length; i++) {
					$(".list-group").append("<button id='track-"+i+"' type='button' class='list-group-item list-group-item-action'>"+tracks[i].name+" - "+tracks[i].artists[0].name+"</button>")
					$("#track-"+i).click(function(){
						$(".candidate-tracks").empty()
						var trackIndex = $(this).attr("id").split("-")[1]
						if(selectedTracks.indexOf(tracks[trackIndex].id)<0){
							if(selectedTracks.length==3)
								alert("Sorry, you are only allowed to add at most three songs.")
							else{
								$(".selected-tracks").append('<div class="card" style="width: 18rem;"><iframe src="https://open.spotify.com/embed/track/' + tracks[trackIndex].id + '" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe><div class="card-body"><h5 class="card-title">'+tracks[trackIndex].name+'</h5><p class="card-text">'+tracks[trackIndex].artists[0].name+'</p><p class="card-text">Popularity: '+tracks[trackIndex].popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')
								selectedTracks.push(tracks[trackIndex].id)
								selectedTrackNames.push(tracks[trackIndex].name)
							}

							$(".selected-tracks button").click(function(){
								$(this).parent().parent().remove()
					         	var index = selectedTracks.indexOf($(this).parent().attr("id"))
			     				selectedTracks.splice(index,1)
			     				selectedTrackNames.splice(index,1)
							})
							storage.selectedTracks = selectedTracks
							storage.selectedTrackNames = selectedTrackNames
						}else{
							alert("You have added the song "+tracks[trackIndex].name+" to the list of your favorite songs.")
						}

					})
				}
			}else{
				var track = tracks[0]
				if(selectedTracks.indexOf(track.id)<0){
					if(selectedTracks.length==3)
						alert("Sorry, you are only allowed to add at most three songs.")
					else{
						$(".selected-tracks").append('<div class="card" style="width: 18rem;"><iframe src="https://open.spotify.com/embed/track/' + track.id + '" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe><div class="card-body"><h5 class="card-title">'+track.name+'</h5><p class="card-text">'+track.artists[0].name+'</p><p class="card-text">Popularity: '+track.popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')
						selectedTracks.push(track.id)
						selectedTrackNames.push(track.name)
					}

					$(".selected-tracks button").click(function(){
						$(this).parent().parent().remove()
			         	var index = selectedTracks.indexOf($(this).parent().attr("id"))
	     				selectedTracks.splice(index,1)
	     				selectedTrackNames.splice(index,1)
					})
					storage.selectedTracks = selectedTracks
					storage.selectedTrackNames = selectedTrackNames
				}else{
					alert("You have added the song "+track.name+" to the list of your favorite songs.")
				}

			}
		}else{
			alert("Sorry, no song is found. Please check your spelling of the song name.")
		}
	})
})


var genres_text = ["afrobeat-非洲打击乐风格","electro-电气音乐","blues-蓝调布鲁斯","ska","comedy-喜剧","country-乡村音乐","piano-钢琴","electronic-电子音乐","folk-民谣","hip-hop-嘻哈","jazz-爵士乐","latin-拉丁音乐","pop-流行","r-n-b-节奏蓝调","rock-摇滚音乐"]

var genres = ["afrobeat","electro","blues","ska","comedy","country","piano","electronic","folk","hip-hop","jazz","latin","pop","r-n-b","rock"]


for(var i in genres){
	$(".genres").append('<div class="form-check"  id="'+genres[i]+'"><input class="form-check-input" type="checkbox" value='+genres[i]+'><label class="form-check-label">'+genres_text[i]+'</label></div>')
}

for(var i in genres){
	$(".genres-en").append('<div class="form-check"  id="'+genres[i]+'"><input class="form-check-input" type="checkbox" value='+genres[i]+'><label class="form-check-label">'+genres[i]+'</label></div>')
}


$(".genres .form-check-input, .genres-en .form-check-input").on("click", function(){
	var value = $(this).attr("value")
	if ($(this).prop("checked")) {
         selectedGenres.push(value)
    } else {
         var index = selectedGenres.indexOf(value)
         selectedGenres.splice(index,1)
    }

    storage.selectedGenres = selectedGenres

	var numberOfSeeds = storage.selectedGenres.split(",").length


    if(numberOfSeeds==3){
    	$(".genres .form-check-input:not(:checked)").attr("disabled", true)
    }else if(numberOfSeeds<3){
    	$(".genres .form-check-input:not(:checked)").attr("disabled", false)
    }
})

$(".feature-selection").on("click", function(){
	$(".example").empty()
	if($(this).attr("name")=="danceOption"){
		if($(this).val()=="low")
			$(".danceability-example").append('<iframe src="https://open.spotify.com/embed/track/2s1sdSqGcKxpPr5lCl7jAV" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="medium")
			$(".danceability-example").append('<iframe src="https://open.spotify.com/embed/track/0CZ8lquoTX2Dkg7Ak2inwA" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="high")
			$(".danceability-example").append('<iframe src="https://open.spotify.com/embed/track/1ung2kajpw24AaHjBtPY3j" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
	}
	else if($(this).attr("name")=="speechOption"){
		if($(this).val()=="low")
			$(".speechiness-example").append('<iframe src="https://open.spotify.com/embed/track/1BuZAIO8WZpavWVbbq3Lci" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="medium")
			$(".speechiness-example").append('<iframe src="https://open.spotify.com/embed/track/1Bqxj0aH5KewYHKUg1IdrF" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="high")
			$(".speechiness-example").append('<iframe src="https://open.spotify.com/embed/track/39hnH8WdPmNT3Q3yzwC9Rg" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
	}
	else if($(this).attr("name")=="tempoOption"){
		if($(this).val()=="low")
			$(".tempo-example").append('<iframe src="https://open.spotify.com/embed/track/6gU9OKjOE7ghfEd55oRO57" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="medium")
			$(".tempo-example").append('<iframe src="https://open.spotify.com/embed/track/7bmqcI1HQwx1PWwYyZO0lg" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="high")
			$(".tempo-example").append('<iframe src="https://open.spotify.com/embed/track/1Ser4X0TKttOvo8bgdytTP" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
	}
	else if($(this).attr("name")=="energyOption"){
		if($(this).val()=="low")
			$(".energy-example").append('<iframe src="https://open.spotify.com/embed/track/64GRDrL1efgXclrhVCeuA0" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="medium")
			$(".energy-example").append('<iframe src="https://open.spotify.com/embed/track/3TGRqZ0a2l1LRblBkJoaDx" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="high")
			$(".energy-example").append('<iframe src="https://open.spotify.com/embed/track/3UDXkdQquqCEAJdNAsA1wO" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
	}
	else if($(this).attr("name")=="valenceOption"){
		if($(this).val()=="low")
			$(".valence-example").append('<iframe src="https://open.spotify.com/embed/track/6V9kwssTrwkKT72imgowj9" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="medium")
			$(".valence-example").append('<iframe src="https://open.spotify.com/embed/track/7zsXy7vlHdItvUSH8EwQss" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
		else if($(this).val()=="high")
			$(".valence-example").append('<iframe src="https://open.spotify.com/embed/track/6gTJaPuj8DT8RjuDJyBgzP" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>')
	}
})

$("#next1").on("click", function(){
	$("#part1").hide()
	$("#part2").show()

})


$("#next2").on("click", function(){
	if(storage.selectedTracks ==undefined){
		alert("Please select at least one song your like.")
	}else{
		if(storage.selectedTracks.length==0)
			alert("Please select at least one song your like.")
		else{
			$("#part2").hide()
			$("#part3").show()
		}
	}
})

$("#next2-back").on("click", function(){
	$("#part2").hide()
	$("#part1").show()
})

$("#next3").on("click", function(){
	if(storage.selectedArtists ==undefined){
		alert("Please select at least one artist your like.")
	}else{
		if(storage.selectedArtists.length==0)
			alert("Please select at least one artist your like.")
		else{
			$("#part3").hide()
			$("#part4").show()
		}			
	}
})

$("#next3-back").on("click", function(){
	$("#part3").hide()
	$("#part2").show()
})

$("#next4").on("click", function(){
	if(storage.selectedGenres ==undefined){
		alert("Please select at least one music genre you like.")
	}else{
		if(storage.selectedGenres.length==0)
			alert("Please select at least one music genre you like.")
		else{
			$("#part4").hide()
			$("#part5").show()
		}
	}
})

$("#next4-back").on("click", function(){
	$("#part4").hide()
	$("#part3").show()
})


$("#next5").on("click", function(){

	var dance = $("input[name=danceOption]:checked").val();
	var speech = $("input[name=speechOption]:checked").val();
	var tempo = $("input[name=tempoOption]:checked").val();
	var energy = $("input[name=energyOption]:checked").val();
	var valence = $("input[name=valenceOption]:checked").val();

	var danceRange, tempoRange, valenceRange, energyRange, speechRange;

    if(dance=="low")
        danceRange = [0,0.4,"low"]
    else if(dance=="medium")
        danceRange = [0.4,0.8,"middle"]
    else if(dance=="high")
        danceRange = [0.8,1,"high"]

    if(tempo=="low")
        tempoRange = [0,70,"low"]
    else if(tempo=="medium")
        tempoRange = [70,140,"middle"]
    else if(tempo=="high")
        tempoRange = [140,250,"high"]

    if(valence=="low")
        valenceRange = [0,0.3,"low"]
    else if(valence=="medium")
        valenceRange = [0.3,0.7,"middle"]
    else if(valence=="high")
        valenceRange = [0.7,1,"high"]   

    if(energy=="low")
        energyRange = [0,0.4,"low"]
    else if(energy=="medium")
        energyRange = [0.4,0.8,"middle"]
    else if(energy=="high")
        energyRange = [0.8,1,"high"]

    if(speech=="low")
        speechRange = [0,0.02,"low"]
    else if(speech=="medium")
        speechRange = [0.02,0.1,"middle"]
    else if(speech=="high")
        speechRange = [0.1,1,"high"]
    
	selectedFeatures.dance = danceRange
	selectedFeatures.speech = speechRange
	selectedFeatures.tempo = tempoRange
	selectedFeatures.energy = energyRange
	selectedFeatures.valence = valenceRange
	storage.selectedFeatures = JSON.stringify(selectedFeatures)

	console.log(storage.selectedFeatures.dance)

	if(selectedFeatures.dance==undefined||selectedFeatures.speech==undefined||selectedFeatures.tempo==undefined||selectedFeatures.energy==undefined||selectedFeatures.valence==undefined)
		alert("Please indicate your preference to musical audio features.")
	else{
		var profile = {};
		profile.selectedGenres = storage.selectedGenres
		profile.selectedTracks = storage.selectedTracks
		profile.selectedTrackNames = storage.selectedTrackNames
		profile.selectedArtists = storage.selectedArtists
		profile.selectedArtistNames = storage.selectedArtistNames

		profile.selectedFeatures = storage.selectedFeatures

		profile.id = Math.random().toString(36).slice(-10)
		storage.profile = JSON.stringify(profile)
		window.location.href='/index';
	}
	
})

$("#next5-back").on("click", function(){
	$("#part5").hide()
	$("#part4").show()
})
