var selectedArtists = [],
	selectedTracks = [],
	selectedArtistData = [],
	selectedTrackData = [],
	selectedGenres = []

var storage=window.localStorage;

storage.buildProfile = "true";

var spotifyToken = storage.getItem("spotifyToken")

var searchArtists = function (){
	var name = $("#artist-form").val()
	$.get("/searchOnlyArtist?token="+spotifyToken+"&q="+name,function(data){
		if(data.artists.items.length>0){

			$(".candidate-artists").empty()
			var artists = data.artists.items.slice(0,10)
			if(artists.length>1){
				$(".candidate-artists").append("<div class='list-group'></div>")
				for (var i = 0; i < artists.length; i++) {
					$(".list-group").append("<button id='artist-"+i+"' type='button' class='list-group-item list-group-item-action'>"+artists[i].name+"</button>")
					console.log(artists[i])
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
								selectedArtistData.push(artists[artistIndex])
								selectedArtists.push(artists[artistIndex].id)
							}

							$(".selected-artists button").click(function(){
								$(this).parent().parent().remove()
								var index = selectedArtists.indexOf($(this).parent().attr("id"))
								if (index>-1){
									selectedArtistData.splice(index,1)
									selectedArtists.splice(index,1)
								}

							})

							storage.selectedArtistData = JSON.stringify(selectedArtistData)
							storage.selectedArtists = selectedArtists.toString()
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
						selectedArtistData.push(artist)
						selectedArtists.push(artist.id)
					}

					$(".selected-artists button").click(function(){
						$(this).parent().parent().remove()
						var index = selectedArtists.indexOf($(this).parent().attr("id"))
						selectedArtistData.splice(index,1)
						selectedArtists.splice(index,1)
					})
					storage.selectedArtistData = JSON.stringify(selectedArtistData)
					storage.selectedArtists = selectedArtists.toString()
				}else{
					alert("You have added the artist "+artist.name+" to the list of your favorite artists.")
				}
			}

		}else{
			alert("Sorry, no artist is found. Please check your spelling of the artist's name.")
		}
	})
}

