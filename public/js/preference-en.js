var spotifyToken = $.cookie('spotify-token')


$.get("/getArtist?token="+spotifyToken,function(data){
	return data
}).then(function(d){
	$.get("/getTrack?token="+spotifyToken,function(data2){
		console.log(d,data2)
		if(d.items.length>=5 && data2.items.length>=20){
			$("#success").show()
			$("#next1").removeClass("disabled")
			$("#next1").addClass("btn-primary")
			$(".btn-primary").on("click", function(){
				window.location.href='/que1';
			})
		}else{
			$("#fail").show()
		}
	})
})