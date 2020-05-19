
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


def sort_dict (value_dict):
    sorted_list = sorted(value_dict.items(), key=operator.itemgetter(1),reverse=True)

    return sorted_list

def convert_list_of_dict_to_dict(list_of_dict, key_name):
    converted_dict = {}
    for i_dict in list_of_dict:
        key = i_dict[key_name]
        converted_dict[key] = i_dict
    
    return converted_dict
