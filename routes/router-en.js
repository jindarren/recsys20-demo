var express = require('express');
var router = express.Router();
var recom = require('./recommender');
var passport = require('passport');
var SpotifyStrategy = require('../node_modules/passport-spotify/lib/passport-spotify/index').Strategy;
var path = require('path');
var request = require('request');
var User = require('../public/model/user');
const fs = require('fs');
var franc = require('franc-min') //for language detection
var pinyin = require("pinyin");


var avaGenres =[
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music"]


var appKey = 'a1d9f15f6ba54ef5aea0c5c4e19c0d2c',
appSecret = 'b368bdb3003747ec861e62d3bf381ba0';

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session. Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing. However, since this example does not
    //   have a database of user records, the complete spotify profile is serialized
    //   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and spotify
//   profile), and invoke a callback with a user object.
passport.use(new SpotifyStrategy({
        clientID: appKey,
        clientSecret: appSecret,
        //callbackURL: 'http://music-bot.top:3000/callback'
        callbackURL: 'http://localhost:3000/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...

        process.nextTick(function() {
            // To keep the example simple, the user's spotify profile is returned to
            // represent the logged-in user. In a typical application, you would want
            // to associate the spotify account with a user record in your database,
            // and return that user instead.
            return done(null, profile, {
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        });

    }));

router.post("/addRecord", function(req, res) {

    var user = new User(req.body);

    //save a new user
    user.save(function(err) {
        if (err)
            res.send(err)
        else
            res.json({status:"success"})
    })

});

router.get("/findRecord", function(req, res) {
    var user = new User();
    var id = req.query.id
    user.find({"id": id},function (data) {
        res.json(data)
    })
});


router.post("/updateRecord", function(req, res) {
    var updatedID = req.body.id
    var que3List = req.body.que3
    var updatedTimestamp = new Date()
    User.updateOne({"id":updatedID},{$set:{que3:que3List,timestamp:updatedTimestamp}},function(err){
        if (err)
            res.send(err)
        else
            res.json({status:"success"})
    })

});


router.get("/getRecord", function(req, res) {
    User.find({}, function(err, user) {
        if (err)
            res.json(err);
        else {
            res.json(user)
        }
    })
});


router.get('/index', function(req, res) {
    res.render('index', {
        data: req.user
    })
})

router.get('/preference-1', function(req, res) {
    res.render("preference-1")
});

router.get('/preference-2', function(req, res) {
    res.render("preference-2")
});

router.get('/preference-3', function(req, res) {
    res.render("preference-3")
});

router.get('/preference-4', function(req, res) {
    res.render("preference-4")
});

router.get('/intro', function(req, res) {
    res.render("intro")
});

router.get('/intro-en', function(req, res) {
    res.render("intro-en")
});

router.get('/success', function(req, res) {
    res.render("success")
});

router.get('/success2', function(req, res) {
    res.render("success2")
});

router.get('/tip', function(req, res) {
    res.render("tip10")
});

router.get('/index-base', function(req, res) {
    res.render('index-base', {
        data: req.user
    })
})

router.get('/que1', function(req, res) {
    res.render("que1")
});

router.get('/que2', function(req, res) {
    res.render("que2")
});

router.get('/que3', function(req, res) {
    res.render("que3")
});

router.get('/topinyin', function(req, res) {
    var text = req.query.text
    var result = pinyin(text, {style: pinyin.STYLE_NORMAL})
    var voice = ""
    for (var word in result){
        voice += result[word]+ " "
    }
    res.json({pinyin: voice})
})

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect("/")
});

/*
 route for web API
 */

router.get('/searchTrack', function(req, res) {
    var result = {}
    var token = req.query.token
    recom(token).searchTrack(req.query.q).then(function(data) {
        getAudioFeatures(token, data.tracks.items).then(function(data2) {
            result.tracks = data2;
            res.json(result)
        })
    })
})

router.get('/searchOnlyTrack', function(req, res) {
    var token = req.query.token
    recom(token).searchTrack(req.query.q).then(function(data) {
        res.json(data)
    })
})

router.get('/searchArtist', function(req, res) {
    var result = {}
    var token = req.query.token
    recom(token).searchArtist(req.query.q).then(function(data) {
        recom(token).getArtistTopTracks(data.artists.items[0].id, "SE").then(function(data2) {
            getAudioFeatures(token, data2.tracks).then(function(data3) {
                result.tracks = data3;
                res.json(result)
            })
        })
    })
})

router.get('/searchOnlyArtist', function(req, res) {
    var token = req.query.token
    recom(token).searchArtist(req.query.q).then(function(data) {
        res.json(data)
    })
})

router.get('/searchPlaylist', function(req, res) {
    var result = {}
    var token = req.query.token
    recom(token).searchPlaylist(req.query.q).then(function(data) {
        var lang;
        if (req.query.q == "english songs")
            lang = "English"
        else if (req.query.q == "spainish songs")
            lang = "Spainish"
        else if (req.query.q == "japanese songs")
            lang = "Japanese"
        else if (req.query.q == "korean songs")
            lang = "Korean"
        else if (req.query.q == "chinese songs")
            lang = "Chinese"
        else if (req.query.q == "hong kong songs")
            lang = "Cantonese"
        else if (req.query.q == "german songs")
            lang = "German"
        else if (req.query.q == "french songs")
            lang = "French"
        else if (req.query.q == "russian songs")
            lang = "Russian"
        else if (req.query.q == "portuguese songs")
            lang = "Portuguese"
        else if (req.query.q == "italian songs")
            lang = "Italian"

        recom(token).getPlaylistTracks(data.playlists.items[0].id).then(function(data2) {
            var tracks = [];

            for (var index in data2.items) {
                data2.items[index].track.language = lang
                if (data2.items[index].track.id)
                    tracks.push(data2.items[index].track)
            }
            if(tracks.length>50)
                tracks = tracks.slice(0,50)
            getAudioFeatures(token, tracks).then(function(data3) {
                result.tracks = data3;
                res.json(result)
            })
        })
    })
})

router.get('/searchPlaylistByCategory', function(req, res) {
    var result = {}
    var token = req.query.token
    recom(token).getPlaylistByCategory(req.query.genre).then(function(data, err) {
        if (err){
            res.json(err)
        }else{
            recom(token).getPlaylistTracks(data.playlists.items[0].id).then(function(data2) {
                var tracks = [];
                for (var index in data2.items) {
                    if (data2.items[index].track.id)
                        tracks.push(data2.items[index].track)
                }
                getAudioFeatures(token, tracks).then(function(data3) {
                    result.tracks = data3;
                    res.json(result)
                })
            })
        }
    })
})


router.get('/getArtist', function(req, res) {
    var result = {}
    recom(req.query.token).getTopArtists().then(function(data) {
        result.items = data;
        res.json(result)
    })
})

router.get('/getTrack', function(req, res) {
    var result = {}
    recom(req.query.token).getTopTracks().then(function(data) {
        result.items = data;
        res.json(result)
    })
})

router.get('/getGenre', function(req, res) {
    var result = {}
    recom(req.query.token).getTopGenres().then(function(data) {
        result.items = data;
        res.json(result)
    })
})


router.get('/getRecom', function(req, res) {
    var result = {}
    var token = req.query.token
    recom(token).getRecommendation(req.query.artistSeeds, req.query.trackSeeds, req.query.genreSeeds, 
        req.query.min_valence, req.query.target_valence, req.query.max_valence, 
        req.query.min_tempo, req.query.target_tempo, req.query.max_tempo, 
        req.query.min_energy, req.query.max_energy,
        req.query.min_danceability, req.query.max_danceability,
        req.query.min_speechiness, req.query.max_speechiness,
        req.query.min_popularity, req.query.max_popularity).then(function(data) {
        getAudioFeatures(token, data).then(function(data2) {
            result.tracks = data2;
            res.json(result)
        })
    })
})

router.get('/getRecomByFollowSimilar', function(req, res) {
    var result = {}
    recom(req.query.token).getArtistRelatedArtists(req.query.id).then(function(data) {
        var selectedRelated = data.slice(0, 5);
        result.similar = selectedRelated
        return selectedRelated
    }).then(function(data) {
        recom(req.query.token).getRecommendationByFollowedArtist(data, 'US').then(function(data) {
            result.items = data
            res.json(result)
        })
    })
})

router.get('/getAccount', function(req, res) {
    recom(req.query.token).getRecommendationByGenre().then(function(data) {
        res.json(data)
    })
})


var getAudioFeatures = function(token, data) {
    var artistIds = [],
        trackIds = [],
        visData = [];
    if(data.length>0){
        for (var index in data) {
            var oneRecommendation = {};
            oneRecommendation.id = data[index].id;
            oneRecommendation.name = data[index].name;
            if (!data[index].lan){
                var lang = franc(oneRecommendation.name, {
                    whitelist: ['cmn', 'eng', 'jpn', 'kor'],
                    minLength: 1
                })
                if(lang == 'cmn')
                    oneRecommendation.language = "Chinese"
                else if(lang == 'eng')
                    oneRecommendation.language = "English"
                else if(lang == 'jpn')
                    oneRecommendation.language = "Japanese"
                else if(lang == 'kor')
                    oneRecommendation.language = "Korean"
            }
            else {
                oneRecommendation.language = data[index].lan;
            }
            if(data[index].popularity)
                oneRecommendation.popularity = data[index].popularity;
            else
                oneRecommendation.popularity = 0;
            if(data[index].artists){
                oneRecommendation.artist = data[index].artists[0].name;
            }
            else{
                data.splice(index,1)
                continue
            }

            if(data[index].preview_url)
                oneRecommendation.link = data[index].preview_url;
            else
                oneRecommendation.link = "unknown"
            visData.push(oneRecommendation)
            artistIds.push(data[index].artists[0].id)
            trackIds.push(oneRecommendation.id)

        }

        return recom(token).getAudioFeatures(trackIds).then(function(data) {
            for (var index in data.audio_features) {
                //console.log(data.audio_features[index])
                visData[index].danceability = data.audio_features[index].danceability;
                visData[index].energy = data.audio_features[index].energy;
                visData[index].speechiness = data.audio_features[index].speechiness;
                visData[index].tempo = data.audio_features[index].tempo;
                visData[index].valence = data.audio_features[index].valence;
            }

            // return recom(token).getGenresForArtists(artistIds.slice(0,50)).then(function(data2) {
            //     for (var index in data2.artists) {
            //         visData[index].genre = data2.artists[index].genres[0]
            //     }
            //     return recom(token).getGenresForArtists(artistIds.slice(50,100)).then(function(data3) {
            //         for (var index in data3.artists) {
            //             visData[50+index].genre = data3.artists[index].genres[0]
            //         }
            //     }).then(function() {
            //         return visData
            //     }, function(err) {
            //         return err;
            //     })
            // })
            return recom(token).getGenresForArtists(artistIds).then(function(data2) {
                for (var index in data2.artists) {

                    var genre = data2.artists[index].genres[0]
                    if(genre==undefined){
                        genre = "niche"
                    }

                    if(genre.indexOf("pop")>=0)
                        genre = "pop"
                    else if(genre.indexOf("rock")>=0)
                        genre = "rock"
                    else if(genre.indexOf("hip hop")>=0)
                        genre = "hip hop"
                    else if(genre.indexOf("dance")>=0)
                        genre = "dance"
                    else if(genre.indexOf("funk")>=0)
                        genre = "funk"

                    visData[index].genre = genre

                }
            }).then(function() {
                return visData
            }, function(err) {
                return err;
            })
        })
    }else{
        console.log(data)
    }

}

var getAverageFeatures = function(token, trackIds, artistIds){
    var tracks = trackIds,
        artists = artistIds,
        numOfTracks = tracks.length
        features = {};

    if(numOfTracks==0)
        numOfTracks=1

    return recom(token).getTracks(tracks).then(function(data0){
        features.popularity=0 
        for (var index in data0.tracks) {
            features.popularity += data0.tracks[index].popularity;
        }
        features.popularity = features.popularity/numOfTracks

        return recom(token).getAudioFeatures(tracks).then(function(data) {
        features.danceability=0
        features.energy=0
        features.speechiness=0
        features.tempo=0
        features.valence=0 
        features.genre=""

        for (var index in data.audio_features) {
            features.danceability += data.audio_features[index].danceability;
            features.energy += data.audio_features[index].energy;
            features.speechiness += data.audio_features[index].speechiness;
            features.tempo += data.audio_features[index].tempo;
            features.valence += data.audio_features[index].valence;
        }

        features.danceability = features.danceability/numOfTracks
        features.energy = features.energy/numOfTracks
        features.speechiness = features.speechiness/numOfTracks
        features.tempo = features.tempo/numOfTracks
        features.valence = features.valence/numOfTracks
        
    }).then(function() {
            return features
        }, function(err) {
            return err;
        })
    })
}

function uniqueArr(arr1, arr2){
    var arr3 = arr1.concat(arr2)
    var arr4 = []
    for(var i=0,len=arr3.length; i<len; i++) {
        if(arr4.indexOf(arr3[i]) === -1) {
            arr4.push(arr3[i])
        }
    }
    return arr4
}

router.post('/initialize_user_model',function (req,res) {
    console.log(req.body)
    request.post({url:'http://127.0.0.1:5000/initialize_user_model',
        json: req.body}, (error, response, body) => {
        if (error) {
            console.error(error)
            return
        }
        res.json(body)
    })
})

router.post('/update_user_model',function (req,res) {
    console.log(req.body)
    request.post({url:'http://127.0.0.1:5000/update_user_model',
        json: req.body}, (error, response, body) => {
        if (error) {
            console.error(error)
            return
        }
        res.json(body)
    })
})

router.post('/get_rec',function (req,res) {
    console.log(req.body)
    request.post({url:'http://127.0.0.1:5000/get_rec',
        json: req.body}, (error, response, body) => {
        if (error) {
            console.error(error)
            return
        }
        res.json(body)
    })
})

router.post('/get_sys_cri',function (req,res) {
    console.log(req.body)
    request.post({url:'http://127.0.0.1:5000/get_sys_cri',
        json: req.body}, (error, response, body) => {
        if (error) {
            console.error(error)
            return
        }
        res.json(body)
    })
})


router.post('/trigger_sys_cri',function (req,res) {
    console.log(req.body)
    request.post({url:'http://127.0.0.1:5000/trigger_sys_cri',
        json: req.body}, (error, response, body) => {
        if (error) {
            console.error(error)
            return
        }
        res.json(body)
    })
})



router.post('/initiate', function(req, res) {
    //pass token to the webAPI used by recommender
    var token = req.query.token;
    var userID = req.query.id;
    console.log(req.query.id)
    // var artists = profile.selectedArtists.split(",");
    // var tracks = profile.selectedTracks.split(",");
    // var genres = profile.selectedGenres.split(",");
    // var artistNames = profile.selectedArtistNames.split(",");
    // var trackNames = profile.selectedTrackNames.split(",");
    // var feature = JSON.parse(profile.selectedFeatures)
    var recResult = [];

    var artistNames = [];
    var artists = [];
    var genres = [];
    var tracks = [];
    var trackNames = [];

    var artistReq = new Promise((resolve, reject) => {
        recom(token).getTopArtists(5).then(function(artistData){
            artists=artistData
            var requestedArtists = []
            for (var i = 0; i<5; i++){
                artistNames.push(artistData[i].name)
                requestedArtists.push(artistData[i].id)
                // genres = uniqueArr(genres, artistData[i].genres)
            }

            // genres = genres.slice(0,5)
            // console.log(genres)

            // recom(token).getRecommendationByGenre(genres.toString()).then(function(data){
            // var genreText = ""
            // console.log(data)
            // // if(genres.length==1)
            // //     genreText = genres[0]
            // // else if(genres.length==2)
            // //     genreText = genres[0]+" and "+genres[1]
            // // else if(genres.length==3)
            // //     genreText = genres[0]+","+genres[1]+", and "+genres[2]
            // // else if(genres.length==4)
            // //     genreText = genres[0]+","+genres[1]+","+genres[2]+", and "+genres[3]
            // // else if(genres.length==5)
            // genreText = genres[0]+","+genres[1]+","+genres[2]+","+genres[3]+", and "+genres[4]
            // getAudioFeatures(token, data).then(function(data2) {
            //     for (var i = data2.length - 1; i >= 0; i--){
            //         if (recResult.indexOf(data2[i])<0){
            //             data2[i].seed = genreText
            //             data2[i].seedType = "genre"
            //             recResult.push(data2[i])
            //         }
            //     }
            //     resolve(data2)
            //     }).catch(function (error) {//加上catch 
            //       console.log(error);
            //     })
            // }).catch(function (error) {//加上catch 
            //   console.log(error);
            // })


            recom(token).getRecommendationByArtist(requestedArtists.toString()).then(function(data3) {
            var artistText = ""
            // if(artists.length==1)
            //     artistText = artistNames[0]
            // else if(artists.length==2)
            //     artistText = artistNames[0]+" and "+artistNames[1]
            // else if(artists.length==3)
            //     artistText = artistNames[0]+","+artistNames[1]+", and "+artistNames[2]
            // else if(artists.length==4)
            //     artistText = artistNames[0]+","+artistNames[1]+","+artistNames[2]+", and "+artistNames[3]
            // else if(artists.length==5)
            artistText = artistNames[0]+", "+artistNames[1]+", "+artistNames[2]+", "+artistNames[3]+", and "+artistNames[4]

            getAudioFeatures(token, data3).then(function(data4) {
                    for (var i = data4.length - 1; i >= 0; i--) {
                        if (recResult.indexOf(data4[i])<0){
                            data4[i].seed = artistText
                            data4[i].seedType = "artist"
                            recResult.push(data4[i])
                        }
                    }
                    resolve(data4)
                }).catch(function (error) {//加上catch 
                  console.log(error);
                })
            }).catch(function (error) {//加上catch 
              console.log(error);
            })
        }).catch(function (error) {//加上catch 
          console.log(error);
        })
    })

    var trackReq = new Promise((resolve, reject) => {

        recom(token).getTopTracks(20).then(function(trackData){
            
            getAudioFeatures(token, trackData).then(function(data3) {
                tracks = data3
            }).catch(function (error) {//加上catch 
              console.log(error);
            })

            var requestedTracks = []
            for (var i = 0; i<5; i++){
                trackNames.push(trackData[i].name)
                requestedTracks.push(trackData[i].id)
            }

            recom(token).getRecommendationByTrack(requestedTracks.toString()).then(function(data) {
            var trackText = ""
            // if(tracks.length==1)
            //     trackText = trackNames[0]
            // else if(tracks.length==2)
            //     trackText = trackNames[0]+" and "+trackNames[1]
            // else if(tracks.length==3)
            //     trackText = trackNames[0]+","+trackNames[1]+", and "+trackNames[2]
            // else if(tracks.length==4)
            //     trackText = trackNames[0]+","+trackNames[1]+","+trackNames[2]+", and "+trackNames[3]
            // else if(tracks.length==5)
            trackText = trackNames[0]+", "+trackNames[1]+", "+trackNames[2]+", "+trackNames[3]+", and "+trackNames[4]

            getAudioFeatures(token, data).then(function(data2) {
                    for (var i = data2.length - 1; i >= 0; i--) {
                        if (recResult.indexOf(data2[i])<0){
                            data2[i].seed = trackText
                            data2[i].seedType = "track"
                            recResult.push(data2[i])
                        }
                    }
                    resolve(data2)
                }).catch(function (error) {//加上catch 
                  console.log(error);
                })
            }).catch(function (error) {//加上catch 
              console.log(error);
            })
        }).catch(function (error) {//加上catch 
          console.log(error);
        })
    })


    var genreReq = new Promise((resolve, reject) => {

        recom(token).getTopArtists(5).then(function(artistData){
            for (var i = 0; i<5; i++){
                genres = uniqueArr(genres, artistData[i].genres)
            }

            var newGenres = []

            for (var i = genres.length; i >= 0; i--) {
                if(avaGenres.indexOf(genres[i])>0)
                    newGenres.push(genres[i])
            }

            if(newGenres.length>5)
                genres = newGenres.slice(0,5)
            else
                genres = newGenres
                            
            console.log(genres.toString())

            recom(token).getRecommendationByGenre(genres.toString()).then(function(data){
            var genreText = ""

            for(var item in genres){
                genreText += genres[item]+", "
            }
            genreText = genreText.substr(0,genreText.length-2)
            getAudioFeatures(token, data).then(function(data2) {
                for (var i = data2.length - 1; i >= 0; i--){
                    if (recResult.indexOf(data2[i])<0){
                        data2[i].seed = genreText
                        data2[i].seedType = "genre"
                        recResult.push(data2[i])
                    }
                }
                    resolve(data2)
                }).catch(function (error) {//加上catch 
                  console.log(error);
                })
            }).catch(function (error) {//加上catch 
              console.log(error);
            })
        }).catch(function (error) {//加上catch 
          console.log(error);
        })
    })

    Promise.all([artistReq, trackReq, genreReq]).then(function(dataList) {
        // console.log(dataList)
        for(var data in dataList ){
            for( var item in dataList[data]){
                if(recResult.indexOf(dataList[data][item])<0)
                    recResult.push(dataList[data][item])
            }
        }

        var user = new User({
            id: userID,
            pool:recResult,
            new_pool:[],
            user: {
                id:userID,
                preferenceData: {
                    artist: artists,
                    track: tracks,
                    genre: genres,
                    language: "English",
                    timestamp: new Date()
                },
                user_preference_model:{},
                user_constraints:{},
                user_critique_preference:{}
            },
            topRecommendedSong:{},
            logger:{},
        });

        console.log(user.id)
        console.log(user.user)
        res.json(user)

        //save a new user
        // user.save(function(err) {
        //     if (err)
        //         console.log(err)
        //     console.log("user profile is added")
        // })
    }).catch(function (error) {//加上catch 
      console.log(error);
    })
})

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
router.get('/',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private', 'user-top-read'],
        showDialog: true
    }),
    function(req, res) {
        // The request will be redirected to spotify for authentication, so this
        // function will not be called.
    });

// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/callback',
    passport.authenticate('spotify', {
        failureRedirect: '/'
    }),
    function(req, res) {

        res.cookie('spotify-token', req.authInfo.accessToken, {
            maxAge: 3600000
        });

        res.cookie('refresh-token', req.authInfo.refreshToken, {
            maxAge: 3600000
        });

        res.cookie('user-id', req.user.id, {
            maxAge: 3600000
        });

        res.redirect('/intro-en');

    });

router.get('/refresh-token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (Buffer.from(appKey + ':' + appSecret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

     request.post(authOptions, function(error, response, body) {
        if (error) {
            console.log("error: ",error)
        }
        var access_token = body.access_token;
        res.json({"access_token":access_token})
        
    });
});

// setInterval(function(){
//     // requesting access token from refresh token
//     var refresh_token = req.query.refresh_token;
//     var authOptions = {
//         url: 'https://accounts.spotify.com/api/token',
//         headers: { 'Authorization': 'Basic ' + (new Buffer(appKey + ':' + appSecret).toString('base64')) },
//         form: {
//             grant_type: 'refresh_token',
//             refresh_token: refresh_token
//         },
//         json: true
//     };

//     request.post(authOptions, function(error, response, body) {
//         if (error) {
//             console.log("error: ",error)
//         }else{
//             console.log("token: ",body)
//             var access_token = body.access_token;
//             console.log({
//                 'access_token': access_token,
//             })
//         }
//     });
// },3600*10)


