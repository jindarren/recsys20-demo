var express = require('express');
var router = express.Router();
var recom = require('./recommender');
var passport = require('passport');
var SpotifyStrategy = require('../node_modules/passport-spotify/lib/passport-spotify/index').Strategy;
var request = require('request');
var User = require('../public/model/user');
var franc = require('franc-min') //for language detection
var pinyin = require("pinyin");
var genreData = require('../public/js/genre-data');

var avaGenres = genreData

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
        callbackURL: 'http://music-bot.top:3000/callback'
        //callbackURL: 'http://localhost:3000/callback'
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
        if (err){
            console.log({
                action:"addRecord",
                userid: user.id,
                err: err
            })
            res.send(err)
        }
        else{
            res.json({status:"success"})
        }

    })

});

router.get("/findRecord", function(req, res) {
    var id = req.query.id
    User.find({id: id},function (err, data) {
        res.json(data)
    })
});

router.get("/removeRecord", function(req, res) {
    var id = req.query.id
    User.remove({id: id},function (err) {
        if (err) {
            console.log({
                action:"removeRecord",
                userid: id,
                err: err
            })
            res.send(err)
        } else {
            res.json({status:"removed"})
        }
    })
});

router.post("/addError", function(req, res){
  var date = new Date();
  var fs = require('fs');
  var stream = fs.createWriteStream('error.txt', {
  	  flags: 'a',
	  encoding: 'utf8',
  });
  stream.once('open', function(fd) {
    stream.write(JSON.stringify(req.body)+",");
    stream.end();
  });
  res.json(204);
});


