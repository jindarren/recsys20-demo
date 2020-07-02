const socket = io();

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

var spotifyToken = $.cookie('spotify-token')
var refreshToken = $.cookie('refresh-token')


var storage = window.localStorage;

var skipTimes = 0;

var playlist = [];
var numberOfLikedSongs = 0;
var isPreStudy = true
var isSystemCrit = 1;
var listenedSongs = []
var isFinished = false
var topRecommendedSong;
var nextTimes = 0;
var showNextSong, showCurrentSong, showNextSong2, showNextSong3, showCurrentSong2, showFeedback, showTry;

var logger = {};

var usermodel = {}


//preference_oriented
//diversity_oriented
//personality_adjusted
var sysCritVersion = window.location.search.substring(1)

logger.dialog = []
logger.listenedSongs = []
logger.likedSongs = []
logger.dislikedSongs = []
logger.duration = ""
logger.rating = []

logger.exp_energy = []
logger.exp_danceability = []
logger.exp_speechiness = []
logger.exp_tempo = []
logger.exp_valence = []
logger.exp_artist = []
// logger.exp_lang = []
logger.exp_category = []
logger.exp_feature = []

var nextSongUtters = ["Great, here is another song.", "OK, maybe you also like this song.", "Good, please try the next song."],
    rateUtters = ["Please rate your liked song in terms of pleasant surprise.", "Don't forget to rate the song in terms of pleasant surprise.", "You also need to rate the song in terms of pleasant surprise."]


var systemLang = storage.language

if (systemLang == "zh")
    $("#user-id").show()

$(window).off('beforeunload');