//-------------------------------system critiquing--------------------------------//

// const fs = require('fs');
// const csv = require('csv-parser');
const sysCritique = require('./systemProposedCritiques.js');
const _ = require('lodash');

class UserData {
    constructor(id, preferenceData, preferenceData_max, preferenceData_min, attributeWeight, preferenceData_variance) {
        this.id = id;
        this.preferenceData = preferenceData;
        this.preferenceData_max = preferenceData_max; // for audio features
        this.preferenceData_min = preferenceData_min; // for audio features
        this.attributeWeight = attributeWeight;
        this.preferenceData_variance = preferenceData_variance;
    }
};

// Item attributes 
let numericalAttributes = ['popularity', 'danceability', 'energy', 'speechiness', 'tempo', 'valence'];
let nominalAttributes = ['artist', 'genre', 'language'];
// let attributes = numericalAttributes.concat(nominalAttributes);


// User Data
// Get user id and corresponding data, including preference data and attribute weight for each attribute of item
// if user is new user, we set default preference / weight for he/her.

// let userId = '5';
// let defaultWeight = 1 / (numericalAttributes.length + nominalAttributes.length);

// let default_varience = 0.1;


// let preferenceData_variance = {
//     'popularity': 3,
//     'danceability': default_varience,
//     'energy': default_varience,
//     'speechiness': default_varience,
//     'tempo': default_varience,
//     'liveness': default_varience,
//     'valence': default_varience
// };

