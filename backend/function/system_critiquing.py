import pandas as pd
import numpy as np
import pprint
import copy
from function import helper, recommendation, diversity_calculation 
from efficient_apriori import apriori
import sys
from analysis.data_processing_analysis import pca_analysis
sys.path.append("..") 
from tool import time_helper, store_data

pp = pprint.PrettyPrinter(indent=4)

min_support = 0.1
min_confidence = 0.8


def generate_critique_array(item_pool, cur_rec, categorical_attributes, numerical_attributes):
    item_critique_arrays = []
    item_critique_arrays_dict ={}

    for each_item in item_pool:
        item_id = each_item['id']
        item_critique_array = []
        for attr in categorical_attributes:
            critique = attr + '|' + each_item[attr]
            item_critique_array.append(critique)
        for attr in numerical_attributes:
            # step 1: find the interval index
            attribut_interval,interval_label = helper.get_numerical_attribute_intervalindex(attr)
            intervals = pd.IntervalIndex.from_breaks(attribut_interval, closed='left')

            cur_interval_find = list(intervals.contains(cur_rec[attr]))
            cur_index = cur_interval_find.index(True)

            item_interval_find = list(intervals.contains(each_item[attr]))
            item_index = item_interval_find.index(True)
            if item_index == cur_index:
                critique = attr + '|' + 'similar'

            elif item_index < cur_index:
                critique = attr + '|' + 'lower'

            else:
                critique = attr + '|' + 'higher'
            
            item_critique_array.append(critique)
        

        item_critique_arrays.append(copy.deepcopy(item_critique_array))
        item_critique_arrays_dict[item_id] = copy.deepcopy(item_critique_array)

    return item_critique_arrays, item_critique_arrays_dict



def obtain_critique_items_dict(frequent_critiques_freq_dict, item_critique_arrays_dict):
    frequent_critiques_satisfied_items_dict = {}
    for crit in frequent_critiques_freq_dict:
        crit_list = list(crit)
        crit_item_list = []
        for item_id, item_critique_array in item_critique_arrays_dict.items():
            satisfy_or_not =  all(unit in item_critique_array  for unit in crit_list)
            if satisfy_or_not:
                crit_item_list.append(item_id)
        frequent_critiques_satisfied_items_dict[crit] = copy.deepcopy(crit_item_list)
    return frequent_critiques_satisfied_items_dict

def compute_critique_utility_preference_oriented (user_attribute_frequency, frequent_critiques_freq_dict, min_support, frequent_critiques_satisfied_items_dict, estimated_score_dict):
    critique_utility_dict = {}

    total_item_number = len(estimated_score_dict)
    # obtain attribute weight (normalized)
    user_attribute_weight = {}
    user_attribute_frequency_sum = sum(user_attribute_frequency.values())
    for attr in user_attribute_frequency:
        user_attribute_weight[attr] = user_attribute_frequency[attr]/user_attribute_frequency_sum

    # compute the critique utility
    for crit in frequent_critiques_satisfied_items_dict:
        crit_support_value = frequent_critiques_freq_dict[crit]/total_item_number
        crit_items_list = frequent_critiques_satisfied_items_dict[crit]

        # consider the weight
        weight_term = 0
        
        for unit in crit:
            critique_unit = unit.split('|')
            attribute = critique_unit[0]
            weight_term += user_attribute_weight[attribute]
        
        # consider the utility of top K items in the current critique
        item_preference_score_term = 0
        topK = int(total_item_number * min_support)
        item_score_dict = {}
        for item in crit_items_list:
            item_score_dict[item] = estimated_score_dict[item]
        sorted_item_score_dict = helper.sort_dict(item_score_dict)

        # print(sorted_item_score_dict)
        for i in range(topK):
            item_preference_score_term += sorted_item_score_dict[i][1]
        item_preference_score_term = item_preference_score_term/topK
        # print(item_preference_score_term)

        critique_utility = weight_term * crit_support_value * item_preference_score_term 

        # print(critique_utility)

        critique_utility_dict[crit] = critique_utility
    
    sorted_critique_utility_list = helper.sort_dict(critique_utility_dict)
    pp.pprint(sorted_critique_utility_list)


    return sorted_critique_utility_list