router.post("/updateRecord", function(req, res) {
    var updatedData = {}
    var updatedID = req.body.id
    var que1List = req.body.que1
    var que2List = req.body.que2
    var que3List = req.body.que3
    var que1Timestamp = req.body.que1Timestamp
    var taskStartTimestamp = req.body.taskStartTimestamp
    var taskEndTimestamp = req.body.taskEndTimestamp
    var endTimestamp = req.body.endTimestamp
    var codeTimestamp = req.body.codeTimestamp
    var bonusTimestamp = req.body.bonusTimestamp
    var logger = req.body.logger
    var new_pool = req.body.new_pool
    var pool = req.body.pool
    var topRecommendedSong = req.body.topRecommendedSong
    var user = req.body.user
    var completionCode = req.body.completionCode

    if(que1List)
        updatedData.que1 = que1List
    if(que2List)
        updatedData.que2 = que2List
    if(que3List)
        updatedData.que3 = que3List
    if(que1Timestamp)
        updatedData.que1Timestamp = que1Timestamp
    if(taskStartTimestamp)
        updatedData.taskStartTimestamp = taskStartTimestamp
    if(taskEndTimestamp)
        updatedData.taskEndTimestamp = taskEndTimestamp
    if(endTimestamp)
        updatedData.endTimestamp = endTimestamp
    if(codeTimestamp)
        updatedData.codeTimestamp = codeTimestamp
    if(bonusTimestamp)
        updatedData.bonusTimestamp = bonusTimestamp
    if(logger)
        updatedData.logger = logger
    if(new_pool)
        updatedData.new_pool = new_pool
    if(pool)
        updatedData.pool = pool
    if(topRecommendedSong)
        updatedData.topRecommendedSong = topRecommendedSong
    if(user)
        updatedData.user = user
    if(completionCode)
        updatedData.completionCode = completionCode

    User.updateOne({id:updatedID},{$set:updatedData},function(err){
        if (err){
            console.log({
                action:"updateRecord",
                userid: updatedID,
                data: updatedData,
                err: err
            })
            res.send(err)
        }
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
    res.render('index')
})

router.get('/profile', function(req, res) {
    res.render('profile')
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
    res.render("intro-en",{
        token:req.query.token,
        refreshToken:req.query.refreshToken,
        userID:req.query.userID
    })
});

router.get('/consent', function(req, res) {
    res.render("consent")
});

router.get('/quit', function(req, res) {
    res.render("quit")
});

router.get('/success', function(req, res) {
    res.render("success")
});

router.get('/success2', function(req, res) {
    res.render("success2")
});

router.get('/failure', function(req, res) {
    res.render("failure")
});

router.get('/failure2', function(req, res) {
    res.render("failure2")
});

router.get('/failure3', function(req, res) {
    res.render("failure3")
});

router.get('/tip', function(req, res) {
    res.render("tip10")
});


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

router.get('/getAvaGenres', function(req, res) {
    res.json(avaGenres)
})

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

router.get('/getRecomByTracks', function(req, res) {
    var result = {}
    var token = req.query.token
    recom(token).getRecommendationByTrack(req.query.trackSeeds).then(function(data) {
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

var genre_processing = function(genre){
    if(genre.indexOf("pop")>=0)
        genre = "pop"
    else if(genre.indexOf("rock")>=0)
        genre = "rock"
    else if(genre.indexOf("hip hop")>=0)
        genre = "hip-hop"
    else if(genre.indexOf("dance")>=0)
        genre = "dance"
    else if(genre.indexOf("funk")>=0)
        genre = "funk"
    else if(genre.indexOf("classical")>=0)
        genre = "classical"
    else if (genre.indexOf("new age")>=0)
        genre = "new-age"
    return genre
}

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

                    // if(genre.indexOf("pop")>=0)
                    //     genre = "pop"
                    // else if(genre.indexOf("rock")>=0)
                    //     genre = "rock"
                    // else if(genre.indexOf("hip hop")>=0)
                    //     genre = "hip-hop"
                    // else if(genre.indexOf("dance")>=0)
                    //     genre = "dance"
                    // else if(genre.indexOf("funk")>=0)
                    //     genre = "funk"

                    visData[index].genre = genre_processing(genre)

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
    //console.log(req.body)
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
    //console.log(req.body)
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
    //console.log(req.body)
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
    //console.log(req.body)
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
    //console.log(req.body)
    request.post({url:'http://127.0.0.1:5000/trigger_sys_cri',
        json: req.body}, (error, response, body) => {
        if (error) {
            console.error(error)
            return
        }
        res.json(body)
    })
})


router.post('/initiatewithprofile', function(req, res) {
    //pass token to the webAPI used by recommender
    var token = req.body.token;
    var userid = req.body.id;

    var recResult = [];

    var artistNames = req.body.artistNames;
    var requestedArtists = req.body.artists;
    var genres = req.body.genres;
    var requestedTracks = req.body.tracks;
    var trackNames = req.body.trackNames;

    var artistReq = new Promise((resolve, reject) => {

        recom(token).getRecommendationByArtist(requestedArtists.toString()).then(function(data3) {
            var artistText = ""

            for(var item in artistNames){
                artistText += artistNames[item]+", "
            }
            artistText = artistText.substr(0,artistText.length-2)

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

    })

    var trackReq = new Promise((resolve, reject) => {

        recom(token).getRecommendationByTrack(requestedTracks.toString()).then(function(data) {
            var trackText = ""

            for(var item in trackNames){
                trackText += trackNames[item]+", "
            }
            trackText = trackText.substr(0,trackText.length-2)

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

    })

    var genreReq = new Promise((resolve, reject) => {

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

    })

    Promise.all([artistReq, trackReq,genreReq]).then(function(dataList) {
        // console.log(dataList)
        for(var data in dataList ){
            for( var item in dataList[data]){
                if(recResult.indexOf(dataList[data][item])<0)
                    recResult.push(dataList[data][item])
            }
        }

        var user = new User({
            id: userid,
            pool:recResult,
            new_pool:[],
            user: {
                id:userid,
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


router.post('/initiate', function(req, res) {
    //pass token to the webAPI used by recommender
    var token = req.body.token;
    var userid = req.body.id;

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

            recom(token).getRecommendationByArtist(requestedArtists.toString()).then(function(data3) {
            var artistText = ""

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
        recom(token).getTopArtists().then(function(artistData){
            for (var i = 0; i<artistData.length; i++){
                genres = uniqueArr(genres, artistData[i].genres)
            }

            var newGenres = []

            for (var i = 0; i < genres.length; i++) {
                processed_genre = genre_processing(genres[i])
                if(avaGenres[processed_genre] && newGenres.indexOf(processed_genre) === -1)
                    newGenres.push(processed_genre)
            }

            if(newGenres.length>3)
                genres = newGenres.slice(0,3)
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

    Promise.all([artistReq, trackReq,genreReq]).then(function(dataList) {
        // console.log(dataList)
        for(var data in dataList ){
            for( var item in dataList[data]){
                if(recResult.indexOf(dataList[data][item])<0)
                    recResult.push(dataList[data][item])
            }
        }

        // console.log(user.id)
        // console.log(user.user)
        var user = new User({
            id: userid,
            pool:recResult,
            new_pool:[],
            user: {
                id:userid,
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
        // res.cookie('spotify-token', req.authInfo.accessToken, {
        //     maxAge: 7200000
        // });
        //
        // res.cookie('refresh-token', req.authInfo.refreshToken, {
        //     maxAge: 7200000
        // });
        //
        // res.cookie('user-id', req.user.id, {
        //     maxAge: 7200000
        // });
        var accessToken = req.authInfo.accessToken
        var refreshToken = req.authInfo.refreshToken
        var userID = req.user.id


        res.redirect('/intro-en?token='+accessToken+"&refreshToken="+refreshToken+"&userID="+userID);

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
        console.log(body)
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;
        var expires_in = body.expires_in
        res.json({
            "access_token":access_token,
            "refresh_token":refresh_token,
            "expires_in":expires_in
        })
        
    });
});


module.exports = router;