/**
 * Created by jin on 12/11/2016.
 */
var recommender = function (token) {
    var SpotifyWebApi = require('spotify-web-api-node'),
        appKey = 'a1d9f15f6ba54ef5aea0c5c4e19c0d2c',
        appSecret = 'b368bdb3003747ec861e62d3bf381ba0',
        //redirectUrl = 'https://music-bot.top:3000/callback';
        redirectUrl = 'http://localhost:3000/callback';

    var spotifyApi = new SpotifyWebApi({
        clientId: appKey,
        clientSecret: appSecret,
        redirectUri: redirectUrl
    });

    spotifyApi.setAccessToken(token);

    return {

        getAudioFeatures:function(ids) {
            return spotifyApi.getAudioFeaturesForTracks(ids)
                .then(function(data) {
                    return data.body
                }, function(err) {
                    return err
                });
        },

        getGenresForArtists:function(ids) {
            return spotifyApi.getArtists([ids])
                .then(function(data) {
                    return data.body
                }, function(err) {
                    return err
                });
        },


        getFollowedArtists: function (limitNum){
            return spotifyApi.getFollowedArtists({
                type: 'artist',
                limit: limitNum,
            }).then(function (data) {
                return data.body.artists.items
            }, function (err) {
                return err;
            });
        },

        getArtistRelatedArtists: function (id){
            return spotifyApi.getArtistRelatedArtists(id).then(function (data){
                return data.body.artists
            }, function (err) {
                return err
            })
        },

        getTopArtists: function (limitNum) {
            return spotifyApi.getMyTopArtists({
                time_range: 'long_term',
                limit: limitNum,
            }).then(function (data) {
                return data.body.items
            }, function (err) {
                return err;
            });
        },

        getTopTracks: function (limitNum) {
            return spotifyApi.getMyTopTracks({
                time_range: 'long_term',
                limit: limitNum,
            }).then(function (data) {
                return data.body.items
            }, function (err) {
                return err;
            });
        },

        getTopGenres: function () {
            return spotifyApi.getAvailableGenreSeeds()
                .then(function (data) {
                    return data.body.genres
                }, function (err) {
                    return err
                })
        },

        getRecommendationByFollowedArtist: function (artists, country) {
            var promise = []

            for (var index in artists){
                promise[index]=spotifyApi.getArtistTopTracks(artists[index].id, country).then(function(data){
                    return data.body.tracks
                }), function (err) {
                    return err
                }
            }

            return Promise.all(promise).then(function(data){
                var recommendations = []
                for (var index in data){
                    recommendations = recommendations.concat(data[index])
                }
                // console.log(recommendations)
                return recommendations
            })
        },


        getRecommendation: function (artistSeeds, trackSeeds, genreSeeds, 
            min_valence, max_valence,target_valence, 
            min_tempo, target_tempo, max_tempo, 
            min_energy, max_energy,
            min_danceability, max_danceability,
            min_speechiness, max_speechiness,
            min_popularity, max_popularity) {
            var setting = {}
            setting.limit = 50
            if(artistSeeds)
                setting.seed_artists = artistSeeds
            if(trackSeeds)
                setting.seed_tracks = trackSeeds
            if(genreSeeds)
                setting.seed_genres = genreSeeds
            if(min_valence)
                setting.min_valence = min_valence
            if(target_valence)
                setting.target_valence = target_valence
            if(max_valence)
                setting.max_valence = max_valence
            if(min_energy)
                setting.target_energy = min_energy
            if(max_energy)
                setting.target_energy = max_energy
            if(min_danceability)
                setting.min_danceability = min_danceability
            if(max_danceability)
                setting.min_danceability = max_danceability
            if(min_speechiness)
                setting.min_speechiness = min_speechiness
            if(max_speechiness)
                setting.max_speechiness = max_speechiness
            if(min_popularity)
                setting.min_popularity = min_popularity
            if(max_popularity)
                setting.max_popularity = max_popularity
            if(min_tempo)
                setting.min_tempo = min_tempo
            if(max_tempo)
                setting.max_tempo = max_tempo
            if(max_tempo)
                setting.target_tempo = target_tempo

            return spotifyApi.getRecommendations(setting).then(function (data) {
                return data.body.tracks
            }, function (err) {
                return err;
            })
        },


        getRecommendationByArtist: function (seeds,scenario) {
            return spotifyApi.getRecommendations({
                limit: 50,
                seed_artists: seeds,
                seed_genres: scenario
            }).then(function (data) {
                return data.body.tracks
            }, function (err) {
                return err;
            })
        },

        getRecommendationByTrack: function (seeds,scenario) {
            return spotifyApi.getRecommendations({
                limit: 50,
                seed_tracks: seeds,
                seed_genres: scenario
            }).then(function (data) {
                return data.body.tracks
            }, function (err) {
                return err;
            })
        },

        getRecommendationByGenre: function (seeds,scenario) {
            return spotifyApi.getRecommendations({
                limit: 50,
                seed_genres: seeds+','+scenario
            }).then(function (data) {
                return data.body.tracks
            }, function (err) {
                return err;
            })
        },

        getCategories: function () {
            return spotifyApi.getCategories({
                limit: 50
            })
                .then(function(data) {
                    return data.body.categories;
                }, function(err) {
                    return err
                });
        },

        getPlaylistByCategory: function (category) {
            return spotifyApi.getPlaylistsForCategory(category,
                {}
            )
            .then(function(data) {
                return data.body;
            }, function(err) {
                return err
            });

        },

        getPlaylistTracks: function (id) {
            return spotifyApi.getPlaylistTracks(id, {
                fields:"items(track(artists,id,name,popularity,preview_url))"
            })
            .then(
            function(data) {
                return data.body;
            },
            function(err) {
                return err
            });
        },

        getTracks: function (id) {
            return spotifyApi.getTracks(id,{
            })
            .then(
            function(data) {
                return data.body;
            },
            function(err) {
                return err
            });
        },

        searchTrack: function(text){
            return spotifyApi.searchTracks(text)
            .then(function(data) {
                return data.body;
            }, function(err) {
                return err
            });
        },

        searchArtist: function(text){
            return spotifyApi.searchArtists(text)
            .then(function(data) {
                return data.body;
            }, function(err) {
                return err
            });
        },

        searchPlaylist: function(text){
            return spotifyApi.searchPlaylists(text)
            .then(function(data) {
                return data.body;
            }, function(err) {
                return err
            });
        },

        getArtistTopTracks: function(artist, country){
            return spotifyApi.getArtistTopTracks(artist, country)
            .then(function(data){
                return data.body;
            }, function (err) {
                return err
            });
        },

        getPlaylist: function(id){
            return spotifyApi.getPlaylist(id)
            .then(function(data) {
                return data.body;
            }, function(err) {
                return err
            });
        }

    }
};


module.exports = recommender;