var generateCritiquing = function(data) {
    var user = data.user
    var playlist = data.playlist

    let preferenceData = {
        'artist': user.preferenceData.artist,
        'genre': user.preferenceData.genre,
        'language': user.preferenceData.language,
        'popularity': user.preferenceData.popularity,
        'danceability': user.preferenceData.danceability,
        'energy': user.preferenceData.energy,
        'speechiness': user.preferenceData.speechiness,
        'tempo': user.preferenceData.tempo,
        'valence':  user.preferenceData.valence
    };

    var totalWeight = user.attributeWeight.artistWeight+user.attributeWeight.genreWeight+user.attributeWeight.languageWeight+
    user.attributeWeight.popularityWeight+user.attributeWeight.danceabilityWeight+user.attributeWeight.energyWeight+user.attributeWeight.speechinessWeight+
    user.attributeWeight.tempoWeight+user.attributeWeight.valenceWeight;
    if(totalWeight==0)
        totalWeight=1
    let attributeWeight = {
        'artist': user.attributeWeight.artistWeight/totalWeight,
        'genre': user.attributeWeight.genreWeight/totalWeight,
        'language': user.attributeWeight.languageWeight/totalWeight,
        'popularity': user.attributeWeight.popularityWeight/totalWeight,
        'danceability': user.attributeWeight.danceabilityWeight/totalWeight,
        'energy': user.attributeWeight.energyWeight/totalWeight,
        'speechiness': user.attributeWeight.speechinessWeight/totalWeight,
        'tempo': user.attributeWeight.tempoWeight/totalWeight,
        'valence': user.attributeWeight.valenceWeight/totalWeight
    };

    let preferenceData_max = { 'popularity': 100, 'danceability': user.preferenceData.danceabilityRange[1], 'energy':user.preferenceData.energyRange[1], 'speechiness':user.preferenceData.speechinessRange[1], 
'tempo':user.preferenceData.tempoRange[1], 'valence':user.preferenceData.valenceRange[1]};
    let preferenceData_min = { 'popularity': 0, 'danceability': user.preferenceData.danceabilityRange[0], 'energy':user.preferenceData.energyRange[0], 'speechiness':user.preferenceData.speechinessRange[0], 
'tempo':user.preferenceData.tempoRange[0], 'valence':user.preferenceData.valenceRange[0]};

//     let preferenceData_max = { 'popularity': 100, 'danceability': user.preferenceData.danceability+user.preferenceData_variance.danceability, 'energy':user.preferenceData.energy+user.preferenceData_variance.energy, 'speechiness':user.preferenceData.speechiness+user.preferenceData_variance.speechiness, 
// 'tempo':user.preferenceData.tempo+user.preferenceData_variance.tempo, 'valence':user.preferenceData_variance.valence+user.preferenceData_variance.valence};
//     let preferenceData_min = { 'popularity': 0, 'danceability': user.preferenceData.danceability-user.preferenceData_variance.danceability, 'energy':user.preferenceData.energy-user.preferenceData_variance.energy, 'speechiness':user.preferenceData.speechiness-user.preferenceData_variance.speechiness, 
// 'tempo':user.preferenceData.tempo-user.preferenceData_variance.tempo, 'valence':user.preferenceData_variance.valence-user.preferenceData_variance.valence};
    let userdata = new UserData(user.id, preferenceData, preferenceData_max, preferenceData_min, attributeWeight, user.preferenceData_variance);

    console.log("------------------------------------------------");
    console.log("Total Item Data: " + playlist.length + " records");
    console.log("Read Music Data Finished!");
    console.log("------------------------------------------------");

    // Step 1: Find a top recommended item using Spotify API
    // Suppose top recommended item 
    let topRecItem = data.topRecommendedSong


    // Step 2: Produce critiques using Apriori algorithm and select the most favorite critique with higher tradeoff utility

    start = new Date().getTime();
    // control parameter
    let numfCompoundCritiques = [2, 3];
    let supportValue = 0.1;
    // let numOfUtilityCritiques = 3;
    let numOfDiversifiedCritiques = 10; // the number of items that satisfy favorite critique and that will be presented
    // let numOfReturnCritiques = 10;
    // user.preferenceData_variance = preferenceData_variance
    // get favor critique and diversified critique 
    let systemCritiquing = sysCritique(userdata, playlist, topRecItem, nominalAttributes, numericalAttributes, numfCompoundCritiques,
        supportValue, numOfDiversifiedCritiques);

    end = new Date().getTime();
    console.log("------------------------------------------------");
    console.log('-----Execution time: ' + (end - start) + 'ms.');
    console.log("------------------------------------------------");

    console.log("diversify critique: ");
    console.log(systemCritiquing.diversifyCritique);


    return systemCritiquing;
}

