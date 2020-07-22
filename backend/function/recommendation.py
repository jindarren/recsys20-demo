import pandas as pd
import numpy as np
import pprint
import copy
from function import helper 
from tool import time_helper

pp = pprint.PrettyPrinter(indent=4)
# ------------------------------------------------------------------
#  Obtain Attribute Weigth (normalized by attribute frequency)
# ------------------------------------------------------------------
def obtain_attribute_weight(user_pref_attribute_frequency):
    user_pref_attribute_weight_dict = {}
    frequency_sum = sum(user_pref_attribute_frequency.values())
    for attr, value in user_pref_attribute_frequency.items():
        user_pref_attribute_weight_dict[attr] = value/frequency_sum
    # pp.pprint(user_pref_attribute_weight_dict)
    return user_pref_attribute_weight_dict
# ------------------------------------------------------------------
#  Value function
# ------------------------------------------------------------------
def categorical_attributes_value_function(user_pref_v, item_v):
    if item_v in user_pref_v.keys():
        # return user_pref_v[item_v]/sum(user_pref_v.values())
        return 1
    else:
        return 0

def numerical_attributes_value_function(user_pref_v, item_v, attribute):

    # step 1: find the interval that contains the item's attribute value
    value_interval_label = helper.get_numerical_attribute_interval_label(attribute, item_v)

    # step 2: compute the sum of preference value 
    user_pref_v_sum = sum(user_pref_v.values())

    # step 3: probability of preference value
    if user_pref_v[value_interval_label]> 0:
        return user_pref_v[value_interval_label]/user_pref_v_sum
    else:
        return 0
    return 1



# ------------------------------------------------------------------
# Fliter By User Constraints Before Computing Recommendations
# ------------------------------------------------------------------

def filter_items_by_user_constraints(user_constraints, item_pool, minimal_threshold,  categorical_attributes, numerical_attributes):
    
    # revise

    filtered_item_pool = copy.deepcopy(item_pool)
    filter_by_top_critique = False

    for critique_unit_dict in user_constraints:
        filtered_id_list = []
        attr = critique_unit_dict['attribute']
        crit_direction = critique_unit_dict['crit_direction']
        crit_value = ''
        if attr in numerical_attributes:
            crit_value = critique_unit_dict['value']
        time_helper.print_current_time()
        print(critique_unit_dict)
        if attr in categorical_attributes:
            for item in filtered_item_pool:
                if type(crit_direction) == str:
                    if item[attr].lower() != crit_direction.lower():
                        filtered_id_list.append(item['id'])
                if type(crit_direction) == list:
                    if item[attr] not in crit_direction:
                        filtered_id_list.append(item['id'])

        if attr in numerical_attributes:

            attribut_interval, interval_label = helper.get_numerical_attribute_intervalindex(attr)
            intervals = pd.IntervalIndex.from_breaks(attribut_interval, closed='left')

            cur_interval_find = list(intervals.contains(crit_value))
            cur_index = cur_interval_find.index(True)
            # print(cur_index)

            for item in filtered_item_pool:
                
                item_interval_find = list(intervals.contains(item[attr]))
                item_index = item_interval_find.index(True)
                satisfied_flag = False

                assert len(cur_interval_find) == len(intervals)

                if item_index == cur_index and crit_direction == 'similar':
                    satisfied_flag = True

                # case 1: current critiqued item value has been already the lowest range - allows to return items within same range
                if cur_index == 0:
                    if item_index <= cur_index and crit_direction == 'lower':
                        # print(item_index)
                        satisfied_flag = True

                # case 2: current critiqued item value has been already the highest range - allows to return items within same range
                elif cur_index >= len(cur_interval_find)-2: 
                    if item_index >= cur_index and crit_direction == 'higher':
                        satisfied_flag = True

                else:
                    if item_index < cur_index and crit_direction == 'lower':
                        satisfied_flag = True
                        # print(item_index)
                    if item_index > cur_index and crit_direction == 'higher':
                        satisfied_flag = True


                if satisfied_flag == False:
                    filtered_id_list.append(item['id'])


        updated_filtered_item_pool = []
        for item in filtered_item_pool:
            if item['id'] not in filtered_id_list:
                updated_filtered_item_pool.append(item)

        print(len(filtered_item_pool))
        print(len(updated_filtered_item_pool))

        if filter_by_top_critique and len(updated_filtered_item_pool) < minimal_threshold:
            return filtered_item_pool

        else:
            filtered_item_pool = copy.deepcopy(updated_filtered_item_pool)
            filter_by_top_critique = True
    

    return filtered_item_pool


