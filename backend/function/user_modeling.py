import pandas as pd
import numpy as np
import pprint
import ast
import copy
from function import helper 

pp = pprint.PrettyPrinter(indent=4)

def categorical_attribute_preference(user_historical_attr_df):
    
    return user_historical_attr_df.value_counts().to_dict()

def numerical_attribute_preference(user_historical_attr_df,attribute):

    attribute_intervalindex,interval_label = helper.get_numerical_attribute_intervalindex(attribute)
    # user_historical_attr_bins = pd.cut(user_historical_attr_df, attribute_intervalindex, labels = list(range(len(attribute_intervalindex)-1)))
    print(attribute_intervalindex)
    user_historical_attr_bins = pd.cut(user_historical_attr_df, attribute_intervalindex,right=False, labels = interval_label)
    print(user_historical_attr_bins)
   
    return user_historical_attr_bins.value_counts().to_dict()


def initialize_user_preference_value(user_historical_record, categorical_attributes, numerical_attributes):
    # print(user_historical_record)
    user_historical_record_dict = {}
    user_preference_value_dict = {}
    for each_record in user_historical_record:
        user_historical_record_dict[len(user_historical_record_dict)+1] = each_record
    
    user_historical_record_df = pd.DataFrame.from_dict(user_historical_record_dict, orient='index')
    # print(user_historical_record_df.head())
    for attr in categorical_attributes:
        user_historical_attr_df = user_historical_record_df[attr]
        user_preference_value_dict[attr] = categorical_attribute_preference(user_historical_attr_df)
    for attr in numerical_attributes:
        user_historical_attr_df = user_historical_record_df[attr]
        user_preference_value_dict[attr] = numerical_attribute_preference(user_historical_attr_df, attr)
    
    pp.pprint(user_preference_value_dict)
    return user_preference_value_dict 

def initialize_user_preference_attribute_frequency(categorical_attributes, numerical_attributes):
    user_preference_attribute_frequency_dict = {}
    for attr in categorical_attributes:
        user_preference_attribute_frequency_dict[attr] = 1
    for attr in numerical_attributes:
        user_preference_attribute_frequency_dict[attr] = 1
        
    pp.pprint(user_preference_attribute_frequency_dict)
    return user_preference_attribute_frequency_dict 



def update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes):
    
    new_critique_preference = {}
    new_critique_preference['attribute'] = attr
    new_critique_preference['crit_direction'] = criti_value
    if attr in numerical_attributes:
        new_critique_preference['value'] = critique_song_info[attr]
    updated_user_critique_preference[len(updated_user_critique_preference)+1] = copy.deepcopy(new_critique_preference)

    return updated_user_critique_preference
    
def update_user_constraints(updated_user_critique_preference, constraint_number):
    top_k_constraints = {}
    top_k_constraints_attr_list = []
    for i in range(len(updated_user_critique_preference)+1):
        if len(updated_user_critique_preference) - i > 0:
            constraint = updated_user_critique_preference[len(updated_user_critique_preference)-i]
            if constraint['attribute'] in top_k_constraints_attr_list:
                continue
            else:
                top_k_constraints[len(top_k_constraints)+1] = constraint
                top_k_constraints_attr_list.append(constraint['attribute'])

        if len(top_k_constraints) == constraint_number:
            return top_k_constraints
    return top_k_constraints
            

def update_user_preference_value(updated_user_preference_value,liked_song_info,categorical_attributes, numerical_attributes):
    
    for attr in categorical_attributes:
        item_v = liked_song_info[attr]
        if item_v in updated_user_preference_value[attr].keys():
            updated_user_preference_value[attr][item_v] = updated_user_preference_value[attr][item_v] + 1
        else:
            updated_user_preference_value[attr][item_v] = 1

    for attr in numerical_attributes:
        item_v = liked_song_info[attr]
        value_interval_label = helper.get_numerical_attribute_interval_label(attr, item_v)

        updated_user_preference_value[attr][value_interval_label] = updated_user_preference_value[attr][value_interval_label] + 1

    return copy.deepcopy(updated_user_preference_value)

def update_user_model(user_model, user_interaction_dialog, user_listened_longs, categorical_attributes, numerical_attributes):
    updated_user_preference_value = user_model['user_preference_model']['preference_value']
    updated_user_attribute_frequency = user_model['user_preference_model']['attribute_frequency']


    updated_user_constraints = user_model['user_constraints']

    updated_user_critique_preference = user_model['user_critique_preference']

    sys_critique_list = []
    critique_song_id = ''
    liked_song_id = ''
    for utterance_info in user_interaction_dialog:
        current_action = utterance_info['action']
        # Condition 1: user critiquing 
        # -> update (1) user critique preference, (2) preference model: attribute frequency, (3) user constraints,
        if current_action == "User_critique" :
            critique_list = utterance_info['user_critique']
            critique_song_id = utterance_info['critiqued_song']
            critique_song_info = {}
            for song in user_listened_longs:
                if song['id'] == critique_song_id:
                    critique_song_info = song
         
            for crit in critique_list:
                for attr, criti_value in crit.items():
                    # preference model: attribute frequency
                    updated_user_attribute_frequency[attr] = updated_user_attribute_frequency[attr] + 1
                    # user critique preference
                    updated_user_critique_preference = update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes)

            # pp.pprint(updated_user_critique_preference)
            # user constraint
            constraint_number = 3
            updated_user_constraints = update_user_constraints(updated_user_critique_preference, constraint_number)
            # pp.pprint(updated_user_constraints)

        # Condition 2: Recommend
        # -> keep info : critique_list, critique
        if current_action == "Recommend" :
            
            if 'sys_critique' in utterance_info.keys():
                sys_critique_list = utterance_info['sys_critique']
                critique_song_id = utterance_info['critiqued_song']
                liked_song_id = utterance_info['text']
            if 'user_critique' in utterance_info.keys():
                liked_song_id = utterance_info['text']
        

        # Condition 3: accept the recommendation
        if current_action == "Accept_Song":
            # if the recommended song is based on system critiques
            # -> update (1) user critique preference (if "sys_critique"), (2) preference model: attribute frequency, (3) user constraints,
            
            if len(sys_critique_list) > 0:
                critique_list = sys_critique_list
                critique_song_id = utterance_info['critiqued_song']
                critique_song_info = {}
                for song in user_listened_longs:
                    if song['id'] == critique_song_id:
                        critique_song_info = song
            
                for crit in critique_list:
                    for attr, criti_value in crit.items():
                        # preference model: attribute frequency
                        updated_user_attribute_frequency[attr] = updated_user_attribute_frequency[attr] + 1
                        # user critique preference
                        updated_user_critique_preference = update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes)

                # user constraint
                constraint_number = 3
                updated_user_constraints = update_user_constraints(updated_user_critique_preference, constraint_number)
            # ------------------------------------------------
            # Update preference value based on the liked songs
            # ------------------------------------------------
            liked_song_info = {}
            for song in user_listened_longs:
                if song['id'] == liked_song_id:
                    liked_song_info = song
            updated_user_preference_value = update_user_preference_value(updated_user_preference_value, liked_song_info, categorical_attributes, numerical_attributes)
            
        updated_user_preference_model = {'preference_value': updated_user_preference_value, 'attribute_frequency': updated_user_attribute_frequency}
    return updated_user_preference_model, updated_user_constraints, updated_user_critique_preference