router.post("/generateCritiquing", function(req, res) {

    if (req.query.id) {
        // User.findOne({'id': req.query.id}, function (err, user) {
        //     if (err)
        //         res.json(err);

        //     user.attributeWeight.artistWeight = req.body.user.attributeWeight.artistWeight
        //     user.attributeWeight.genreWeight = req.body.user.attributeWeight.genreWeight
        //     user.attributeWeight.languageWeight = req.body.user.attributeWeight.languageWeight
        //     user.attributeWeight.popularityWeight = req.body.user.attributeWeight.popularityWeight
        //     user.attributeWeight.danceabilityWeight = req.body.user.attributeWeight.danceabilityWeight
        //     user.attributeWeight.energyWeight = req.body.user.attributeWeight.energyWeight
        //     user.attributeWeight.speechinessWeight = req.body.user.attributeWeight.speechinessWeight
        //     user.attributeWeight.valenceWeight = req.body.user.attributeWeight.valenceWeight
        //     user.attributeWeight.tempoWeight = req.body.user.attributeWeight.tempoWeight

        //     user.save(function (err) {
        //         if (err)
        //             res.send(err);
        //         console.log(user.id + "'s profile is updated")
        //     })
        // });
        var critique = generateCritiquing(req.body)
        res.json(critique)
    }
});

module.exports = router;