var searchTracks = function(){
	var name = $("#track-form").val()
	$.get("/searchOnlyTrack?token="+spotifyToken+"&q="+name,function(data){
		console.log(data)
		if(data.tracks.length>0){
			$(".candidate-tracks").empty()
			var tracks = data.tracks.slice(0,10)
			if(tracks.length>1){
				$(".candidate-tracks").append("<div class='list-group'></div>")
				for (var i = 0; i < tracks.length; i++) {
					$(".list-group").append("<button id='track-"+i+"' type='button' class='list-group-item list-group-item-action'>"+tracks[i].name+" - "+tracks[i].artist+"</button>")
					console.log(tracks[i])
					$("#track-"+i).click(function(){
						$(".candidate-tracks").empty()
						var trackIndex = $(this).attr("id").split("-")[1]
						if(selectedTracks.indexOf(tracks[trackIndex].id)<0){
							if(selectedTracks.length==3)
								alert("Sorry, you are only allowed to add at most three songs.")
							else{
								$(".selected-tracks").append('<div class="card" style="width: 18rem;"><iframe src="https://open.spotify.com/embed/track/' + tracks[trackIndex].id + '" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe><div class="card-body" id=' + tracks[trackIndex].id +' ><h5 class="card-title">'+tracks[trackIndex].name+'</h5><p class="card-text">'+tracks[trackIndex].artist+'</p><p class="card-text">Popularity: '+tracks[trackIndex].popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')
								selectedTrackData.push(tracks[trackIndex])
								selectedTracks.push(tracks[trackIndex].id)
							}

							$(".selected-tracks button").click(function(){
								$(this).parent().parent().remove()
								var index = selectedTracks.indexOf($(this).parent().attr("id"))
								// console.log(index)

								if (index > -1){
									selectedTrackData.splice(index,1)
									selectedTracks.splice(index,1)
								}

							})
							storage.selectedTrackData = JSON.stringify(selectedTrackData)
							storage.selectedTracks = selectedTracks.toString()
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
						$(".selected-tracks").append('<div class="card" style="width: 18rem;"><iframe src="https://open.spotify.com/embed/track/' + track.id + '" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe><div class="card-body" id=' + tracks[trackIndex].id +' ><h5 class="card-title">'+track.name+'</h5><p class="card-text">'+track.artist+'</p><p class="card-text">Popularity: '+track.popularity+'/100</p><button class="btn btn-danger" type="button">Remove</button></div></div>')
						selectedTrackData.push(track)
						selectedTracks.push(track.id)
					}

					$(".selected-tracks button").click(function(){
						$(this).parent().parent().remove()
						var index = selectedTracks.indexOf($(this).parent().attr("id"))
						// console.log(index)

						if (index > -1){
							selectedTrackData.splice(index,1)
							selectedTracks.splice(index,1)
						}
					})
					storage.selectedTrackData = JSON.stringify(selectedTrackData)
					storage.selectedTracks = selectedTracks.toString()
				}else{
					alert("You have added the song "+track.name+" to the list of your favorite songs.")
				}

			}
		}else{
			alert("Sorry, no song is found. Please check your spelling of the song name.")
		}
	})

}

var initialRecommendedSongs = function(songids){
	$.get("/getRecomByTracks?token="+spotifyToken+"&trackSeeds="+songids.toString(),function(data){
		//combine selected and generated top 20 songs
		initialRecomData = selectedTrackData.concat(data.tracks)
		initialRecomData = initialRecomData.slice(0, 20)

		// for(var item in selectedTrackData){
		// 	data.tracks[19-item]=selectedTrackData[item]
		// }
		var initialRecom = JSON.stringify(initialRecomData)
		storage.setItem("initialRecom",initialRecom)
	})
}

$('input#artist-form').bind('keypress', function (event) {
	if (event.keyCode == "13") {
		searchArtists()
	}
})

$('input#track-form').bind('keypress', function (event) {
	if (event.keyCode == "13") {
		searchTracks()
	}
})

$("#search-artist").click(function(){
	searchArtists()
})

$("#search-track").click(function(){
	searchTracks()
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

	storage.selectedGenres = selectedGenres.toString()

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

// $("#next1").on("click", function(){
// 	$("#part1").hide()
// 	$("#part2").show()
// })
$("#part2").show()

$("#next2").on("click", function(){
	storage.selectedTrackData = JSON.stringify(selectedTrackData)
	storage.selectedTracks = selectedTracks.toString()

	if(storage.selectedTracks ==undefined || storage.selectedTracks.length == 0){
		alert("Please select at least one song your like.")
	}else{
		if(storage.selectedTracks.split(',').length==0)
			alert("Please select at least one song your like.")
		else{
			$("#part2").hide()
			$("#part3").show()

			initialRecommendedSongs(selectedTracks)
		}
	}
})

$("#next2-back").on("click", function(){
	$("#part2").hide()
	$("#part1").show()
})

$("#next3").on("click", function(){
	storage.selectedArtistData = JSON.stringify(selectedArtistData)
	storage.selectedArtists = selectedArtists.toString()
	if(storage.selectedArtists ==undefined || storage.selectedArtists.length == 0){
		alert("Please select at least one artist your like.")
	}else{
		if(storage.selectedArtists.split(",").length==0)
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
	if(storage.selectedGenres ==undefined || storage.selectedGenres.length == 0){
		alert("Please select at least one music genre you like.")
	}else{
		if(storage.selectedGenres.split(",").length==0)
			alert("Please select at least one music genre you like.")
		else{
			window.location.href = '/intro-en'
		}
	}
})

$("#next4-back").on("click", function(){
	$("#part4").hide()
	$("#part3").show()
})


