var storage=window.localStorage;
storage.clear();

if((navigator.language || navigator.browserLanguage).toLowerCase()!="en")
	alert("Sorry, currently the speech recognition of our system only supports English, please set your browser language to English.")

var tracks_man = [
	{
		"name": "有一种悲伤 - 黄丽玲",
		"id": "3ayrHkyorPEpeOBvZ76SwG"
	},
	{
		"name": "岩石里的花 - 邓紫棋",
		"id": "1HhPL0MH5bkJrOnW933joC"
	},
	{
		"name": "说散就散 - 袁娅维",
		"id": "6SbR5s0xm1evVCS72oONYN"
	},
	{
		"name": "体面 - 于文文",
		"id": "1XJdv86VumEbhPODhtzFms"
	},
	{
		"name": "小幸运 - 田馥甄",
		"id": "6uOnsfwC7H43zF0dOOax8t"
	},
	{
		"name": "慢慢喜欢你 - 莫文蔚",
		"id": "7EoyERNueJuFlQbyrRB0US"
	},
	{
		"name": "告白气球 - 周杰伦",
		"id": "1ivCIgrYZyE0BvItL4Z8lk"
	},
	{
		"name": "那些你很冒险的梦 - 林俊杰",
		"id": "5kZDxLcbqglZ2yYXg4Mkjc"
	},
	{
		"name": "演员 - 薛之谦 ",
		"id": "34mRQFXVDXFdZz3pqddU7x"
	},
	{
		"name": "等你下课 - 周杰伦",
		"id": "76WthWB0v0KXUHZoAclMVV"
	},
	{
		"name": "你，好不好 - 周兴哲",
		"id": "748a45haiVFPzYSDRWLifx"
	},
	{
		"name": "可惜没如果 - 林俊杰",
		"id": "6WoQzK5Exbfcmow1AoNRkl"
	},
	{
		"name": "可不可以 - 张紫豪",
		"id": "2WBVjfhKzYXc6fhdpT0TtC"
	},
	{
		"name": "后来的我们 - 五月天",
		"id": "13AruKdh8wJhWx6i5dV8X1"
	},
	{
		"name": "修炼爱情 - 林俊杰",
		"id": "190kU2WKyIzx9XaBjfWRPk"
	},
	{
		"name": "她说 - 林俊杰",
		"id": "632VyMrvhsHIsO4zq9khts"
	},
	{
		"name": "残缺的彩虹 - 陈绮贞",
		"id": "0SvqolKhBNM7WVEXJGLIMO"
	},
	{
		"name": "追光者 - 岑宁儿",
		"id": "66LKcDWIHdqWEaviZhcMTx"
	},
	{
		"name": "遗书 - 蔡健雅",
		"id": "1rCtodIWGCQKD7haPxhiN9"
	},
	{
		"name": "光年之外 - 邓紫棋",
		"id": "0L2qNNx0w6YD1ih3FObgqw"
	}
]

