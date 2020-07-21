
import numpy as np
import pandas as pd
import operator


def get_numerical_attribute_intervalindex(attribute):
    
    attribute_intervalindex = None
    zero_to_one_attributes = ['danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence']
    if attribute == 'popularity':
        attribute_intervalindex = list(range(0,120, 10))
    
    if attribute == 'tempo':
        attribute_intervalindex = list(range(0,300, 20))

    if attribute in zero_to_one_attributes:

        attribute_intervalindex = list(np.around(np.arange(0,1.2, 0.1), decimals=1))
    
   
    intervalindex = pd.IntervalIndex.from_breaks(attribute_intervalindex, closed='left')
    # interval_label = intervalindex.astype(str)
    interval_label_level = ['level_'+str(i) for i in range(1, len(intervalindex)+1)]
    assert(len(intervalindex) == len(interval_label_level))
    return attribute_intervalindex, interval_label_level

def get_numerical_attribute_interval_label(attribute, value):

    attribut_interval,interval_label = get_numerical_attribute_intervalindex(attribute)
    intervals = pd.IntervalIndex.from_breaks(attribut_interval, closed='left')
    interval_find = list(intervals.contains(value))
    index = interval_find.index(True)
    value_interval_label = interval_label[index]
    return value_interval_label


def convert_to_critique_preference_dict(user_critique_preference):
    categorical_critique_dict = {}
    numerical_critique_dict = {}
    min_number = -1
    max_number = 999999

    for i in range(len(user_critique_preference)):
        each_crit = user_critique_preference[len(user_critique_preference)-i-1]
        pos_or_neg = each_crit['pos_or_neg']
        attr = each_crit['attribute'] 
        crit_direction = each_crit['crit_direction'] 
        crit_value = ''

        # numerical attributes
        if 'value' in each_crit.keys():
            crit_value = each_crit['value']
            if attr not in numerical_critique_dict.keys():
                if pos_or_neg == 'pos':
                    if crit_direction == 'lower':
                        critique_preference_on_attribute = [min_number, crit_value]
                        numerical_critique_dict[attr] = critique_preference_on_attribute
                    elif crit_direction == 'higher':
                        critique_preference_on_attribute = [crit_value, max_number]
                        numerical_critique_dict[attr] = critique_preference_on_attribute
                    else:
                        print("Crit_direction - - ERROR -- " + crit_direction)
                        # input()
                if pos_or_neg == 'neg':
                    if crit_direction == 'lower':
                        critique_preference_on_attribute = [crit_value, max_number]
                        numerical_critique_dict[attr] = critique_preference_on_attribute
                    elif crit_direction == 'higher':
                        critique_preference_on_attribute = [min_number, crit_value]
                        numerical_critique_dict[attr] = critique_preference_on_attribute
                    else:
                        print("Crit_direction - - ERROR -- " + crit_direction)
                        # input()
            else:
                critique_preference_on_attribute = numerical_critique_dict[attr]
                if pos_or_neg == 'pos':
                    if crit_direction == 'lower':
                        if crit_value > critique_preference_on_attribute[0] and crit_value < critique_preference_on_attribute[1]:
                            critique_preference_on_attribute[1] = crit_value
                            numerical_critique_dict[attr] = critique_preference_on_attribute
                    elif crit_direction == 'higher':
                        if crit_value > critique_preference_on_attribute[0] and crit_value < critique_preference_on_attribute[1]: 
                            critique_preference_on_attribute[0] = crit_value
                            numerical_critique_dict[attr] = critique_preference_on_attribute
                    else:
                        print("Crit_direction - - ERROR -- " + crit_direction)
                        # input()
                if pos_or_neg == 'neg':
                    if crit_direction == 'lower':
                        if crit_value > critique_preference_on_attribute[0] and crit_value < critique_preference_on_attribute[1]: 
                            critique_preference_on_attribute[0] = crit_value
                            numerical_critique_dict[attr] = critique_preference_on_attribute
                    elif crit_direction == 'higher':
                        if crit_value > critique_preference_on_attribute[0] and crit_value < critique_preference_on_attribute[1]: 
                            critique_preference_on_attribute[1] = crit_value
                            numerical_critique_dict[attr] = critique_preference_on_attribute
                    else:
                        print("Crit_direction - - ERROR -- " + crit_direction)
                        # input()
            
        
        # categorical attributes
        else:
            if attr not in categorical_critique_dict.keys():
                categorical_critique_dict[attr] = {'pos': [], 'neg':[]}
                if pos_or_neg == 'pos':
                    categorical_critique_dict[attr]['pos'] = [crit_direction]
                if pos_or_neg == 'neg':
                    categorical_critique_dict[attr]['neg'] = [crit_direction]

            else:
                critique_preference_on_attribute = categorical_critique_dict[attr]
    
                if pos_or_neg == 'pos':
                    if crit_direction not in critique_preference_on_attribute['neg']:
                        crit_direction_list = critique_preference_on_attribute[pos_or_neg]
                        crit_direction_list.append(crit_direction)
                        critique_preference_on_attribute[pos_or_neg] = list(set(crit_direction_list))
                    else: # use recent critique if there is inconsistency
                        continue
                if pos_or_neg == 'neg':
                    if crit_direction not in critique_preference_on_attribute['pos']:
                        crit_direction_list = critique_preference_on_attribute[pos_or_neg]
                        crit_direction_list.append(crit_direction)
                        critique_preference_on_attribute[pos_or_neg] =  list(set(crit_direction_list))
                categorical_critique_dict[attr] = critique_preference_on_attribute

    return categorical_critique_dict, numerical_critique_dict


