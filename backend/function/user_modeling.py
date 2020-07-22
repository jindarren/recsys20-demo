import pandas as pd
import numpy as np
import pprint
import ast
import copy
from function import helper 
from tool import time_helper

pp = pprint.PrettyPrinter(indent=4)

def categorical_attribute_preference(user_historical_attr_df):
    
    return user_historical_attr_df.value_counts().to_dict()

def numerical_attribute_preference(user_historical_attr_df,attribute):

    attribute_intervalindex,interval_label = helper.get_numerical_attribute_intervalindex(attribute)
    user_historical_attr_bins = pd.cut(user_historical_attr_df, attribute_intervalindex,right=False, labels = interval_label)

   
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
    
    # pp.pprint(user_preference_value_dict)
    time_helper.print_current_time()
    print("Initialize User Model ---- Estimate users' preference value for each attribute from users' interaction history.")
   
    return user_preference_value_dict 

def initialize_user_preference_attribute_frequency(categorical_attributes, numerical_attributes):
    user_preference_attribute_frequency_dict = {}
    for attr in categorical_attributes:
        user_preference_attribute_frequency_dict[attr] = 1
    for attr in numerical_attributes:
        user_preference_attribute_frequency_dict[attr] = 1

    time_helper.print_current_time()
    print("Initialize User Model ---- Initialize attribute frequency as 1 for all attributes.")
   

    return user_preference_attribute_frequency_dict 

def initialize_user_preference_model(user_historical_record, categorical_attributes, numerical_attributes):

    user_initial_preference_value =  initialize_user_preference_value(user_historical_record, categorical_attributes, numerical_attributes)
    user_preference_attribute_frequency = initialize_user_preference_attribute_frequency( categorical_attributes, numerical_attributes)
    user_preference_model = {'preference_value':user_initial_preference_value, 'attribute_frequency':user_preference_attribute_frequency}

    time_helper.print_current_time()
    print("Initialize User Model ---- Preference Model about %d categorical attributes." % len(categorical_attributes))
    time_helper.print_current_time()
    print("Initialize User Model ---- Preference Model about %d numerical attributes." % len(numerical_attributes))
    return user_preference_model



def update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes, pos_or_neg='pos'):
    
    new_critique_preference = {}
    new_critique_preference['pos_or_neg'] = pos_or_neg
    new_critique_preference['attribute'] = attr
    new_critique_preference['crit_direction'] = criti_value
    if attr in numerical_attributes:
        new_critique_preference['value'] = critique_song_info[attr]
    updated_user_critique_preference.append(copy.deepcopy(new_critique_preference))

    return updated_user_critique_preference
    
def update_user_constraints(updated_user_critique_preference, constraint_number):

    top_k_constraints = []
    top_k_constraints_attr_list = [] # store the attributes that has been constrained
    for i in range(len(updated_user_critique_preference)):
        if len(updated_user_critique_preference) - i > 0:
            constraint = updated_user_critique_preference[len(updated_user_critique_preference)-i-1]
            if constraint['pos_or_neg'] == 'neg' or  constraint['attribute'] in top_k_constraints_attr_list:
                continue
            else:
                top_k_constraints.append(constraint)
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