var tracks_can = [
	{
		"name": "永远飞行模式 - Dear Jane",
		"id": "5EIzOqZAhzahqfECAm68sY"
	},
	{
		"name": "龙舌兰 - 陈奕迅",
		"id": "5VCRrcx8hnFHeggm5acXKs"
	},
	{
		"name": "百年树木 - 张敬轩",
		"id": "3QZWdwawy8K2Thsn4LwYDv"
	},
	{
		"name": "在月台上等你 - 卫兰",
		"id": "4apKcYGPasaBCwmEVvGB0k"
	},
	{
		"name": "（一个男人）一个女人和浴室 - 谢安琪",
		"id": "5NvsRbIoMFMqBAVFHn1f3X"
	},
	{
		"name": "别再怕 - 菊梓乔",
		"id": "1a5SHuckBsa4CDdFunytwf"
	},
	{
		"name": "沐春风 - 谢安琪",
		"id": "4mE4scEJMESCPSrM4IH5tw"
	},
	{
		"name": "太难开始 - 胡鸿钧",
		"id": "2NJh3jZkabUE1a3K6XTJBf"
	},
	{
		"name": "掉进海的眼泪 - 洪嘉豪",
		"id": "14E27fUMTIrhQtOxMWP0py"
	},
	{
		"name": "对人欢笑 - 陈柏宇",
		"id": "6BJQpdx1oRt4adQvxGfA2W"
	},
	{
		"name": "长相厮守 - ToNick",
		"id": "3VSFri2BxieCG7RtuxFMXr"
	},
	{
		"name": "渐渐 - 陈奕迅",
		"id": "4zD2h6vDuzVm1QWyQJlb0P"
	},
	{
		"name": "假使世界原来不像你预期 - 方皓玟",
		"id": "53HxUdYRCRMdzYPG0qhGUP"
	},
	{
		"name": "认真如初 - 陈柏宇",
		"id": "51sLlaSnNj51ZQe799MmBy"
	},
	{
		"name": "挥挥手 - 李玲玉",
		"id": "1ARzk3vJTowoQmqddXrqjY"
	},
	{
		"name": "守口如瓶 - 周国贤",
		"id": "5Du5h7GmIUimWhG5atpO7s"
	},
	{
		"name": "无尽 - Supper Moment",
		"id": "6TNz79kvUVVQSM2EhZQVq8"
	},
	{
		"name": "若然冬天没有花 - 梁钊峰",
		"id": "07JzFsUuuOW4eQR6d9iMXR"
	},
	{
		"name": "心之科学 - 容祖儿 ",
		"id": "1gVMd7oYGo6Whlgg7pAa7M"
	},
	{
		"name": "LOVE is NEARBY - Supper Moment",
		"id": "7c3bWvF9526qmk0TitJNNl"
	},
]

var tracks_eng = [
	{
		"name": "Shape of You - Ed Sheeran ",
		"id": "7qiZfU4dY1lWllzX7mPBI3"
	},
	{
		"name": "One Dance - Drake",
		"id": "1zi7xx7UVEFkmKfv06H8x0"
	},
	{
		"name": "Closer - Joy Division",
		"id": "7BKLCZ1jbUBVqRi2FVlTVw"
	},
	{
		"name": "rockstar - Post Malone",
		"id": "0e7ipj03S05BNilyu5bRzt"
	},
	{
		"name": "Thinking Out Loud - Ed Sheeran",
		"id": "34gCuhDGsG4bRPIf9bb02f"
	},
	{
		"name": "Lean On - Major Lazer",
		"id": "2YWjW3wwQIBLNhxWKBQd16"
	},
	{
		"name": "Despacito (Remix) - Luis Fonsi",
		"id": "6rPO02ozF3bM7NnOV4h6s2"
	},
	{
		"name": "Love Yourself - Justin Bieber",
		"id": "50kpGaPAhYJ3sGmk6vplg0"
	},
	{
		"name": "God's Plan - Drake",
		"id": "6DCZcSspjsKoFjzjrWoCdn"
	},
	{
		"name": "Sorry - Justin Bieber",
		"id": "3Du2K5dLzmduCNp6uwuaL0"
	},
	{
		"name": "Don't Let Me Down - The Chainsmokers",
		"id": "1i1fxkWeaMmKEB4T7zqbzK"
	},
	{
		"name": "Havana - Camila Cabello",
		"id": "1rfofaqEpACxVEHIZBJe6W"
	},
	{
		"name": "I Took a Pill in Ibiza - Mike Posner",
		"id": "0vbtURX4qv1l7besfwmnD8"
	},
	{
		"name": "Starboy - The Weeknd",
		"id": "7MXVkk9YMctZqd1Srtv4MB"
	},
	{
		"name": "Let Me Love You - Mario",
		"id": "6xtcFXSo8H9BZN637BMVKS"
	},
	{
		"name": "New Rules - Dua Lipa",
		"id": "2ekn2ttSfGqwhhate0LSR0"
	},
	{
		"name": "Photograph - Ed Sheeran ",
		"id": "1HNkqx9Ahdgi1Ixy2xkKkL"
	},
	{
		"name": "Say You Won't Let Go - James Arthur",
		"id": "5uCax9HTNlzGybIStD3vDh"
	},
	{
		"name": "Cold Water - Major Lazer",
		"id": "3Yqsx1OFZqPbULxXPLHlpq"
	},
	{
		"name": "Perfect - Ed Sheeran ",
		"id": "0tgVpDi06FyKpA1z0VMD4v"
	}
]