def compute_critique_utility_diversity_oriented (diversity_calculation_method, user_listened_songs, item_pool, frequent_critiques_satisfied_items_dict, categorical_attributes, numerical_attributes):
    
    critique_diversity_utility_dict = {}

    total_item_number = len(item_pool)

    item_info_dict = helper.convert_list_of_dict_to_dict(item_pool, 'id')
    user_listened_songs_info_dict = helper.convert_list_of_dict_to_dict(user_listened_songs, 'id')
    user_listened_songs_info_df = pd.DataFrame.from_dict(user_listened_songs_info_dict, orient='index')

    # pp.pprint(item_info_dict)

    # compute the critique - diversity power
    for crit in frequent_critiques_satisfied_items_dict:
        crit_items_list = frequent_critiques_satisfied_items_dict[crit]
        crit_item_info_dict = {}
        for item in crit_items_list:
            crit_item_info_dict[item] = item_info_dict[item]
        crit_item_info_df = pd.DataFrame.from_dict(crit_item_info_dict, orient='index')
        
        critique_diversity_utility = 0
        attributes = categorical_attributes + numerical_attributes
        combined_songs_info_df = pd.concat([user_listened_songs_info_df[attributes], crit_item_info_df[attributes]])
        
        if diversity_calculation_method == 'dissimilarity':
            critique_diversity_utility = diversity_calculation.calculate_dissimilarity_between_two_sets(user_listened_songs_info_df, crit_item_info_df, combined_songs_info_df, categorical_attributes, numerical_attributes)
        if diversity_calculation_method == 'entropy':
            critique_diversity_utility = diversity_calculation.calculate_entropy_for_set(combined_songs_info_df, categorical_attributes, numerical_attributes)

        if diversity_calculation_method == 'unexpectedness':
            critique_diversity_utility = diversity_calculation.calculate_unexpectedness_for_set(user_listened_songs_info_df, crit_item_info_df, combined_songs_info_df, categorical_attributes, numerical_attributes)

        # combined_pc_df = pca_analysis(user_listened_songs_info_df, crit_item_info_df,combined_songs_info_df, categorical_attributes, numerical_attributes)
        # crit_name = crit[0].replace('|', '_')
        # store_data.store_data_to_xlsx(combined_pc_df, crit_name)

        critique_diversity_utility_dict[crit] = critique_diversity_utility
    
    sorted_critique_diversity_utility_list = helper.sort_dict(critique_diversity_utility_dict)
    
    pp.pprint(sorted_critique_diversity_utility_list)



    return sorted_critique_diversity_utility_list

def compute_critique_utility_personality_adjusted (user_attribute_frequency, frequent_critiques_freq_dict, min_support,frequent_critiques_satisfied_items_dict, estimated_score_dict):
    
    pass