# ------------------------------------------------------------------
# Multi-attribute Utility Theory (MAUT) : Get Utility for each items
# ------------------------------------------------------------------

def compute_recommendation_by_MAUT(user_preference_model, item_pool, top_K, categorical_attributes, numerical_attributes, sort=True):
    # based on user preference model and item value
    # use MAUT to estimate the user's preference for each item

    user_pref_attribute_frequency = user_preference_model['attribute_frequency']
    user_pref_preference_value= user_preference_model['preference_value']

    # item utility
    item_utility_dict = {}

    # compute the attribute weight (normalization)-> the user's attribute preference
    user_pref_attribute_weight_dict = obtain_attribute_weight(user_pref_attribute_frequency)

    # user preference to item w.r.t. each attribute
    user_item_preference_value_dict = {}

    for each_item in item_pool:
        item_id = each_item['id']
        item_utility = 0
        # Step 1: Obtain the value for each attributes
        # 1. Categorical Attributes
        for attr in categorical_attributes:
            user_item_preference_value_dict[attr] = categorical_attributes_value_function(user_pref_preference_value[attr], each_item[attr])
           
        # 2. Numerical Attributes
        for attr in numerical_attributes:
            user_item_preference_value_dict[attr] = numerical_attributes_value_function(user_pref_preference_value[attr], each_item[attr], attr)

        
        # Step 2: Calculate the utility
        # 1. Categorical Attributes
        for attr in categorical_attributes:
            item_utility = item_utility + user_pref_attribute_weight_dict[attr] * user_item_preference_value_dict[attr]
        # 2. Numerical Attributes
        for attr in numerical_attributes:
            item_utility = item_utility + user_pref_attribute_weight_dict[attr] * user_item_preference_value_dict[attr]
        
        item_utility_dict[item_id] = item_utility
    
    time_helper.print_current_time()
    print("Get Recommendation ---- Compute recommendation Multi-attribute Utility score (MAUT) ---- Done.") 
    if sort:
        sorted_item_utility_list = helper.sort_dict(item_utility_dict)
        # pp.pprint(sorted_item_utility_list)
        top_K_recommmendation_list = sorted_item_utility_list[0:top_K]

        return top_K_recommmendation_list
    else:
        return item_utility_dict


def update_based_on_satisfiability(attr, satisfiability, satisfied_critique_attribute_list, unsatisfied_critique_attribute_list):
    if satisfiability:
        satisfied_critique_attribute_list.append(attr)
        if attr in unsatisfied_critique_attribute_list:
            unsatisfied_critique_attribute_list.remove(attr)
    else:
        if attr not in unsatisfied_critique_attribute_list:
            unsatisfied_critique_attribute_list.append(attr)
    return satisfied_critique_attribute_list, unsatisfied_critique_attribute_list