var artists_male = [
	{
		"name":"薛之谦",
		"id":"1cg0bYpP5e2DNG0RgK2CMN"
	},
	{
		"name":"陈奕迅",
		"id":"2QcZxAgcs2I1q7CtCkl6MI"
	},
	{
		"name":"林俊杰",
		"id":"7Dx7RhX0mFuXhCOUgB01uM"
	},
	{
		"name":"林宥嘉",
		"id":"1GPoTgvXd5OqZMF1akOsV2"
	},
	{
		"name":"李荣浩",
		"id":"0rTP0x4vRFSDbhtqcCqc8K"
	},
	{
		"name":"华晨宇",
		"id":"7v7bP8NfcMYh4sDADEAy6Z"
	},
	{
		"name":"王以太",
		"id":"3FpGegUfBRYiws8Ww49Y1j"
	},
	{
		"name":"马雨阳",
		"id":"1kAQfi76NXr3dwCZSkYFC7"
	},
	{
		"name":"周杰伦",
		"id":"2elBjNSdBE2Y3f0j1mjrql"
	},
	{
		"name":"毛不易",
		"id":"6gvSKE72vF6N20LfBqrDmm"
	}
]


var artists_female = [
	{
		"name":"任然",
		"id":"6f4srX54JFrLNK4aTJe2Sc"
	},
	{
		"name":"陈粒",
		"id":"3SyC3U06X0DjdWd2Jf6V8Q"
	},
	{
		"name":"袁娅维",
		"id":"70paW48PtCtUjtndElrjrL"
	},
	{
		"name":"蔡健雅",
		"id":"376pcuw4IgWBMOUwCr8kIm"
	},
	{
		"name":"王菲",
		"id":"3df3XLKuqTQ6iOSmi0K3Wp"
	},
	{
		"name":"岑宁儿",
		"id":"2OrCYFzQYE1TmevdYARnU1"
	},
	{
		"name":"金玟岐",
		"id":"4ieCG6ylz8VnMkGMkiWpbd"
	},
	{
		"name":"周笔畅",
		"id":"3WHsy1Rq4vPEdRyo9P3a48"
	},
	{
		"name":"邓紫棋",
		"id":"7aRC4L63dBn3CiLDuWaLSI"
	},
	{
		"name":"徐佳莹",
		"id":"3dI4Io8XE33J2o04ZwjR0Y"
	}
]


var artists_eng1 = [
	{
		"name":"Ed Sheeran",
		"id":"6eUKZXaKkcviH0Ku9w2n3V"
	},
	{
		"name":"Drake",
		"id":"3TVXtAsR1Inumwj472S9r4"
	},
	{
		"name":"Rihanna",
		"id":"5pKCCKE2ajJHZ9KAiaK11H"
	},
	{
		"name":"Justin Bieber",
		"id":"1uNFoZAHBGtllmzznpCI3s"
	},
	{
		"name":"Eminem",
		"id":"7dGJo4pcD2V6oG8kP0tJRR"
	},
	{
		"name":"Ariana Grande",
		"id":"66CXWjxzNUsdJxJ2JdwvnR"
	},
	{
		"name":"Bruno Mars",
		"id":"0du5cEVh5yTK9QJze8zA0C"
	},
	{
		"name":"David Guetta",
		"id":"1Cs0zKBU1kc0i8ypK3B9ai"
	},
	{
		"name":"Beyoncé",
		"id":"6vWDO969PvNqNYHIOW5v0m"
	},
	{
		"name":"Taylor Swift",
		"id":"06HL4z0CvFAxyc27GXpf02"
	}
]

