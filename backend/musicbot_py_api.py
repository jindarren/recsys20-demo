import json
import time
from flask import Flask, g
from flask import jsonify, request
from flask_restful import reqparse, Api, Resource
# from flask_httpauth import HTTPTokenAuth

from function import user_modeling, recommendation, system_critiquing
from tool import time_helper
import pprint
import copy


pp = pprint.PrettyPrinter(indent=4)

# Flask declaration
app = Flask(__name__)
api = Api(app)
 
# considered_attributes
categorical_attributes = ['artist','genre']
numerical_attributes = ['popularity', 'danceability', 'energy',  'speechiness', 'tempo', 'valence']
# numerical_attributes = ['popularity', 'danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence']


# 操作（post / get）资源列表
class InitializeUserModel(Resource):
    def get(self):
        start = time.process_time()
        time_helper.print_current_time()
        print("Initialize User Model")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_historical_record = user_profile['user']['preferenceData']['track']
        # initialize the user preference model
        user_initial_preference_value =  user_modeling.initialize_user_preference_value(user_historical_record, categorical_attributes, numerical_attributes)
        user_preference_attribute_frequency = user_modeling.initialize_user_preference_attribute_frequency( categorical_attributes, numerical_attributes)
        user_profile['user']['user_preference_model'] = {'preference_value':user_initial_preference_value, 'attribute_frequency':user_preference_attribute_frequency}
        # initialize the user constraints (empty)
        user_constraint = {}
        user_profile['user']['user_constraints'] =  user_constraint
        #  # initialize the user critique preference (empty)
        user_critique_preference = {}
        user_profile['user']['user_critique_preference'] =  user_critique_preference

        # pp.pprint(user_initial_preference_value)
        
        end = time.process_time()
        time_helper.print_current_time()
        print ('Initialize User Model ---- run time : %ss ' % str(end-start))

        return user_profile

class UpdateUserModel(Resource):
    
    def get(self):
        start = time.process_time()
        time_helper.print_current_time()
        print("Update User Model ")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_interaction_dialog = user_profile['logger']['latest_dialog']
        user_listened_longs = user_profile['logger']['listenedSongs']
        user_model = user_profile['user']
        # update the user model (three parts)
        updated_user_preference_model, updated_user_constraints, updated_user_critique_preference = user_modeling.update_user_model(user_model, \
            user_interaction_dialog, user_listened_longs, categorical_attributes, numerical_attributes)
        user_profile['user']['user_preference_model'] = updated_user_preference_model
        user_profile['user']['user_constraints'] = updated_user_constraints
        user_profile['user']['user_critique_preference'] = updated_user_critique_preference
        
        # update the user interaction log 
        for log in user_interaction_dialog:
            user_profile['logger']['dialog'].append(copy.deepcopy(log))
        
        user_profile['logger']['latest_dialog'] = []
        
        end = time.process_time()
        time_helper.print_current_time()
        print ('Update User Model ---- run time : %ss ' % str(end-start))

        # pp.pprint(user_profile)
        # 资源添加成功，返回201
        return user_profile
 
class GetRec(Resource):
 
    def get(self):

        start = time.process_time()
        time_helper.print_current_time()
        print("Get Recommendation")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_preference_model = user_profile['user']['user_preference_model'] 
        user_critique_preference = user_profile['user']['user_critique_preference'] 
        item_pool = user_profile['vis']
        top_K = 10
        method = 'MAUT_COMPAT' # (1) MAUT (2) COMPAT (3) MAUT_COMPAT
        alpha = 0.5
        recommendations = recommendation.compute_recommendation(user_preference_model, user_critique_preference, item_pool, top_K, categorical_attributes, numerical_attributes, method, alpha)
        recommendation_list = {'recommendation_list': recommendations}
        
        end = time.process_time()
        time_helper.print_current_time()
        print ('Get Recommendation ---- run time : %ss ' % str(end-start))


        return recommendation_list, 201

class GetSysCri(Resource):
 
    def get(self):

        start = time.process_time()
        time_helper.print_current_time()
        print("Get System Critiques")


        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_preference_model = user_profile['user']['user_preference_model'] 
        user_critique_preference = user_profile['user']['user_critique_preference'] 

        user_interaction_log = user_profile['logger']
        item_pool = user_profile['vis']
        cur_rec = user_profile['topRecommendedSong']
        top_K = 10
        unit_or_compound = [1]
        
        method = 'MAUT_COMPAT'
        alpha = 0.5
        estimated_score_dict = recommendation.compute_recommendation(user_preference_model, user_critique_preference, item_pool, top_K, categorical_attributes, numerical_attributes, method, alpha, sort=False)
        
        sys_crit_version = 'diversity_oriented' # preference_oriented / diversity_oriented / personality_adjusted
        sys_crit = None
        if sys_crit_version == 'preference_oriented':
            sys_crit = system_critiquing.generate_system_critiques_preference_oriented(user_preference_model, estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes)
        if sys_crit_version == 'diversity_oriented':
            sys_crit = system_critiquing.generate_system_critiques_diversity_oriented(user_preference_model, user_interaction_log, estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes)
        if sys_crit_version == 'personality_adjusted':
            sys_crit = system_critiquing.generate_system_critiques_personality_adjusted(user_preference_model, user_interaction_log, estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes)

        # pp.pprint(sys_crit)
        sys_crit_with_rec_list = {'sys_crit': sys_crit}

        end = time.process_time()
        time_helper.print_current_time()
        print ('Get System Critiques ---- run time : %ss ' % str(end-start))



        return sys_crit_with_rec_list, 201


# 设置路由，即路由地址为http://127.0.0.1:5000/xxx
api.add_resource(InitializeUserModel, "/initialize_user_model") 
api.add_resource(UpdateUserModel, "/update_user_model") 
api.add_resource(GetRec, "/get_rec")
api.add_resource(GetSysCri, "/get_sys_cri")
 
if __name__ == "__main__":
    server = '127.0.0.1'
    port =  '5000'
    app.run(debug=True, host= server, port=port)