$(document).ready(function () {
    setInterval(function () {
        $.ajax("/refresh-token?refresh_token=" + refreshToken, function (data, err) {
            if (err)
                console.log(err)
            else {
                spotifyToken = data.access_token
            }
        })
    }, 3600 * 1000)

    var userID = ""
    // JSON.parse(storage.profile).id


    $(".exp").on("mouseenter", function () {
        var feature = $(this).text()
        if (feature == "Energy:")
            logger.exp_energy.push(new Date().getTime())
        else if (feature == "Danceability:")
            logger.exp_danceability.push(new Date().getTime())
        else if (feature == "Speechiness:")
            logger.exp_speechiness.push(new Date().getTime())
        else if (feature == "Tempo:")
            logger.exp_tempo.push(new Date().getTime())
        else if (feature == "Valence:")
            logger.exp_valence.push(new Date().getTime())
    })


    $("h3").on("click", function () {
        var title = $(this).text()
        if (title == "Explanation of features")
            logger.exp_feature.push(new Date().getTime())
        else if (title == "Explanation of music categories")
            logger.exp_category.push(new Date().getTime())
        else if (title == "Explanation of music language")
            logger.exp_lang.push(new Date().getTime())
        else if (title == "Explanation of artists")
            logger.exp_artist.push(new Date().getTime())
    })

    var windowHeight = $("#container").height() * 0.90;
    $(".iphone-x").height(windowHeight)
    $(".iphone-x").width(windowHeight * 36 / 78)


    $("#accordion").accordion({
        heightStyle: "fill"
    });
    $('[data-toggle="popover"]').popover({trigger: "hover"})


    /******************** music playing function ***********************/

        //alert("Please make sure you have submitted the pre-study questionnaire!")
        //refresh the token
    var userid = $.cookie('user-id')

    function reRankPlaylist(recomList) {
        var newPlayList = []
        for (var item in recomList) {

            if(recomList[item]){
                var songID = recomList[item]

                var filtered = playlist.filter(function (el) {
                    return el.id == songID;
                })[0];
                newPlayList.push(filtered)
                playlist.splice(playlist.indexOf(filtered), 1)
            }
        }
        playlist = newPlayList.concat(playlist)
    }

    function initializeUserModel(user) {

        var profile_py = {}
        profile_py["user_profile"] = {}
        profile_py["user_profile"]["user"] = user

        $.ajax({
            type: "POST",
            url: "/initialize_user_model",
            data: JSON.stringify(profile_py),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                var returned = JSON.parse(result)
                user = returned.user
                usermodel.user = returned.user
                console.log("初始: ", returned)

            },
            error: function (error) {
                console.log(error)
            }
        });

    }


    function updateUserModel(data) {
        var profile_py = {}
        profile_py["user_profile"] = {}
        profile_py["user_profile"]["user"] = data.user
        profile_py["user_profile"]["logger"] = data.logger
        profile_py["user_profile"]["topRecommendedSong"] = data.topRecommendedSong

        return $.ajax({
            type: "POST",
            url: "/update_user_model",
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            data: JSON.stringify(profile_py),
            success: function (result) {
                var returned = JSON.parse(result)
                usermodel.user = returned.user
                console.log("更新: ", returned)
            },
            error: function (error) {
                console.log("error")
            },
        });
    }


    function getRecommendation(data) {

        var profile_py = {}
        profile_py["user_profile"] = {}
        profile_py["user_profile"]["pool"] = data.pool
        profile_py["user_profile"]["new_pool"] = data.new_pool
        profile_py["user_profile"]["user"] = data.user

        return $.ajax({
            type: "POST",
            url: "/get_rec",
            data: JSON.stringify(profile_py),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                var returned = JSON.parse(result)
                playlist = returned.user_profile.pool
                console.log("UC推荐: ", returned)
                if (returned.recommendation_list.length > 0)
                    reRankPlaylist(returned.recommendation_list)
            },
            error: function (error) {
                console.log(error)
            }
        });
    }


    function systemCritiques(data) {

        var profile_py = {}
        profile_py["user_profile"] = {}
        profile_py["user_profile"]["pool"] = data.pool
        profile_py["user_profile"]["new_pool"] = data.new_pool
        profile_py["user_profile"]["user"] = data.user
        profile_py["user_profile"]["topRecommendedSong"] = data.topRecommendedSong
        profile_py["user_profile"]["logger"] = data.logger
        profile_py["sys_crit_version"] = data.sys_crit_version

        console.log(profile_py)

        return $.ajax({
            type: "POST",
            url: "/get_sys_cri",
            data: JSON.stringify(profile_py),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                var returned = JSON.parse(result)
                console.log("SC推荐: ", returned)
                reRankPlaylist(returned.recommendation_list)
                console.log(playlist)
            },
            error: function (error) {
                console.log(error)
            }
        });
    }


    function checkSystemCritiques(data) {

        var profile_py = {}
        profile_py["user_profile"] = {}
        profile_py["user_profile"]["topRecommendedSong"] = data.topRecommendedSong
        profile_py["user_profile"]["logger"] = data.logger

        console.log(profile_py)

        return $.ajax({
            type: "POST",
            url: "/trigger_sys_cri",
            data: JSON.stringify(profile_py),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                var returned = JSON.parse(result)
                console.log("SC推荐判断: ", returned)

            },
            error: function (error) {
                console.log(error)
            }
        });
    }

    console.log(spotifyToken)
    $.ajax({
        url: "/initiate?token=" + spotifyToken + "&id=" + userid,
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (data) {

            usermodel = data
            console.log(usermodel)
            topRecommendedSong = usermodel.pool[0];
            usermodel.topRecommendedSong = topRecommendedSong

            //initialize user model
            initializeUserModel(usermodel.user)

            for (var index = 0; index < data.pool.length; index++) {
                playlist.push(data.pool[index])
            }


            var allGenres = []

            for(var index in playlist){
                allGenres.push(playlist[index].genre)
            }

            var mapGenres = allGenres.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map())
            // 所有次数
            genreTimes = Array.from(mapGenres.values())
            //去重后的值
            distinctGenres = Array.from(mapGenres.keys())

            //小众的genres的数量，已经小众的genres列表
            var fewGenres=[]
            for(var index in genreTimes){
                if(genreTimes[index]<11){
                    fewGenres.push(distinctGenres[index])
                }
            }
            //
            for(var index in playlist) {
                for (var index2 in fewGenres) {
                    if (playlist[index].genre == fewGenres[index2]) {
                        playlist[index].realgenre = fewGenres[index2]
                        playlist[index].genre = "niche"
                    }
                }
            }


            var copyPlaylist = data.pool.concat()

            var danceabilityList = [],
                energyList = [],
                popularityList = [],
                speechinessList = [],
                tempoList = [],
                valenceList = [];

            for (var index = 0; index < copyPlaylist.length - 1; index++) {
                danceabilityList.push(copyPlaylist[index].danceability)
                energyList.push(copyPlaylist[index].energy)
                popularityList.push(copyPlaylist[index].popularity)
                speechinessList.push(copyPlaylist[index].speechiness)
                tempoList.push(copyPlaylist[index].tempo)
                valenceList.push(copyPlaylist[index].valence)
            }

            var featureList = [
                {
                    name: "danceability",
                    value: danceabilityList
                },
                {
                    name: "energy",
                    value: energyList
                },
                {
                    name: "popularity",
                    value: popularityList
                },
                {
                    name: "speechiness",
                    value: speechinessList
                },
                {
                    name: "tempo",
                    value: tempoList
                },
                {
                    name: "valence",
                    value: valenceList
                }]

            data.user.preferenceData_variance = {};

            var sum = function (x, y) {
                return x + y;
            };
            var square = function (x) {
                return x * x;
            };

            for (var index in featureList) {
                var featureData = featureList[index].value
                var mean = featureData.reduce(sum) / featureData.length;
                var deviations = featureData.map(function (x) {
                    return x - mean;
                });
                data.user.preferenceData_variance[featureList[index].name] = Math.sqrt(deviations.map(square).reduce(sum) / (featureData.length - 1));
            }

            $(".loading").hide()
            $(".window, #message").show()

            var seed_artists = data.user.preferenceData.artist[0]
            var seed_tracks = data.user.preferenceData.track[0]
            var seed_genres = data.user.preferenceData.genre[0]


            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            var songIndex = 0;
            var timeoutResumeInfinity;
            // var critiques = [],
            //     critiquesIndex = 0;
            var needReply = false;

            /******************** music chat function ***********************/

                // chat aliases
            var you = 'you';
            var robot = 'robot';
            var crit = 'crit';
            var skip = 'skip';
            var round = 0;

            // initialize
            // var bot = new chatBot();
            var chat = $('.chat');


            $("#start-task").on("click", function () {
                // synth.cancel()
                $("input#message").attr("disabled", true)
                $("input#message").attr("placeholder", "Please wait for a moment :)")

                clearTimeout(showTry)
                clearTimeout(showFeedback)
                clearTimeout(showNextSong)
                clearTimeout(showCurrentSong)
                clearTimeout(showCurrentSong2)
                clearTimeout(showNextSong2)
                clearTimeout(showNextSong3)
                logger = {}
                logger.rating = []
                logger.task1 = new Date().getTime()
                logger.dialog = []

                logger.listenedSongs = []
                logger.likedSongs = []
                logger.dislikedSongs = []
                logger.duration = ""


                logger.exp_energy = []
                logger.exp_danceability = []
                logger.exp_speechiness = []
                logger.exp_tempo = []
                logger.exp_valence = []
                logger.exp_artist = []
                logger.exp_category = []
                logger.exp_feature = []

                playlist = []
                songIndex = 0

                isFinished = false
                isPreStudy = false

                //clear the chat content for new scenario
                $(".chat").empty()


                //clear the chat content for new scenario
                listenedSongs = []
                numberOfLikedSongs = 0
                $(".list-group").empty()

                //是否开启系统critique
                isSystemCrit = 1

                $("#start-task").hide()
                $("#likedsongs").show()

                $(".list-group-item").hide()

                // initial chat state
                updateChat(robot, 'Hi there. Now you need to create a playlist that contains 5 good songs.', "Initialize");
                setTimeout(function () {
                    updateChat(robot, "I have found some songs for you based on your preference, but you can also search for other songs by using the tips shown on the right side.", "Initialize")
                    var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                    chat.append(line);
                }, 2000)

                $.ajax({
                    url: "/initiate?token=" + spotifyToken + "&id=" + userid,
                    type: "POST",
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    success: function (data2) {

                        usermodel = data2
                        console.log(usermodel)
                        topRecommendedSong = usermodel.pool[0];
                        usermodel.topRecommendedSong = topRecommendedSong

                        //initialize user model
                        initializeUserModel(usermodel.user)

                        for (var index = 0; index < data2.pool.length; index++) {
                            playlist.push(data2.pool[index])
                        }

                        copyPlaylist = data2.pool.concat()


                        setTimeout(function () {
                            $('.spinner').remove();
                            $("input#message").attr("disabled", false)
                            $("input#message").attr("placeholder", "Chat with me :)")

                            if (listenedSongs.indexOf(playlist[songIndex]) < 0) {
                                listenedSongs.push(playlist[songIndex])
                                setTimeout(function () {

                                    explaination = "We recommend this song because you like "

                                    if (playlist[songIndex].seedType == "artist")
                                        explaination += playlist[songIndex].seed + "'s songs."
                                    else if (playlist[songIndex].seedType == "track")
                                        explaination += "the songs " + playlist[songIndex].seed + "."
                                    else if (playlist[songIndex].seedType == "genre")
                                        explaination += "the songs of " + playlist[songIndex].seed + "."

                                    if (explaination != "")
                                        updateChat(robot, explaination, "Explain")
                                }, 1000)

                                setTimeout(function () {
                                    showMusic(playlist[songIndex].id)
                                }, 3000)

                            } else {
                                showMusic(playlist[songIndex].id)
                            }
                        }, 5000)
                    }
                })

            })

            var critiques = [];
            var critiquesIndex = 0;

            function getSysCrit() {
                var dialogNum = logger.dialog.length
                var dialog = logger.dialog[dialogNum - 1]

                var updateData = {}
                updateData.user = usermodel.user
                updateData.pool = playlist
                updateData.new_pool = []
                updateData.logger = logger
                updateData.sys_crit_version = sysCritVersion

                updateData.logger.latest_dialog = [dialog]
                updateData.logger.listenedSongs = logger.listenedSongs
                var listenedSongsLength = logger.listenedSongs.length
                updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                console.log(updateData)

                systemCritiques(updateData).then(function (rawCrits) {
                    critiques = [];
                    critiquesIndex = 0;

                    var crits = JSON.parse(rawCrits)

                    console.log(crits)

                    var firstThreeCrits = crits.sys_crit_with_recommendation.slice(0, 3)

                    console.log(firstThreeCrits)

                    for (var crt in firstThreeCrits) {

                        //var wording = "Do you like the songs of ";
                        var songType = "",
                            features = "";
                        var actionSet = {},
                            action = [];

                        var returnedCritiques = firstThreeCrits[crt].critique

                        for (var index in returnedCritiques) {

                            if (returnedCritiques[index].split("|")[0] == "language") {
                                var actionItem = {}
                                actionItem.prop = "language"
                                actionItem.val = returnedCritiques[index].split("|")[1]
                                actionItem.type = "equal"
                                action.push(actionItem)
                                songType += actionItem.val + " "

                            } else if (returnedCritiques[index].split("|")[0] == "genre") {
                                var actionItem = {}
                                actionItem.prop = "genre"
                                actionItem.val = returnedCritiques[index].split("|")[1]
                                actionItem.type = "equal"
                                action.push(actionItem)
                                songType += actionItem.val + " "

                            } else if (returnedCritiques[index].split("|")[0] == "artist") {
                                var actionItem = {}
                                actionItem.prop = "artist"
                                actionItem.val = returnedCritiques[index].split("|")[1]
                                actionItem.type = "equal"
                                action.push(actionItem)
                                songType += action.artist + " "

                            } else if (returnedCritiques[index].split("|")[1] == "lower") {
                                var actionItem = {}
                                actionItem.prop = returnedCritiques[index].split("|")[0]
                                // actionItem.val = -0.1
                                actionItem.type = "lower"
                                action.push(actionItem)
                                features += "lower " + returnedCritiques[index].split("|")[0] + ", "
                            } else if (returnedCritiques[index].split("|")[1] == "higher") {
                                var actionItem = {}
                                actionItem.prop = returnedCritiques[index].split("|")[0]
                                // actionItem.val = 0.1
                                actionItem.type = "higher"
                                action.push(actionItem)
                                features += "higher " + returnedCritiques[index].split("|")[0] + ", "
                            } else if (returnedCritiques[index].split("|")[1] == "similar") {
                                var actionItem = {}
                                actionItem.prop = returnedCritiques[index].split("|")[0]
                                // actionItem.val = 0.1
                                actionItem.type = "similar"
                                action.push(actionItem)
                                features += "similar " + returnedCritiques[index].split("|")[0] + ", "
                            }
                        }

                        var emphText=""
                        if (songType && !features) {
                            emphText = songType
                        }
                        else if (!songType && features) {
                            emphText = features.substr(0, features.length - 2)
                        }
                        else if (songType && features) {
                            emphText = songType + "and with " + features.substr(0, features.length - 2)
                        }

                        actionSet.speech = emphText


                        actionSet.action = action
                        actionSet.recommendation = firstThreeCrits[crt].recommendation
                        actionSet.critiques = returnedCritiques
                        console.log(actionSet)

                        critiques.push(actionSet)

                    }

                    console.log(critiques)

                    $('.spinner').remove();
                    // [Wanling] - revise
                    updateChat(crit, critiques[critiquesIndex].speech, "System_Suggest", critiques[critiquesIndex].critiques, true);
                    reRankPlaylist(critiques[critiquesIndex].recommendation)

                })

            }

            // add a new line to the chat
            // [Wanling] - revise
            var dialog = {} // [Wanling]
            var updateChat = function (party, text, action, modality, crit_related = false ) {
                
                dialog.agent = party
                dialog.text = text
                dialog.action = action
                if (party == you)
                    dialog.modality = modality

                if (crit_related == true) {
                    var critList = critiques[critiquesIndex].critiques
                    var critiqueList = []

                    for (var index in critList) {
                        var critiqueContent = {}
                        critiqueContent[critList[index].split("|")[0]] = critList[index].split("|")[1]
                        critiqueList.push(critiqueContent)
                    }
                    dialog.critique = critiqueList
                    dialog.critiqued_song = playlist[songIndex].id
                }

                dialog.timestamp = new Date().getTime()
                var cloneDialog = JSON.parse(JSON.stringify(dialog))
                logger.dialog.push(cloneDialog)

                const utterance = new SpeechSynthesisUtterance();

                round++;

                // [Wanling] ?
                var style = 'you';
                if (party == you) {
                    $('#message').val('');
                    style = 'you';
                    var line = $('<div class="speak"><p class="dialog"></p></div>');
                    line.addClass(style)
                    line.find('.dialog').text(text);

                }
                else if (party == robot) {
                    style = 'robot';
                    var line = $('<div class="speak"><p class="dialog"></p></div>');
                    line.addClass(style)
                    line.find('.dialog').text(text);

                }
                else if (party == crit) {
                    style = 'robot';
                    var line = $('<div id="round' + round + '" class="speak"><p class="dialog"><span>Do you like the song of </span><span class="emph-dialog" style="font-weight: bold"></span><span>?</span></p><button type="button" id="yes" class="feedback">Yes</button><button type="button" id="no" class="feedback">No</button></div>');
                    line.addClass(style)
                    line.find('.emph-dialog').text(text);
                    utterance.text = text;
                }
                else if (party == skip) {
                    style = 'robot';
                    var line = $('<div id="round' + round + '" class="speak"><p class="dialog"></p></div>');
                    line.addClass(style)
                    line.find('.dialog').text(text);

                    line.append('<div class="feedback-box"><button type="button" id="suggest" class="feedback">Let bot suggest</button></div>')

                    utterance.text = text;
                    chat.append(line);

                    $("#round" + round + " .feedback").click(function () {
                        nextTimes = 0
                        $("#round" + round + " .feedback").fadeOut()
                        updateChat(you, "I need some suggestions.", "Let_bot_suggest", "btn")
                        var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                        chat.append(line);

                        getSysCrit()

                    })
                }

                chat.append(line);
                chat.stop().animate({
                    scrollTop: chat.prop("scrollHeight")
                });

                $("#round" + round + " #yes").click(function () {
                    $("#round" + round + " button").fadeOut()
                    // [Wanling] - revise

                    updateChat(you, "Yes, please!", "Accept_Suggestion", "btn", true)
                    // add critique when the user accepts a suggestion
                    // dialog.critique = critiques[critiquesIndex].critique

                    //perform update model request
                    var updateData = {}
                    updateData.user = usermodel.user
                    updateData.logger = {}
                    updateData.logger.latest_dialog = [dialog]
                    updateData.logger.listenedSongs = logger.listenedSongs

                    var listenedSongsLength = logger.listenedSongs.length
                    updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                    console.log(updateData)
                    updateUserModel(updateData)

                    reRankPlaylist(critiques[critiquesIndex].recommendation)
                    showMusic(playlist[songIndex].id)

                })

                $("#round" + round + " #no").click(function () {
                    $("#round" + round + " button").fadeOut()
                    // [Wanling] - revise
                    updateChat(you, "I don't want.", "Reject_Suggestion", "btn", true)

                    //perform update model request
                    var updateData = {}
                    updateData.user = usermodel.user
                    updateData.logger = {}
                    updateData.logger.latest_dialog = [dialog]
                    updateData.logger.listenedSongs = logger.listenedSongs

                    var listenedSongsLength = logger.listenedSongs.length
                    updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                    console.log(updateData)
                    updateUserModel(updateData)


                    if (critiquesIndex < critiques.length - 1) {
                        needReply = true;
                        critiquesIndex++;
                        console.log(critiques[critiquesIndex].critiques)
                        // [Wanling] - revise
                        updateChat(crit, critiques[critiquesIndex].speech, "System_Suggest",critiques[critiquesIndex].critiques, true);


                    } else if (critiquesIndex == critiques.length - 1) {
                        critiquesIndex = 0
                        updateChat(robot, "Sorry, I have no any other suggestions:(", "Respond_NoSuggestion");
                        showMusic(playlist[songIndex].id)
                    }
                })
            }

            var countGenreItems = function (genreName){
                var countNum = 0
                for (var index in playlist){
                    if (playlist[index].genre==genreName)
                        countNum++
                }
                return countNum
            }

            var showMusic = function (id) {

                var dialog = {}
                dialog.agent = "robot"
                dialog.text = id
                dialog.action = "Recommend"
                dialog.timestamp = new Date().getTime()
                logger.dialog.push(dialog)
                logger.listenedSongs.push(playlist[songIndex])

                showCurrentSong = setTimeout(function () {
                    console.log(numberOfLikedSongs)


                    // if (isSystemCrit == 1) {
                        var line = $('<div id="speak' + id + '" class="speak"><iframe src="https://open.spotify.com/embed/track/' + id + '" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>')
                        showFeedback = setTimeout(function () {
                            $("#speak" + id).append('<div class="feedback-box"><button type="button" id="like" class="feedback">Like</button><button type="button" id="next" class="feedback">Next</button><button type="button" id="suggest" class="feedback">Let bot suggest</button></div>')

                            $("#speak" + id + " #like").click(function () {

                                updateChat(you, "I like this song.", "Accept_Song", "btn")

                                $("input#message").attr("disabled", true)
                                $("input#message").attr("placeholder", "Please rate your liked song.")

                                var rateWording = rateUtters[parseInt((rateUtters.length * Math.random()))]
                                setTimeout(function () {
                                    updateChat(robot, rateWording, "Request_Rate")
                                }, 50)
                                nextTimes = 0

                                // numberOfLikedSongs = logger.likedSongs.length
                                if (!isFinished) {
                                    $("#speak" + id + " .feedback-box").fadeOut()

                                    if (numberOfLikedSongs <= 5) {
                                        if (data.user.preferenceData.track.length < 5)
                                            data.user.preferenceData.track.push(playlist[songIndex].id)
                                        else
                                            data.user.preferenceData.track[5] = playlist[songIndex].id

                                        $(".list-group").append("<li class='list-group-item' id='" + logger.listenedSongs.slice(-1)[0].id + "'>" + logger.listenedSongs.slice(-1)[0].name + "&nbsp;&nbsp;<i class='fa fa-close'></i><input type='number' class='rating' data-size='xs'></li>")
                                        $("#" + logger.listenedSongs.slice(-1)[0].id + " .rating").rating({min: 1, max: 5, step: 1});
                                        $("#" + logger.listenedSongs.slice(-1)[0].id + " .rating").on('rating:change', function (event, value, caption) {

                                            logger.likedSongs.push(playlist[songIndex].id)

                                            //perform update model request

                                            var dialogNum = logger.dialog.length
                                            var dialog = logger.dialog[dialogNum - 1]


                                            var updateData = {}
                                            updateData.user = usermodel.user
                                            updateData.logger = {}
                                            updateData.logger.latest_dialog = [dialog]
                                            updateData.logger.listenedSongs = logger.listenedSongs
                                            updateData.logger.likedSongs = logger.likedSongs
                                            var listenedSongsLength = logger.listenedSongs.length
                                            updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                                            console.log(updateData)
                                            updateUserModel(updateData)

                                            $("#" + logger.listenedSongs.slice(-1)[0].id + " .rating").rating('refresh', {
                                                disabled: true,
                                                showClear: false,
                                                showCaption: true
                                            });
                                            $("#" + logger.listenedSongs.slice(-1)[0].id + "> .fa-close").hide()
                                            if (numberOfLikedSongs < 5) {
                                                $("input#message").attr("disabled", false)
                                                $("input#message").attr("placeholder", "")
                                                numberOfLikedSongs++

                                                //Exploration for niche genre music
                                                var likedSongGenre = topRecommendedSong.genre
                                                var likedSongArtist = topRecommendedSong.artist

                                                if(likedSongGenre=="niche" && countGenreItems(topRecommendedSong.realgenre)<11){

                                                    var requestLink, explanation;
                                                    if(topRecommendedSong.realgenre!="niche"){
                                                        requestLink = '/searchPlaylist?q=' + topRecommendedSong.realgenre + "&token=" + spotifyToken;
                                                        explanation = "OK, I recommend this song to you, because you like the songs of " + topRecommendedSong.realgenre + "."
                                                    }else{
                                                        requestLink = '/searchArtist?q=' + likedSongArtist + '&token=' + spotifyToken;
                                                        explanation = "OK, I recommend this song to you, because you like " + likedSongArtist + "'s songs."
                                                    }
                                                    playRequestLink(requestLink,explanation,false)

                                                }else{

                                                    //Check if SC should be triggered
                                                    var updateData2 = {}
                                                    updateData2.logger = logger
                                                    var listenedSongsLength = logger.listenedSongs.length
                                                    updateData2.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                                                    checkSystemCritiques(updateData2).then(function (returnedData) {
                                                        var enableSC = JSON.parse(returnedData).triggerSC

                                                        if(enableSC){
                                                            var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                                                            chat.append(line);
                                                            getSysCrit()

                                                        }else{

                                                            updateChat(robot, nextSongUtters[parseInt((nextSongUtters.length * Math.random()))], "Coherence")

                                                            showNextSong = setTimeout(function () {
                                                                $("#speak" + id + " div").fadeOut();
                                                                if (listenedSongs.indexOf(playlist[songIndex]) < 0) {
                                                                    listenedSongs.push(playlist[songIndex])
                                                                    showNextSong3 = setTimeout(function () {
                                                                        showMusic(playlist[songIndex].id)
                                                                    }, 1000)

                                                                } else {
                                                                    showMusic(playlist[songIndex].id)
                                                                }
                                                            }, 10)
                                                        }
                                                    })
                                                }
                                            }

                                            if (numberOfLikedSongs == 5 && !isPreStudy) {
                                                isFinished = true

                                                logger.task1 = new Date().getTime() - logger.task1
                                                logger.listenedSongs = listenedSongs.concat()
                                                logger.rating = []
                                                $("li.list-group-item").each(function (i) {
                                                    var rating = {}
                                                    rating.id = $(this).attr("id")
                                                    rating.value = $(this).find(".rating-stars").attr("title")
                                                    logger.rating.push(rating)
                                                })

                                                data.logger = logger
                                                console.log("上传日志: ", data)
                                                window.localStorage.setItem("log",JSON.stringify(data))


                                                window.location.href = "/que2"

                                            } else if (numberOfLikedSongs == 5 && isPreStudy) {
                                                updateChat(robot, "Now, you should be familiar with the system. You can click the 'start study' button to start.", "Initialize")
                                                $("input#message").attr("disabled", true)
                                                $("input#message").attr("placeholder", "Please click the 'start study' button to start!")
                                            }
                                        });

                                        // remove a liked song
                                        $("#" + logger.listenedSongs.slice(-1)[0].id + "> .fa-close").click(function () {
                                            $(this).parent().remove()
                                            $("input#message").attr("disabled", false)
                                            $("input#message").attr("placeholder", "")
                                            showMusic(playlist[songIndex].id)
                                        })
                                    }
                                }
                            })

                            $("#speak" + id + " #next").click(function () {
                                nextTimes++;
                                //if (nextTimes < 3) {
                                $("#speak" + id + " .feedback-box").fadeOut()
                                updateChat(you, "Next song.", "Next", "btn")
                                logger.dislikedSongs.push(playlist[songIndex].id)

                                //Check if SC should be triggered
                                var updateData = {}
                                updateData.logger = logger
                                var listenedSongsLength = logger.listenedSongs.length
                                updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                                checkSystemCritiques(updateData).then(function (returnedData) {
                                    var enableSC = JSON.parse(returnedData).triggerSC

                                    if(enableSC){
                                        var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                                        chat.append(line);
                                        getSysCrit()

                                    }else{

                                        showNextSong2 = setTimeout(function () {
                                            $("#speak" + id + " div").fadeOut();
                                            if (listenedSongs.indexOf(playlist[songIndex]) < 0) {
                                                listenedSongs.push(playlist[songIndex])

                                                setTimeout(function () {
                                                    showMusic(playlist[songIndex].id)
                                                }, 1000)

                                            } else {
                                                showMusic(playlist[songIndex].id)
                                            }
                                        }, 10)

                                    }

                                })

                                //}
                                // else {
                                //     $("#speak" + id + " .feedback-box").fadeOut()
                                //     updateChat(you, "Next song.", "Next", "btn")
                                //     logger.dislikedSongs.push(playlist[songIndex].id)
                                //     setTimeout(function () {
                                //         $("#speak" + id + " div").fadeOut();
                                //         updateChat(skip, 'Since you have skipped many songs, you can click the "Let bot suggest" button to get suggestions, or you can just tell me what kind of music you want to listen to?', "Request_Critique");
                                //     }, 300)
                                // }

                            })

                            $("#speak" + id + " #suggest").click(function () {

                                nextTimes = 0
                                $("#speak" + id + " .feedback-box").fadeOut()
                                updateChat(you, "I need some suggestions.", "Let_bot_suggest", "btn")
                                $("#speak" + id + " div").fadeOut();
                                var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                                chat.append(line);

                                getSysCrit()
                            })
                            chat.stop().animate({
                                scrollTop: chat.prop("scrollHeight")
                            });

                        }, 3000)
                    //}
                    // else {
                    //     var line = $('<div id="speak' + id + '" class="speak"><iframe src="https://open.spotify.com/embed/track/' + id + '" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe></div>')
                    //     showFeedback = setTimeout(function () {
                    //         $("#speak" + id).append('<div class="feedback-box"><button type="button" id="like" class="feedback">Like</button><button type="button" id="next" class="feedback">Next</button></div>')
                    //
                    //         $("#speak" + id + " #like").click(function () {
                    //
                    //             updateChat(you, "I like this song.", "Accept_Song", "btn")
                    //
                    //             $("input#message").attr("disabled", true)
                    //             $("input#message").attr("placeholder", "Please rate your liked song.")
                    //
                    //             setTimeout(function () {
                    //                 var rateWording = rateUtters[parseInt((rateUtters.length * Math.random()))]
                    //                 updateChat(robot, rateWording, "Request_Rate")
                    //             }, 50)
                    //
                    //             nextTimes = 0
                    //
                    //             if (!isFinished) {
                    //                 $("#speak" + id + " .feedback-box").fadeOut()
                    //
                    //                 if (numberOfLikedSongs < 5) {
                    //                     // console.log(data.user.preferenceData.track)
                    //                     if (data.user.preferenceData.track.length < 5)
                    //                         data.user.preferenceData.track.push(playlist[songIndex].id)
                    //                     else
                    //                         data.user.preferenceData.track[5] = playlist[songIndex].id
                    //
                    //                     $(".list-group").append("<li class='list-group-item' id='" + playlist[songIndex].id + "'>" + playlist[songIndex].name + "&nbsp;&nbsp;<i class='fa fa-close'></i><input type='number' class='rating' data-size='xs'></li>")
                    //                     $("#" + playlist[songIndex].id + " .rating").rating({min: 1, max: 5, step: 1});
                    //                     $("#" + playlist[songIndex].id + " .rating").on('rating:change', function (event, value, caption) {
                    //
                    //
                    //                         //perform update model request
                    //
                    //                         var dialogNum = logger.dialog.length
                    //                         var dialog = logger.dialog[dialogNum - 1]
                    //
                    //
                    //                         var updateData = {}
                    //                         updateData.user = usermodel.user
                    //                         updateData.logger = {}
                    //                         updateData.logger.latest_dialog = [dialog]
                    //                         updateData.logger.listenedSongs = logger.listenedSongs
                    //                         updateData.logger.likedSongs = logger.likedSongs
                    //                         var listenedSongsLength = logger.listenedSongs.length
                    //                         updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]
                    //
                    //                         console.log(updateData)
                    //                         updateUserModel(updateData)
                    //
                    //
                    //                         $("#" + playlist[songIndex].id + " .rating").rating('refresh', {
                    //                             disabled: true,
                    //                             showClear: false,
                    //                             showCaption: true
                    //                         });
                    //                         $("#" + playlist[songIndex].id + "> .fa-close").hide()
                    //
                    //                         if (numberOfLikedSongs < 5) {
                    //                             numberOfLikedSongs++
                    //
                    //                             $("input#message").attr("disabled", false)
                    //                             $("input#message").attr("placeholder", "")
                    //
                    //                             var likedSongGenre = topRecommendedSong.genre
                    //                             var likedSongArtist = topRecommendedSong.artist
                    //                             if(likedSongGenre=="niche"){
                    //                                 var requestLink, explanation;
                    //                                 if(topRecommendedSong.realgenre!="niche" && countGenreItems(topRecommendedSong.realgenre)<11){
                    //                                     requestLink = '/searchPlaylist?q=' + topRecommendedSong.realgenre + "&token=" + spotifyToken;
                    //                                     explanation = "OK, I recommend this song to you, because you like the songs of " + topRecommendedSong.realgenre + "."
                    //                                 }else{
                    //                                     requestLink = '/searchArtist?q=' + likedSongArtist + '&token=' + spotifyToken;
                    //                                     explanation = "OK, I recommend this song to you, because you like " + likedSongArtist + "'s songs."
                    //                                 }
                    //                                 playRequestLink(requestLink,explanation,false)
                    //                             }else{
                    //
                    //                                 updateChat(robot, nextSongUtters[parseInt((nextSongUtters.length * Math.random()))], "Coherence")
                    //                                 showNextSong = setTimeout(function () {
                    //                                     $("#speak" + id + " div").fadeOut();
                    //
                    //                                     if (listenedSongs.indexOf(playlist[songIndex]) < 0) {
                    //                                         listenedSongs.push(playlist[songIndex])
                    //
                    //                                         showNextSong3 = setTimeout(function () {
                    //                                             showMusic(playlist[songIndex].id)
                    //                                         }, 1000)
                    //
                    //                                     } else {
                    //                                         showMusic(playlist[songIndex].id)
                    //                                     }
                    //
                    //                                 }, 10)
                    //
                    //                             }
                    //
                    //                         }
                    //
                    //                         if (numberOfLikedSongs == 5 && !isPreStudy) {
                    //
                    //                             logger.task1 = new Date().getTime() - logger.task1
                    //                             logger.listenedSongs = listenedSongs.concat()
                    //                             logger.rating = []
                    //                             $("li.list-group-item").each(function (i) {
                    //                                 var rating = {}
                    //                                 rating.id = $(this).attr("id")
                    //                                 rating.value = $(this).find(".rating-stars").attr("title")
                    //                                 logger.rating.push(rating)
                    //                             })
                    //
                    //                             data.logger = logger
                    //                             console.log("上传日志: ", data)
                    //                             window.localStorage.setItem("log",JSON.stringify(data))
                    //
                    //
                    //                             window.location.href = "/que2"
                    //
                    //                         } else if (numberOfLikedSongs == 5 && isPreStudy) {
                    //                             updateChat(robot, "Now, you should be familiar with the system. You click the 'start study' button to start.", "Initialize")
                    //                             $("input#message").attr("disabled", true)
                    //                             $("input#message").attr("placeholder", "Please click the 'start study' button to start!")
                    //                         }
                    //                     });
                    //                     // remove a liked song
                    //                     $("#" + playlist[songIndex].id + "> .fa-close").click(function () {
                    //                         $(this).parent().remove()
                    //                         $("input#message").attr("disabled", false)
                    //                         $("input#message").attr("placeholder", "")
                    //                         showMusic(playlist[songIndex].id)
                    //                     })
                    //                 }
                    //             }
                    //         })
                    //
                    //         $("#speak" + id + " #next").click(function () {
                    //             nextTimes++
                    //             if (nextTimes < 3) {
                    //                 $("#speak" + id + " .feedback-box").fadeOut()
                    //                 updateChat(you, "Next song.", "Next", "btn")
                    //                 logger.dislikedSongs.push(playlist[songIndex].id)
                    //
                    //                 setTimeout(function () {
                    //                     $("#speak" + id + " div").fadeOut();
                    //                     if (listenedSongs.indexOf(playlist[songIndex]) < 0) {
                    //                         listenedSongs.push(playlist[songIndex])
                    //
                    //                         setTimeout(function () {
                    //                             showMusic(playlist[songIndex].id)
                    //                         }, 1000)
                    //
                    //                     } else {
                    //                         showMusic(playlist[songIndex].id)
                    //                     }
                    //                 }, 300)
                    //             } else {
                    //                 $("#speak" + id + " .feedback-box").fadeOut()
                    //                 updateChat(you, "Next song.", "Next", "btn")
                    //                 logger.dislikedSongs.push(playlist[songIndex].id)
                    //                 setTimeout(function () {
                    //                     $("#speak" + id + " div").fadeOut();
                    //                     updateChat(robot, 'Since you have skipped many songs, can you tell me what kind of music you want to listen to?', "Request_Critique");
                    //                 }, 300)
                    //             }
                    //         })
                    //
                    //         chat.stop().animate({
                    //             scrollTop: chat.prop("scrollHeight")
                    //         });
                    //
                    //     }, 3000)
                    // }

                    line.addClass("other")
                    chat.append(line);
                    chat.stop().animate({
                        scrollTop: chat.prop("scrollHeight")
                    });

                }, 1000)

                topRecommendedSong = playlist[0]
                playlist.splice(songIndex, 1)
            }


            if (isPreStudy) {
                //Initializae
                updateChat(robot, 'Hello. Welcome to play music bot! To warm up for study, you can read some tips on right side and try to talk with bot for good music.', "Initialize");
                showTry = setTimeout(function () {
                    updateChat(robot, "Once you are ready for the study, you can click the 'Start study' button on the left side. You can rate a recommended song after listening to it for a while.", "Initialize")
                    showMusic(playlist[songIndex].id)
                }, 3000)
            }

            $('input#message').bind('keypress', function (event) {
                var text = document.querySelector('input#message').value
                if (event.keyCode == "13") {

                    if (text != "") {
                        //synth.cancel()
                        $(".feedback").remove()
                        clearTimeout(showFeedback)
                        clearTimeout(showNextSong)
                        clearTimeout(showCurrentSong)
                        clearTimeout(showCurrentSong2)
                        clearTimeout(showNextSong2)
                        clearTimeout(showNextSong3)
                        nextTimes = 0
                        socket.emit('chat message', text);
                        updateChat(you, text, "User_Critique", "typing");

                        if (text.indexOf("next") > -1) {
                            showMusic(playlist[songIndex].id)
                        }
                    }
                }
            })

            recognition.addEventListener('speechstart', () => {
                console.log('Speech has been detected.');
            });

            recognition.addEventListener('result', (e) => {
                console.log('Result has been detected.');
                let last = e.results.length - 1;
                let text = e.results[last][0].transcript;

                if (text != "") {
                    //synth.cancel()
                    $(".feedback").remove()
                    clearTimeout(showFeedback)
                    clearTimeout(showNextSong)
                    clearTimeout(showCurrentSong)
                    clearTimeout(showCurrentSong2)
                    clearTimeout(showNextSong2)
                    clearTimeout(showNextSong3)
                    nextTimes = 0
                    //updateChat(you, text, "voice", "Respond_Unknown", [], {});
                    console.log('Confidence: ' + e.results[0][0].confidence);
                    socket.emit('chat message', text);
                }
            });

            recognition.addEventListener('speechend', () => {
                recognition.stop();
                $('.fa-microphone').show()
                $('.boxContainer').hide()
            });

            recognition.addEventListener('error', (e) => {
                //updateChat(robot, 'Sorry, we find an error during voice recognition.', "text", "Respond_Unknown", [], {});
            });

            function updateAndGetRec(critique) {
                return new Promise(function (resolve, reject) {

                    var dialogNum = logger.dialog.length
                    var dialog = logger.dialog[dialogNum - 1]

                    dialog.critique = critique
                    dialog.critiqued_song = topRecommendedSong.id

                    //perform update model request
                    var updateData = {}
                    updateData.user = usermodel.user
                    updateData.logger = {}
                    updateData.logger.latest_dialog = [dialog]
                    updateData.logger.listenedSongs = logger.listenedSongs

                    var listenedSongsLength = logger.listenedSongs.length
                    updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                    console.log(updateData)

                    updateUserModel(updateData).done(function () {
                        //Get recommendation
                        var updateData2 = {}
                        updateData2.user = usermodel.user
                        updateData2.pool = playlist
                        updateData2.new_pool = []

                        getRecommendation(updateData2).then(function (data) {
                            var returnData = JSON.parse(data)
                            console.log(returnData)
                            reRankPlaylist(returnData.recommendation_list)
                            resolve(returnData.recommendation_list.length)
                        })
                    })
                });
            }


            var numberOfMiss = 0;

            function playRequestLink(requestLink,response,isMissed) {
                if (requestLink) {
                    //show loading animation
                    var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                    chat.append(line);
                    $.get(requestLink, function (res) {
                        //remove loading animation
                        $('.spinner').remove();
                        console.log(res)

                        var updateData = {}
                        updateData.user = usermodel.user
                        updateData.pool = playlist
                        updateData.new_pool = res.tracks

                        console.log(updateData)

                        getRecommendation(updateData).then(function (data) {
                            var returnData = JSON.parse(data)
                            console.log(returnData)
                        })

                        songIndex = 0
                        speakandsing(robot, response, "Coherence")
                    })
                } else if (!requestLink && isMissed) {
                    if (numberOfMiss < 2) {
                        numberOfMiss++;
                        updateChat(robot, "Sorry, I do not understand. Can you rephrase the sentence?", "Respond_Unknown")
                    } else {
                        numberOfMiss = 0
                        var random = Math.random()
                        if (random >= 0 && random < 0.3)
                            updateChat(robot, "You can try to say 'I like fast songs' or 'I like pop music'", "Initialize")
                        else if (random >= 0.3 && random < 0.6)
                            updateChat(robot, "You can try to say 'Play a song for dancing' or 'I feel happy'", "Initialize")
                        else if (random >= 0.6 && random < 1)
                            updateChat(robot, "You can try to say 'I need more energy' or 'I like Chinese songs'", "Initialize")
                    }
                } else {
                    if (!needReply)
                        speakandsing(robot, "Ok, I found a song for you.", "Coherence")
                }
            }


            function speakandsing(agent, text, action) {

                updateChat(agent, text, action, "text");
                if (listenedSongs.indexOf(topRecommendedSong) < 0) {
                    listenedSongs.push(topRecommendedSong)
                    setTimeout(function () {
                        var explaination = ""

                        if (agent == "you") {

                            explaination = "We recommend this song because you like "

                            if (topRecommendedSong.seedType == "artist")
                                explaination += topRecommendedSong.seed + "'s songs."
                            else if (topRecommendedSong.seedType == "track")
                                explaination += "the songs " + topRecommendedSong.seed + "."
                            else if (topRecommendedSong.seedType == "genre")
                                explaination += "the songs of " + topRecommendedSong.seed + "."
                        }
                        if (explaination)
                            updateChat(robot, explaination, "Explain")

                    }, 500)

                    showCurrentSong2 = setTimeout(function () {
                        console.log(playlist)
                        showMusic(playlist[songIndex].id)
                    }, 3000)

                } else {
                    showMusic(playlist[songIndex].id)
                }
            }

            /*
             This function parses the returned data from Dialog flow
             */
            function synthVoice(text) {
                //const synth = window.speechSynthesis;
                //const utterance = new SpeechSynthesisUtterance();
                /*fields for returned data
                 artist
                 music-features
                 music-languages
                 music-genres
                 feature-actions
                 music-valence
                 song
                 */

                var intent = text.action;
                var response = text.fulfillment.speech;

                var artist, song, genre, valence, tempo, action, feature;
                var explaination = ""

                var requestLink;
                var critique = []

                //Check if SC should be triggered
                var updateData = {}
                updateData.logger = logger
                var listenedSongsLength = logger.listenedSongs.length
                updateData.topRecommendedSong = logger.listenedSongs[listenedSongsLength - 1]

                checkSystemCritiques(updateData).then(function (returnedData) {
                    var enableSC = JSON.parse(returnedData).triggerSC

                    if(enableSC){
                        var line = $('<div class="speak"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>');
                        chat.append(line);
                        getSysCrit()

                    }else{

                        //search by artist
                        if (intent.indexOf("smalltalk")>-1){
                            updateChat(robot, response, "Small_talk", "text");
                        }
                        else if (intent == "music_player_control.skip_forward") {
                            skipTimes++;
                        }
                        else if (intent == "music.search") {

                            artist = text.parameters["artist"]
                            genre = text.parameters["genre"]

                            if (artist.length > 0)
                                critique.push({"artist": artist.toString()})
                            if (genre != "")
                                critique.push({"genre": genre})

                            console.log(critique)

                            if (critique.length > 0) {

                                updateAndGetRec(critique).then(function (data) {
                                    var num = parseInt(data)
                                    console.log(num)
                                    if (num == 0) {
                                        if (artist.length > 0) {
                                            requestLink = '/searchArtist?q=' + artist[0] + '&token=' + spotifyToken;
                                            explaination = "OK, I recommend this song to you, because you like " + artist + "'s songs."

                                        } else if (genre) {
                                            requestLink = '/searchPlaylist?q=' + genre + "&token=" + spotifyToken;
                                            explaination = "OK, I recommend this song to you, because you like the songs of " + genre + "."
                                        } else
                                            requestLink = ''

                                        playRequestLink(requestLink,response,false)
                                    } else {
                                        songIndex = 0
                                        speakandsing(robot, response, "Coherence")
                                    }
                                })
                            }

                        }
                        else if (intent == "critique.response") {
                            needReply = false;
                            var response = text.parameters["RESPONSE"]
                            if (response == "yes") {
                                //perform critiquing on existing set

                                var newlist = data.pool.concat()
                                for (var index2 in critiques[critiquesIndex].action) {
                                    var templist = []
                                    newlist.map(function (track) {
                                        var critAttr = critiques[critiquesIndex].action[index2].prop
                                        var critType = critiques[critiquesIndex].action[index2].type
                                        if (critType == "equal") {
                                            console.log(critiques[critiquesIndex].action[index2].val)
                                            if (track[critAttr] == critiques[critiquesIndex].action[index2].val) {
                                                templist.push(track)
                                                data.user.preferenceData[critAttr + "Range"][0] = 0
                                                data.user.preferenceData[critAttr + "Range"][1] = data.topRecommendedSong[critAttr] - data.user.preferenceData_variance[critAttr]
                                                data.user.preferenceData[critAttr + "Range"][2] = "low"
                                            }
                                        } else if (critType == "lower") {
                                            console.log(data.user.preferenceData[critAttr])
                                            if (track[critAttr] < data.topRecommendedSong[critAttr] - data.user.preferenceData_variance[critAttr]) {
                                                templist.push(track)
                                            }
                                        } else if (critType == "higher") {
                                            console.log(data.user.preferenceData[critAttr])
                                            if (track[critAttr] > data.topRecommendedSong[critAttr] + data.user.preferenceData_variance[critAttr]) {
                                                templist.push(track)
                                                data.user.preferenceData[critAttr + "Range"][0] = data.topRecommendedSong[critAttr] + data.user.preferenceData_variance[critAttr]
                                                data.user.preferenceData[critAttr + "Range"][1] = 1
                                                data.user.preferenceData[critAttr + "Range"][2] = "high"
                                            }
                                        } else if (critType == "similar") {
                                            console.log(data.user.preferenceData[critAttr])
                                            if (track[critAttr] >= data.topRecommendedSong[critAttr] - data.user.preferenceData_variance[critAttr] && track[critAttr] <= data.topRecommendedSong[critAttr] + data.user.preferenceData_variance[critAttr]) {
                                                templist.push(track)
                                                data.user.preferenceData[critAttr + "Range"][0] = data.topRecommendedSong[critAttr] - data.user.preferenceData_variance[critAttr]
                                                data.user.preferenceData[critAttr + "Range"][1] = data.topRecommendedSong[critAttr] + data.user.preferenceData_variance[critAttr]
                                                data.user.preferenceData[critAttr + "Range"][2] = "middle"
                                            }
                                        }
                                    })
                                    newlist = templist.concat()
                                    console.log(newlist)
                                }
                                playlist = newlist.concat()

                                console.log(playlist)
                                songIndex = 0
                            }
                            else if (response == "no") {
                                if (critiquesIndex < critiques.length - 1) {
                                    needReply = true;
                                    critiquesIndex++;
                                    //TO CONFIRM
                                    updateChat(crit, critiques[critiquesIndex].speech, "System_Suggest", "text", true);

                                } else if (critiquesIndex == critiques.length - 1) {
                                    critiquesIndex = 0
                                    speakandsing(robot, "OK, I have no more suggestions, but maybe you want to try this song.", "Respond_NoSuggestion")
                                }
                            }
                        }
                        else if (intent == "music_player_control.features") {
                            valence = text.parameters["music-valence"]
                            tempo = text.parameters["music-tempo"]
                            action = text.parameters["feature-actions"]
                            feature = text.parameters["music-features"]

                            if (tempo == "fast")
                                critique.push({"tempo": "higher"})
                            else if (tempo == "normal")
                                critique.push({"tempo": "normal"})
                            else if (tempo == "slow")
                                critique.push({"tempo": "lower"})

                            if (valence == "happy")
                                critique.push({"valence": "higher"})
                            else if (valence == "neutral")
                                critique.push({"valence": "normal"})
                            else if (valence == "sad")
                                critique.push({"valence": "lower"})

                            if (feature) {
                                var item = {}
                                item[feature] = action
                                console.log(item)
                                critique.push(item)
                            }

                            if (critique.length > 0) {
                                updateAndGetRec(critique).then(function (data) {
                                    var num = parseInt(data)
                                    if (num == 0) {
                                        console.log("没有找到匹配的歌曲")
                                        if (valence) {
                                            if (valence == "happy") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&seed_tracks=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_valence=' + data.user.preferenceData.valence + '&token=' + spotifyToken;
                                            }
                                            else if (valence == "neutral") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&seed_tracks=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_valence=' + data.user.preferenceData.valence + '&token=' + spotifyToken;
                                            }
                                            else if (valence == "sad") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&seed_tracks=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_valence=' + data.user.preferenceData.valence + '&token=' + spotifyToken;
                                            }
                                            explaination = "OK, I recommend this song to you, because you like the " + valence + " songs"
                                        } else if (tempo) {
                                            if (tempo == "fast") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&trackSeeds=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_tempo=' + data.user.preferenceData.tempo + '&token=' + spotifyToken;
                                            }
                                            else if (tempo == "normal") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&trackSeeds=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_tempo=' + data.user.preferenceData.tempo + '&token=' + spotifyToken;
                                            } else if (tempo == "slow") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&trackSeeds=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_tempo=' + data.user.preferenceData.tempo + '&token=' + spotifyToken;
                                            }
                                            explaination = "OK, I recommend this song to you, because you like the " + tempo + " songs"
                                        } else if (feature) {

                                            if (action == "higher") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&trackSeeds=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_'+feature+'=' + data.user.preferenceData.energy + "&token=" + spotifyToken;
                                                explaination = "OK, I recommend this song to you, because you like the songs of higher"+ feature+"."
                                            }
                                            else if (action == "lower") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&trackSeeds=' + seed_tracks + '&genreSeeds=' + seed_genres + '&target_'+feature+'=' + data.user.preferenceData.energy + "&token=" + spotifyToken;
                                                explaination = "OK, I recommend this song to you, because you like the songs of lower"+ feature+"."
                                            }
                                            else if (action == "") {
                                                requestLink = '/getRecom?artistSeeds=' + seed_artists + '&trackSeeds=' + seed_tracks + '&genreSeeds=' + seed_genres + 'target_'+feature+'=' + data.user.preferenceData.energy + "&token=" + spotifyToken;
                                                explaination = "OK, I recommend this song to you, because you like the songs of higher"+ feature+"."
                                            }

                                        }
                                        playRequestLink(requestLink,response,false)

                                    } else {
                                        songIndex = 0
                                        speakandsing(robot, response, "Coherence")
                                    }
                                })
                            }

                        }
                        else if (!intent) {
                            requestLink = ''
                            playRequestLink(requestLink,response,true)
                        }

                    }

                })

            }

            socket.on('bot reply', function (data) {
                synthVoice(data)
            });

            function resumeInfinity() {
                window.speechSynthesis.resume();
                timeoutResumeInfinity = setTimeout(resumeInfinity, 1000);
            }

        },
        error: function (jqXHR, err) {
            console.log(err);
            if (err === "timeout") {
                $.ajax(this)
            }
        },

    });
})