#     
def compute_recommendation_compatibility_score(user_critique_preference, item_pool, top_K, categorical_attributes, numerical_attributes, sort=True):
    
    # based on user critique preference and item value
    # calculate the compatibility score for each item

    # item compatibility score
    item_compatibility_score_dict = {}

    categorical_critique_dict, numerical_critique_dict = helper.convert_to_critique_preference_dict(user_critique_preference)

    for each_item in item_pool:
        item_id = each_item['id']
        item_compatibility_score = 0


        satisfied_critique_attribute_list = []
        unsatisfied_critique_attribute_list = []

        # 1. Categorical Attributes
        for attr in categorical_critique_dict.keys():
            critique_on_attribute = categorical_critique_dict[attr]['pos']
            if each_item[attr] in critique_on_attribute:
                satisfied_critique_attribute_list.append(attr)
            else:
                unsatisfied_critique_attribute_list.append(attr)

        # 2. Numerical Attributes
        for attr in numerical_critique_dict.keys():
            critique_on_attribute = numerical_critique_dict[attr]       
            if each_item[attr] > critique_on_attribute[0] and each_item[attr] < critique_on_attribute[1]:
                satisfied_critique_attribute_list.append(attr)
            else:
                unsatisfied_critique_attribute_list.append(attr)

     
        if len(satisfied_critique_attribute_list) > 0:
            item_compatibility_score = len(satisfied_critique_attribute_list) / (len(satisfied_critique_attribute_list)+len(unsatisfied_critique_attribute_list))
        item_compatibility_score_dict[item_id] = item_compatibility_score
    
    # pp.pprint(item_compatibility_score_dict)

    time_helper.print_current_time()
    print("Get Recommendation ---- Compute recommendation compatibility score (COMPAT) ---- Done.") 
         
    if sort:
        sorted_item_compatibility_score_list = helper.sort_dict(item_compatibility_score_dict)
        top_K_recommmendation_list = sorted_item_compatibility_score_list[0:top_K]
        return top_K_recommmendation_list
    else:
        return item_compatibility_score_dict                

# Version 1: 
# def compute_recommendation_compatibility_score(user_critique_preference, item_pool, top_K, categorical_attributes, numerical_attributes, sort=True):
    
#     # based on user critique preference and item value
#     # calculate the compatibility score for each item

#     # item compatibility score
#     item_compatibility_score_dict = {}

#     for each_item in item_pool:
#         item_id = each_item['id']
#         item_compatibility_score = 0


#         satisfied_critique_attribute_list = []
#         unsatisfied_critique_attribute_list = []

#         for crit_unit in reversed(user_critique_preference):
#             if crit_unit['pos_or_neg'] == 'neg':
#                 continue

#             # Step 1: Obtain the value for each critique
#             attr = crit_unit['attribute']
#             crit_direction = crit_unit['crit_direction']
#             value = 0
#             if attr in numerical_attributes:
#                 value = crit_unit['value']

#             # Step 2: check the satisfiability
#             if attr in satisfied_critique_attribute_list:
#                 pass
#             else:
#                 # 1. Categorical Attributes
#                 if attr in categorical_attributes:
#                     satisfiability = False

#                     if type(crit_direction) == str and each_item[attr] == crit_direction:
#                         satisfiability = True
#                     if type(crit_direction) == list and each_item[attr] in crit_direction:
#                         satisfiability = True
                       
#                     satisfied_critique_attribute_list, unsatisfied_critique_attribute_list = update_based_on_satisfiability\
#                         (attr,satisfiability, satisfied_critique_attribute_list, unsatisfied_critique_attribute_list)
#                     # print('sat:',satisfied_critique_attribute_list)
#                     # print('unsat:',unsatisfied_critique_attribute_list)
#                 # 2. Numerical Attributes
#                 if attr in numerical_attributes:
#                     satisfiability = False
#                     if crit_direction == 'lower':
#                         satisfiability = True if each_item[attr] < value else False
#                     if crit_direction == 'higher':
#                         satisfiability = True if each_item[attr] > value else False
#                     if crit_direction == 'similar':
#                         item_value_interval_label = helper.get_numerical_attribute_interval_label(attr, each_item[attr])
#                         crit_value_interval_label = helper.get_numerical_attribute_interval_label(attr, value)
#                         satisfiability = True if item_value_interval_label ==  crit_value_interval_label else False
                    

#                     satisfied_critique_attribute_list, unsatisfied_critique_attribute_list = update_based_on_satisfiability\
#                         (attr,satisfiability, satisfied_critique_attribute_list, unsatisfied_critique_attribute_list)
#                     # print('sat:',satisfied_critique_attribute_list)
#                     # print('unsat:',unsatisfied_critique_attribute_list)
     