def switch_critique_level(interaction_log, cur_rec, categorical_attributes, numerical_attributes, switch_condition):
    cur_rec_genre = cur_rec['genre']
    previous_dialogue = interaction_log['dialog'] + interaction_log['latest_dialog']
    # print(previous_dialogue)


    interaction_turn_condition = False
    # Hard Constraint: if "genre"-related critique occurs within 3 turns -> Level 2 ; otherwise, consider switching to Level 1
    # step1 : find the postion of latest genre-related critiques
    number_utterance = 0
    pos_genre_criti = 0
    for utterance_info in previous_dialogue:
        critique_list = []
        if 'user_critique' in utterance_info.keys():
            critique_list = utterance_info['user_critique']
        if 'sys_critique' in utterance_info.keys():
            critique_list = utterance_info['sys_critique']
        if len(critique_list) > 0:
            for each_crit in critique_list:
                if 'genre' in each_crit.keys():
                    pos_genre_criti = number_utterance
        number_utterance += 1

    # step2 : calculate the interaction turn start from the latest genre-related critiques to the current turns

    num_sys_turns = 0
    num_user_turns = 0
    turn_take = ''
    for utterance_info in previous_dialogue[pos_genre_criti:]:
        if utterance_info['agent'] == turn_take:
            continue
        else:
            if utterance_info['agent'] == 'robot':
                num_sys_turns += 1
                turn_take = 'robot'
            if utterance_info['agent'] == 'you':
                num_user_turns += 1
                turn_take = 'you'
    # print(num_sys_turns)
    # print(num_user_turns)


    if num_sys_turns >= switch_condition['num_interaction_turn_condition'] and num_user_turns >= switch_condition['num_interaction_turn_condition']:
        interaction_turn_condition = True


    # Hard constraint is satisfied: -> satisfiy any of following condition 
    # if the total number of listened songs in the current genre is larger than 5
    # if the total number of the liked songs in the current genre is larger than 3
    # if the total number of the disliked songs in the current genre is larger than 3
    if interaction_turn_condition:
        num_satisfied_listend_songs = 0
        num_satisfied_liked_songs = 0
        num_satisfied_disliked_songs = 0
        for song_info in interaction_log['listenedSongs']:
            if song_info['genre'] == cur_rec_genre:
                num_satisfied_listend_songs += 1
                if song_info['id'] in interaction_log['likedSongs']:
                    num_satisfied_liked_songs += 1
                if song_info['id'] in interaction_log['dislikedSongs']:
                    num_satisfied_disliked_songs += 1  
        if num_satisfied_listend_songs >= switch_condition['num_listened_songs_condition'] or \
            num_satisfied_liked_songs >= switch_condition['num_liked_songs_condition'] or \
                num_satisfied_disliked_songs >= switch_condition['num_disliked_songs_condition']:
                categorical_attributes = ['genre']
                numerical_attributes = []
        else:
            categorical_attributes = []
    
    # Hard constraint is not satisfied -> Level 2 
    else: 
        categorical_attributes = []
    

    return categorical_attributes, numerical_attributes



def obtain_top_k_critique_with_recommendation_list(top_K, sorted_critique_utility_list, frequent_critiques_satisfied_items_dict,estimated_score_dict):
    topK_critique_item_list = []
    for critique, utility in sorted_critique_utility_list[0:top_K]:
        satisfied_item_list = frequent_critiques_satisfied_items_dict[critique]
        satisfied_item_score_dict = {}
        for item in satisfied_item_list:
            satisfied_item_score_dict[item] = estimated_score_dict[item]
        sorted_satisfied_item_score_list = helper.sort_dict(satisfied_item_score_dict)
        sorted_satisfied_item_list = []
        for item in sorted_satisfied_item_score_list:
            sorted_satisfied_item_list.append(item[0])
            if len(sorted_satisfied_item_list) >= top_K:
                break

        topK_critique_item_list.append({'critique': critique, 'recommendation' : sorted_satisfied_item_list})
    return topK_critique_item_list