def update_user_model(user_model, user_interaction_dialog, user_listened_longs, current_recommended_item, categorical_attributes, numerical_attributes):
    updated_user_preference_value = user_model['user_preference_model']['preference_value']
    updated_user_attribute_frequency = user_model['user_preference_model']['attribute_frequency']
    updated_user_constraints = user_model['user_constraints']
    updated_user_critique_preference = user_model['user_critique_preference']

    for utterance_info in user_interaction_dialog:
        current_action = utterance_info['action'].lower()
        # Condition 1: user critiquing / system suggest critiquing - Yes
        # -> update (1) user critique preference, (2) preference model: attribute frequency, (3) user constraints,
        # print(current_action )
        time_helper.print_current_time()
        print("Update User Model ---- User Action: %s." % (current_action))

        if current_action == "user_critique" or current_action == "accept_suggestion":
            critique_list = []
            if 'critique' in utterance_info.keys():
                critique_list = utterance_info['critique']
            critique_song_info = current_recommended_item
            # [Revised 2020-05-07: Actually, the critiqued item is just the current recommended item.]
            # critique_song_id = utterance_info['critiqued_song']
            # critique_song_info = {}
            # for song in user_listened_longs:
            #     if song['id'] == critique_song_id:
            #         critique_song_info = song
            
            time_helper.print_current_time()
            print("Update User Model (%s) ---- Number of Critiques: %d." % (current_action, len(critique_list)))

            for crit in critique_list:
                for attr, criti_value in crit.items():
                    if attr not in numerical_attributes and attr not in categorical_attributes:
                        continue
                    # preference model: attribute frequency
                    updated_user_attribute_frequency[attr] = updated_user_attribute_frequency[attr] * 2
                    time_helper.print_current_time()
                    print("update attribute frequence: attribute (%s) - %f. "% (attr, updated_user_attribute_frequency[attr]))
                    # user critique preference
                    updated_user_critique_preference = update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes, 'pos')


            # pp.pprint(updated_user_critique_preference)

            # user constraint
            constraint_number = 5
            updated_user_constraints = update_user_constraints(updated_user_critique_preference, constraint_number)

            time_helper.print_current_time()
            print("Update User Model ---- Number of Current User Constraints: %d." % len(updated_user_constraints))

            # pp.pprint(updated_user_constraints)


        # Condition 2:  system suggest critiquing - No
        # -> update (1) user critique negative
        if current_action == 'reject_suggestion':
            critique_list = []
            if 'critique' in utterance_info.keys():
                critique_list = utterance_info['critique']
            critique_song_info = current_recommended_item
            
            time_helper.print_current_time()
            print("Update User Model (%s) ---- Number of Critiques: %d." % (current_action, len(critique_list)))

            for crit in critique_list:
                for attr, criti_value in crit.items():
                    # check if there are consective rejected critiques within the same attribute (decrease the attribute frequency)
                    if len(updated_user_critique_preference) > 0:
                        latest_user_critique_preference = updated_user_critique_preference[-1]
                        time_helper.print_current_time()
                        print("latest_critique: ", latest_user_critique_preference)
                        if attr in numerical_attributes and latest_user_critique_preference['pos_or_neg'] == 'neg' and latest_user_critique_preference['attribute'] == attr:
                            updated_user_attribute_frequency[attr] = updated_user_attribute_frequency[attr] / 2
                            time_helper.print_current_time()
                            print("update attribute frequence: attribute (%s) - %f. "% (attr, updated_user_attribute_frequency[attr]))
                    # user critique preferencef
                    updated_user_critique_preference = update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes, 'neg')

                    

        # Condition 3: accept the recommendation
        if current_action == "accept_song":

            # --- Revise ---- system critique - accept -> update critique preference, attribute frequency, user constraints
            # # if the recommended song is based on system critiques
            # # -> update (1) user critique preference (if "sys_critique"), (2) preference model: attribute frequency, (3) user constraints,
            
            # if len(sys_critique_list) > 0:
            #     critique_list = sys_critique_list
            #     critique_song_id = utterance_info['critiqued_song']
            #     critique_song_info = {}
            #     for song in user_listened_longs:
            #         if song['id'] == critique_song_id:
            #             critique_song_info = song
            
            #     for crit in critique_list:
            #         for attr, criti_value in crit.items():
            #             # preference model: attribute frequency
            #             updated_user_attribute_frequency[attr] = updated_user_attribute_frequency[attr] + 1
            #             # user critique preference
            #             updated_user_critique_preference = update_user_critique_preference(updated_user_critique_preference, attr, criti_value, critique_song_info, numerical_attributes)

            #     # user constraint
            #     constraint_number = 3
            #     updated_user_constraints = update_user_constraints(updated_user_critique_preference, constraint_number)
            

            # ------------------------------------------------
            # Update preference value based on the liked songs
            # ------------------------------------------------
            liked_song_info = current_recommended_item
            updated_user_preference_value = update_user_preference_value(updated_user_preference_value, liked_song_info, categorical_attributes, numerical_attributes)
            
            time_helper.print_current_time()
            print("Update User Model ---- Update preference value based on the accepted item.")


    updated_user_preference_model = {'preference_value': updated_user_preference_value, 'attribute_frequency': updated_user_attribute_frequency}
    
    return updated_user_preference_model, updated_user_constraints, updated_user_critique_preference