#         if len(satisfied_critique_attribute_list) > 0:
#             item_compatibility_score = len(satisfied_critique_attribute_list) / len(satisfied_critique_attribute_list)+len(unsatisfied_critique_attribute_list)
#         item_compatibility_score_dict[item_id] = item_compatibility_score
    


#     time_helper.print_current_time()
#     print("Get Recommendation ---- Compute recommendation compatibility score (COMPAT) ---- Done.") 
         
#     if sort:
#         sorted_item_compatibility_score_list = helper.sort_dict(item_compatibility_score_dict)
#         top_K_recommmendation_list = sorted_item_compatibility_score_list[0:top_K]
#         return top_K_recommmendation_list
#     else:
#         return item_compatibility_score_dict



def compute_recommendation(user_preference_model, user_critique_preference, item_pool, top_K, categorical_attributes, numerical_attributes, method, alpha=0.5, sort=True):

    if method == 'MAUT':
        top_K_recommmendation_list = compute_recommendation_by_MAUT(user_preference_model, item_pool, top_K, categorical_attributes, numerical_attributes,sort)
        return top_K_recommmendation_list

    if method == 'COMPAT':
        top_K_recommmendation_list = compute_recommendation_compatibility_score(user_critique_preference, item_pool, top_K, categorical_attributes, numerical_attributes, sort)
        return top_K_recommmendation_list

    if method == 'MAUT_COMPAT':
        item_maut_score_dict = compute_recommendation_by_MAUT(user_preference_model, item_pool, len(item_pool), categorical_attributes, numerical_attributes, sort=False )
        item_compatibility_score_dict = compute_recommendation_compatibility_score(user_critique_preference, item_pool, len(item_pool), categorical_attributes, numerical_attributes, sort=False )

        integrated_score_dict = {}
        for item, maut_score in item_maut_score_dict.items():
            integrated_score = alpha * maut_score + (1-alpha) * item_compatibility_score_dict[item]
            integrated_score_dict[item] = integrated_score
        if sort :
            sorted_integrated_score_list = helper.sort_dict(integrated_score_dict)
            top_K_recommmendation_list = sorted_integrated_score_list[0:top_K]
            return top_K_recommmendation_list
        else:
            return integrated_score_dict

def update_recommendation_pool(user_preference_model, user_critique_preference, new_item_pool, integrated_item_pool, max_item_pool_number, categorical_attributes, numerical_attributes, method, alpha):

    sorted_estimated_score_dict = compute_recommendation(user_preference_model, user_critique_preference, integrated_item_pool, len(integrated_item_pool), categorical_attributes, numerical_attributes, method, alpha)
    
    integrated_item_pool_dict = {}
    new_item_pool_dict = {}

    for item in integrated_item_pool:
        integrated_item_pool_dict[item['id']] = item
    for item in new_item_pool:
        new_item_pool_dict[item['id']] = item

    max_item_pool_list = []
    for rec in sorted_estimated_score_dict:
        max_item_pool_list.append(rec[0])

    new_sorted_max_item_pool_list = [] ## make sure new item in the top list
    item_not_in_new_item_pool_list = []
    for item_id in max_item_pool_list:
        if item_id in new_item_pool_dict:
            new_sorted_max_item_pool_list.append(new_item_pool_dict[item_id])
        else:
            item_not_in_new_item_pool_list.append(integrated_item_pool_dict[item_id])
    


    for item in item_not_in_new_item_pool_list:
        new_sorted_max_item_pool_list.append(item)
        if len(new_sorted_max_item_pool_list) == max_item_pool_number:
            break

    # print(len(new_sorted_max_item_pool_list))
    
    updated_item_pool = new_sorted_max_item_pool_list
    # updated_item_pool_id = []
    # for item_id in new_sorted_max_item_pool_list:
    #     updated_item_pool_id.append(item_id)
    #     updated_item_pool.append(integrated_item_pool_dict[item_id])

    # print(updated_item_pool)
   
    return copy.deepcopy(updated_item_pool)