var artists_eng2 = [
	{
		"name":"Coldplay",
		"id":"4gzpq5DPGxSnKTe4SA8HAU"
	},
	{
		"name":"Shakira",
		"id":"0EmeFodog0BfCgMzAIvKQp"
	},
	{
		"name":"Maroon 5",
		"id":"04gDigrS5kc9YWfZHwBETP"
	},
	{
		"name":"Calvin Harris",
		"id":"7CajNmpbOovFoOoasH2HaY"
	},
	{
		"name":"Imagine Dragons",
		"id":"53XhwfbYqKCa1cC15pYq2q"
	},
	{
		"name":"Nicki Minaj",
		"id":"0hCNtLu0JehylgoiP8L4Gh"
	},
	{
		"name":"The Weeknd",
		"id":"1Xyo4u8uXC1ZmMpatF05PJ"
	},
	{
		"name":"Maluma",
		"id":"1r4hJ1h58CWwUQe3MxPuau"
	},
	{
		"name":"Shawn Mendes",
		"id":"7n2wHs1TKAczGzO7Dd2rGr"
	},
	{
		"name":"Ozuna",
		"id":"1i8SpTcr7yvPOmcqrbnVXY"
	}
]

var genres_text = ["afrobeat-非洲打击乐风格","electro-电气音乐","blues-蓝调布鲁斯","ska","comedy-喜剧","country-乡村音乐","piano-钢琴","electronic-电子音乐","folk-民谣","hip-hop-嘻哈","jazz-爵士乐","latin-拉丁音乐","pop-流行","r-n-b-节奏蓝调","rock-摇滚音乐"]

var genres = ["afrobeat","electro","blues","ska","comedy","country","piano","electronic","folk","hip-hop","jazz","latin","pop","r-n-b","rock"]

var selectedArtists = [],
	selectedTracks = [],
	selectedArtistNames = [],
	selectedTrackNames = [],
	selectedGenres = [],
	selectedFeatures = {};