def sort_dict (value_dict):
    sorted_list = sorted(value_dict.items(), key=operator.itemgetter(1),reverse=True)

    return sorted_list

def convert_list_of_dict_to_dict(list_of_dict, key_name):
    converted_dict = {}
    for i_dict in list_of_dict:
        key = i_dict[key_name]
        converted_dict[key] = i_dict
    
    return converted_dict

def get_whole_genre_list():
    genre_list = [
        'acoustic',
        'afrobeat',
        'alternative',
        'ambient',
        'anime',
        'black-metal',
        'bluegrass',
        'blues',
        'bossanova',
        'brazil',
        'breakbeat',
        'british',
        'chicago-house',
        'children',
        'chill',
        'classical',
        'club',
        'comedy',
        'country',
        'dance',
        'dancehall',
        'death-metal',
        'deep-house',
        'disco',
        'disney',
        'drum-and-bass',
        'dub',
        'dubstep',
        'edm',
        'electronic',
        'emo',
        'folk',
        'forro',
        'french',
        'funk',
        'garage',
        'german',
        'gospel',
        'goth',
        'grindcore',
        'groove',
        'grunge',
        'guitar',
        'happy',
        'hardcore',
        'hardstyle',
        'heavy-metal',
        'hip-hop',
        'holidays',
        'honky-tonk',
        'house',
        'idm',
        'indian',
        'indie',
        'industrial',
        'iranian',
        'j-dance',
        'jazz',
        'kids',
        'latin',
        'malay',
        'metal',
        'metal-misc',
        'metalcore',
        'movies',
        'new-age',
        'new-release',
        'opera',
        'party',
        'philippines-opm',
        'piano',
        'pop',
        'pop-film',
        'power-pop',
        'progressive-house',
        'punk',
        'r-n-b',
        'rainy-day',
        'reggae',
        'road-trip',
        'rock',
        'romance',
        'sad',
        'salsa',
        'samba',
        'show-tunes',
        'singer-songwriter',
        'sleep',
        'songwriter',
        'soul',
        'soundtracks',
        'spanish',
        'study',
        'summer',
        'swedish',
        'tango',
        'techno',
        'trance',
        'trip-hop',
        'turkish',
        'work-out',
        'world-music']
    return genre_list

#  def get_whole_genre_list():
#     genre_list = [ 
#         "acoustic", 
#         "afrobeat", 
#         "alt-rock", 
#         "alternative", 
#         "ambient", 
#         "anime", 
#         "black-metal", 
#         "bluegrass", 
#         "blues", 
#         "bossanova", 
#         "brazil", 
#         "breakbeat", 
#         "british", 
#         "cantopop", 
#         "chicago-house", 
#         "children", 
#         "chill", 
#         "classical", 
#         "club", 
#         "comedy", 
#         "country", 
#         "dance", 
#         "dancehall", 
#         "death-metal", 
#         "deep-house", 
#         "detroit-techno", 
#         "disco", 
#         "disney", 
#         "drum-and-bass", 
#         "dub", 
#         "dubstep", 
#         "edm", 
#         "electro", 
#         "electronic", 
#         "emo", 
#         "folk", 
#         "forro", 
#         "french", 
#         "funk", 
#         "garage", 
#         "german", 
#         "gospel", 
#         "goth", 
#         "grindcore", 
#         "groove", 
#         "grunge", 
#         "guitar", 
#         "happy", 
#         "hard-rock", 
#         "hardcore", 
#         "hardstyle", 
#         "heavy-metal", 
#         "hip-hop", 
#         "holidays", 
#         "honky-tonk", 
#         "house", 
#         "idm", 
#         "indian", 
#         "indie", 
#         "indie-pop", 
#         "industrial", 
#         "iranian", 
#         "j-dance", 
#         "j-idol", 
#         "j-pop", 
#         "j-rock", 
#         "jazz", 
#         "k-pop", 
#         "kids", 
#         "latin", 
#         "latino", 
#         "malay", 
#         "mandopop", 
#         "metal", 
#         "metal-misc", 
#         "metalcore", 
#         "minimal-techno", 
#         "movies", 
#         "mpb", 
#         "new-age", 
#         "new-release", 
#         "opera", 
#         "pagode", 
#         "party", 
#         "philippines-opm", 
#         "piano", 
#         "pop", 
#         "pop-film", 
#         "post-dubstep", 
#         "power-pop", 
#         "progressive-house", 
#         "psych-rock", 
#         "punk", 
#         "punk-rock", 
#         "r-n-b", 
#         "rainy-day", 
#         "reggae", 
#         "reggaeton", 
#         "road-trip", 
#         "rock", 
#         "rock-n-roll", 
#         "rockabilly", 
#         "romance", 
#         "sad", 
#         "salsa", 
#         "samba", 
#         "sertanejo", 
#         "show-tunes", 
#         "singer-songwriter", 
#         "ska", 
#         "sleep", 
#         "songwriter", 
#         "soul", 
#         "soundtracks", 
#         "spanish", 
#         "study", 
#         "summer", 
#         "swedish", 
#         "synth-pop", 
#         "tango", 
#         "techno", 
#         "trance", 
#         "trip-hop", 
#         "turkish", 
#         "work-out", 
#         "world-music"]

#     return genre_list