def generate_system_critiques_preference_oriented(user_info,estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes):
    # Step 1: Generate a critique array for each item 
    item_critique_arrays, item_critique_arrays_dict = generate_critique_array (item_pool, cur_rec, categorical_attributes, numerical_attributes)

    # Step 2: Find frequent critiques set (Compound & Unit)

    num_critique_sets_dict, rules = apriori(item_critique_arrays, min_support=min_support, min_confidence=min_confidence)

    frequent_critiques_freq_dict = {}
    for num in unit_or_compound:
        for crit, freq in num_critique_sets_dict[num].items():
            frequent_critiques_freq_dict[crit] = freq
    # pp.pprint(frequent_critiques_freq_dict)

    # -------------------------------------------------------
    # --------------------  Apropri   -----------------------
    # -------------------------------------------------------

    # # pp.pprint(rules)

    # # Print out every rule with 2 items on the left hand side,
    # # 1 item on the right hand side, sorted by lift
    # rules_rhs = filter(lambda rule: len(rule.lhs) == 1 and len(rule.rhs) == 1, rules)
    # for rule in sorted(rules_rhs, key=lambda rule: rule.lift, reverse=True):
    #     pass
    #     # print(rule) # Prints the rule and its confidence, support, lift, ...

    # -------------------------------------------------------



    # Step 3: Obtain the set of items that satisfy the critique
    frequent_critiques_satisfied_items_dict = obtain_critique_items_dict(frequent_critiques_freq_dict, item_critique_arrays_dict)
    # pp.pprint(frequent_critiques_satisfied_items_dict)
    # Step 4: Compute critique utility for frequent critiques

    # compatibility_score_dict = recommendation.compute_recommendation_by_MAUT(user_info, item_pool, len(item_pool), categorical_attributes, numerical_attributes)
    user_attribute_frequency = user_info['attribute_frequency']
    sorted_critique_utility_list = compute_critique_utility_preference_oriented(user_attribute_frequency, frequent_critiques_freq_dict,min_support, frequent_critiques_satisfied_items_dict, estimated_score_dict)

    topK_critique_item_list = obtain_top_k_critique_with_recommendation_list(top_K,sorted_critique_utility_list, frequent_critiques_satisfied_items_dict,estimated_score_dict)

    return topK_critique_item_list



def generate_system_critiques_diversity_oriented(user_info, interaction_log,  estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes):
    
    # Switch Mechanism: Determine Categorical (Level 1 - Genre) or Numerical Feature (Level 2) to critique based on the tracked dialogue state
    switch_condition = {}
    switch_condition['num_interaction_turn_condition'] = 3
    switch_condition['num_listened_songs_condition'] = 5
    switch_condition['num_liked_songs_condition'] = 3
    switch_condition['num_disliked_songs_condition'] = 3


    categorical_attributes_for_critiquing, numerical_attributes_for_critiquing = switch_critique_level(interaction_log, cur_rec, categorical_attributes, numerical_attributes, switch_condition)

    
    # Step 1: Generate a critique array for each item 
    item_critique_arrays, item_critique_arrays_dict = generate_critique_array (item_pool, cur_rec, categorical_attributes_for_critiquing, numerical_attributes_for_critiquing)

    # Step 2: Find frequent critiques set (Compound & Unit)

    num_critique_sets_dict, rules = apriori(item_critique_arrays, min_support=min_support, min_confidence=min_confidence)

    frequent_critiques_freq_dict = {}
    for num in unit_or_compound:
        for crit, freq in num_critique_sets_dict[num].items():
            frequent_critiques_freq_dict[crit] = freq
    # pp.pprint(frequent_critiques_freq_dict)



    # Step 3: Obtain the set of items that satisfy the critique
    frequent_critiques_satisfied_items_dict = obtain_critique_items_dict(frequent_critiques_freq_dict, item_critique_arrays_dict)
    # pp.pprint(frequent_critiques_satisfied_items_dict)
    
    
    # Step 4: Compute critique diversity power for frequent critiques
    # diversity_calculation_method = 'dissimilarity' 
    diversity_calculation_method = 'entropy'
    # diversity_calculation_method = 'unexpectedness'

    user_listened_songs = interaction_log['listenedSongs']
    time_helper.print_current_time()
    print('diversity calculation method:', diversity_calculation_method)
    
    sorted_critique_diversity_utility_list = compute_critique_utility_diversity_oriented(diversity_calculation_method, \
        user_listened_songs, item_pool, frequent_critiques_satisfied_items_dict , categorical_attributes, numerical_attributes)


    topK_critique_item_list = obtain_top_k_critique_with_recommendation_list(top_K, sorted_critique_diversity_utility_list, frequent_critiques_satisfied_items_dict,estimated_score_dict)

    return topK_critique_item_list





def generate_system_critiques_personality_adjusted(user_info, interaction_log,  estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes):
    pass