for(var i in tracks_man){
	$(".tracks .man").append('<div class="form-check" id="'+tracks_man[i].id+'"><input class="form-check-input" type="checkbox" value='+tracks_man[i].id+' name='+tracks_man[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/track/'+tracks_man[i].id+'">'+tracks_man[i].name+'</a></label></div>')
}

for(var i in tracks_can){
	$(".tracks .can").append('<div class="form-check"  id="'+tracks_can[i].id+'"><input class="form-check-input" type="checkbox" value='+tracks_can[i].id+' name='+tracks_can[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/track/'+tracks_can[i].id+'">'+tracks_can[i].name+'</label></div>')
}

for(var i in tracks_eng){
	$(".tracks .eng").append('<div class="form-check"  id="'+tracks_eng[i].id+'"><input class="form-check-input" type="checkbox" value='+tracks_eng[i].id+' name='+tracks_eng[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/track/'+tracks_eng[i].id+'">'+tracks_eng[i].name+'</label></div>')
}

for(var i in artists_male){
	$(".artists .male").append('<div class="form-check"  id="'+artists_male[i].id+'"><input class="form-check-input" type="checkbox" value='+artists_male[i].id+' name='+artists_male[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/artist/'+artists_male[i].id+'">'+artists_male[i].name+'</label></div>')
}

for(var i in artists_female){
	$(".artists .female").append('<div class="form-check"  id="'+artists_female[i].id+'"><input class="form-check-input" type="checkbox" value='+artists_female[i].id+' name='+artists_female[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/artist/'+artists_female[i].id+'">'+artists_female[i].name+'</label></div>')
}

for(var i in artists_eng1){
	$(".artists .eng1").append('<div class="form-check"  id="'+artists_eng1[i].id+'"><input class="form-check-input" type="checkbox" value='+artists_eng1[i].id+' name='+artists_eng1[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/artist/'+artists_eng1[i].id+'">'+artists_eng1[i].name+'</label></div>')
}

for(var i in artists_eng2){
	$(".artists .eng2").append('<div class="form-check"  id="'+artists_eng2[i].id+'"><input class="form-check-input" type="checkbox" value='+artists_eng2[i].id+' name='+artists_eng2[i].name+'><label class="form-check-label"><a target="_blank" href="https://open.spotify.com/artist/'+artists_eng2[i].id+'">'+artists_eng2[i].name+'</label></div>')
}

for(var i in genres){
	$(".genres").append('<div class="form-check"  id="'+genres[i]+'"><input class="form-check-input" type="checkbox" value='+genres[i]+'><label class="form-check-label">'+genres_text[i]+'</label></div>')
}

for(var i in genres){
	$(".genres-en").append('<div class="form-check"  id="'+genres[i]+'"><input class="form-check-input" type="checkbox" value='+genres[i]+'><label class="form-check-label">'+genres[i]+'</label></div>')
}

$(".tracks .form-check-input").on("click", function(){
	var value = $(this).attr("value")
	var text = $(this).attr("name")
	if ($(this).prop("checked")) {
         selectedTracks.push(value)
         selectedTrackNames.push(text)

    } else {
         var index = selectedTracks.indexOf(value)
         selectedTracks.splice(index,1)
         var index2 = selectedTrackNames.indexOf(text)
         selectedTrackNames.splice(index2,1)
    }

	storage.selectedTracks = selectedTracks
	storage.selectedTrackNames = selectedTrackNames

	var numberOfSeeds = storage.selectedTracks.split(",").length
    if(numberOfSeeds==3){
    	$(".tracks .form-check-input:not(:checked)").attr("disabled", true)
    }else if(numberOfSeeds<3){
    	$(".tracks .form-check-input:not(:checked)").attr("disabled", false)
    }
})

$(".artists .form-check-input").on("click", function(){
	var value = $(this).attr("value")
	var text = $(this).attr("name")

	if ($(this).prop("checked")) {
         selectedArtists.push(value)
         selectedArtistNames.push(text)

    } else {
         var index = selectedArtists.indexOf(value)
         selectedArtists.splice(index,1)
         var index2 = selectedArtistNames.indexOf(text)
         selectedArtistNames.splice(index2,1)
    }

    storage.selectedArtists = selectedArtists
    storage.selectedArtistNames = selectedArtistNames

	var numberOfSeeds = storage.selectedArtists.split(",").length

    if(numberOfSeeds==3){
    	$(".artists .form-check-input:not(:checked)").attr("disabled", true)
    }else if(numberOfSeeds<3){
    	$(".artists .form-check-input:not(:checked)").attr("disabled", false)
    }
})

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
	if($(this).attr("name")=="danceOption"){
		if($(this).val()=="low")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/653fb243a941daa76fa07e5f01ea5d66b9c0de75?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="medium")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/d283f120c773725e74fc2582099dd6833b237a83?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="high")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/8ea7db85c52756ee3c7da4ec9f89b40ba4b20a2e?cid=774b29d4f13844c495f206cafdad9c86")
	}
	else if($(this).attr("name")=="speechOption"){
		if($(this).val()=="low")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/4311c016618297b2d2266165e51b010b0b1234d8?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="medium")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/288bd1164791d0f8e61aa452f602d5a6d80ca206?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="high")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/a49586868718985f927cc3f2e86ea57b65da08ee?cid=774b29d4f13844c495f206cafdad9c86")
	}
	else if($(this).attr("name")=="tempoOption"){
		if($(this).val()=="low")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/4c112b50719f0d39deb0b9f1fa2601eb0555cc73?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="medium")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/c79b330f42df9569657670bb0ff072792a455bc4?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="high")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/e4bb02e30b13d967d882cf8f9fe4b4a85324d7cd?cid=774b29d4f13844c495f206cafdad9c86")
	}
	else if($(this).attr("name")=="energyOption"){
		if($(this).val()=="low")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/94d49c209490d5c765b9d58b3ab01c5f7663dcd9?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="medium")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/5c33b7fbb2ca5ee02a7ee3b2278c7c8b46ac16af?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="high")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/6b3fb5a90d2acfe692d6ea40df5b712b519e6e90?cid=774b29d4f13844c495f206cafdad9c86")
	}
	else if($(this).attr("name")=="valenceOption"){
		if($(this).val()=="low")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/382e98fe869bf3ce35acf0f01b09cc199a3292be?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="medium")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/ce08fd6e359d13a3e4f997abf366f0ec3f29500f?cid=774b29d4f13844c495f206cafdad9c86")
		else if($(this).val()=="high")
			$("audio").attr("src","https://p.scdn.co/mp3-preview/d5b6e7b1d0dd9e9bb3ddf05ce36cf0dd8fb53ef9?cid=774b29d4f13844c495f206cafdad9c86")
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


$('[data-toggle="popover"]').popover({trigger:"hover"})