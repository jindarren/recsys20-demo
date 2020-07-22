import json
import time
from flask import Flask, g, Response
from flask import jsonify, request
from flask_restful import reqparse, Api, Resource
# from flask_httpauth import HTTPTokenAuth

from function import user_modeling, recommendation, system_critiquing, dialog_management
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

class InitializeUserModel(Resource):
    def post(self):
        start = time.process_time()
        time_helper.print_current_time()
        print("Initialize User Model ---- start")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_historical_record = user_profile['user']['preferenceData']['track']

        # initialize the user preference model ** using users' listened history **
        # preference model consists of two parts: attribute frequency and preference value for each attribute
        user_preference_model = user_modeling.initialize_user_preference_model(user_historical_record, categorical_attributes, numerical_attributes)
        user_profile['user']['user_preference_model'] = user_preference_model

        time_helper.print_current_time()
        print("Initialize User Model ---- Part 1: User Preference Model --- Done!")

        # initialize the user critique preference (empty)
        user_critique_preference = []
        user_profile['user']['user_critique_preference'] =  user_critique_preference

        time_helper.print_current_time()
        print("Initialize User Model ---- Part 2: User Critique Preference (empty) --- Done!")

        # initialize the user constraints (empty)
        user_constraint = []
        user_profile['user']['user_constraints'] =  user_constraint

        time_helper.print_current_time()
        print("Initialize User Model ---- Part 3: User Constraints (empty) --- Done!")

        end = time.process_time()
        time_helper.print_current_time()
        print ('Initialize User Model ---- run time : %ss ' % str(end-start))

        return json.dumps(user_profile)

class UpdateUserModel(Resource):
    
    def post(self):
        start = time.process_time()
        time_helper.print_current_time()
        print("Update User Model ---- start")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_interaction_dialog = user_profile['logger']['latest_dialog']
        user_listened_longs = user_profile['logger']['listenedSongs'] # Note: Consider to remove this data since it is necessary to use this info.
        user_model = user_profile['user']
        current_recommended_item = user_profile['topRecommendedSong']
        # update the user model (three parts)
        updated_user_preference_model, updated_user_constraints, updated_user_critique_preference = user_modeling.update_user_model(user_model, \
            user_interaction_dialog, user_listened_longs, current_recommended_item, categorical_attributes, numerical_attributes)
        user_profile['user']['user_preference_model'] = updated_user_preference_model
        user_profile['user']['user_constraints'] = updated_user_constraints
        user_profile['user']['user_critique_preference'] = updated_user_critique_preference

        
        # # update the user interaction log 
        # for log in user_interaction_dialog:
        #     user_profile['logger']['dialog'].append(copy.deepcopy(log))
        
        # user_profile['logger']['latest_dialog'] = []
        
        end = time.process_time()
        time_helper.print_current_time()
        print ('Update User Model ---- run time : %ss ' % str(end-start))

        # pp.pprint(user_profile)
        return json.dumps(user_profile)
 
class GetRec(Resource):
 
    def post(self):

        start = time.process_time()
        time_helper.print_current_time()
        print("Get Recommendation ---- start")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_preference_model = user_profile['user']['user_preference_model'] 
        user_critique_preference = user_profile['user']['user_critique_preference'] 
        user_constraints = user_profile['user']['user_constraints'] 
        item_pool = user_profile['pool']
        new_item_pool = user_profile['new_pool']

        top_K = 20
        method = 'MAUT_COMPAT' # (1) MAUT (2) COMPAT (3) MAUT_COMPAT
        alpha = 0.5 # Linear combination weight: alpha-> weight for MAUT score; 1-alpha -> weight for COMPAT score

        minimal_threshold = 20
        time_helper.print_current_time()
        print("Get Recommendation ---- Method: %s (alpha:%f)." % (method,alpha)) 
         
        topK_recommendations_score_dict = {}
        if len(new_item_pool) > 0:
            topK_recommendations_score_dict = recommendation.compute_recommendation(user_preference_model, user_critique_preference, new_item_pool, top_K, categorical_attributes, numerical_attributes, method, alpha)
        else: 
            filtered_item_pool = recommendation.filter_items_by_user_constraints(user_constraints, item_pool, minimal_threshold,  categorical_attributes, numerical_attributes)
            
            time_helper.print_current_time()
            print("Filter by User Constraints --- after filtering, %d pieces of music left." % len(filtered_item_pool))
            
            if len(filtered_item_pool) > 0:
                topK_recommendations_score_dict = recommendation.compute_recommendation(user_preference_model, user_critique_preference, filtered_item_pool, top_K, categorical_attributes, numerical_attributes, method, alpha)

        topK_recommendation_list = []
        if len(topK_recommendations_score_dict) > 0:
            for rec in topK_recommendations_score_dict:
                topK_recommendation_list.append(rec[0])
        time_helper.print_current_time()
        print("Get Recommendation ---- Obtained top %d recommended items. "% len(topK_recommendation_list)) 
         

        updated_item_pool = []

        if len(new_item_pool) > 0:
            time_helper.print_current_time()
            print("Get Recommendation ---- New Pool: %d songs." % (len(new_item_pool))) 
            time_helper.print_current_time()
            print("Get Recommendation ---- Original Item Pool: %d songs." % (len(item_pool))) 
            integrated_item_pool = new_item_pool + item_pool 
            assert(len(integrated_item_pool) == len(item_pool) + len(new_item_pool))

            max_item_pool_number = min([150, len(integrated_item_pool)])
            updated_item_pool = recommendation.update_recommendation_pool(user_preference_model, user_critique_preference, new_item_pool, integrated_item_pool, max_item_pool_number, categorical_attributes, numerical_attributes, method, alpha)
            print("Get Recommendation ---- Updated Item Pool: %d songs." % (len(updated_item_pool))) 
            
            user_profile['pool'] = updated_item_pool
            user_profile['new_pool'] = []

        
        # print(len(user_profile['pool']))
        recommendation_and_user_profile = {'recommendation_list': topK_recommendation_list, 'user_profile': user_profile}
        
        end = time.process_time()
        time_helper.print_current_time()
        print ('Get Recommendation ---- run time : %ss ' % str(end-start))


        return json.dumps(recommendation_and_user_profile), 201

class GetSysCri(Resource):
 
    def post(self):

        start = time.process_time()
        time_helper.print_current_time()
        print("Get System Critiques ---- start")


        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_preference_model = user_profile['user']['user_preference_model'] 
        user_critique_preference = user_profile['user']['user_critique_preference'] 
        # user_constraints = user_profile['user']['user_constraints'] 
        user_interaction_log = user_profile['logger']
        item_pool = user_profile['pool']
        cur_rec = user_profile['topRecommendedSong']
        top_K = 20
        unit_or_compound = [1]
        
        new_item_pool = user_profile['new_pool']
        item_pool_for_SC = item_pool
        new_item_pool_state = False

        if len(new_item_pool) > 0:
            new_item_pool_state = True
            item_pool_for_SC = new_item_pool

        time_helper.print_current_time()
        print("Get System Critiques ---- Item Pool: %d songs" % len(item_pool_for_SC))


        method = 'MAUT_COMPAT'
        alpha = 0.5
        estimated_score_dict = recommendation.compute_recommendation(user_preference_model, user_critique_preference, item_pool_for_SC, len(item_pool_for_SC), categorical_attributes, numerical_attributes, method, alpha, sort=False)
        time_helper.print_current_time()
        print("Get System Critiques ---- Obtain item utility score by %s method (alpha:%f) --- Done." %(method, alpha))

        # sys_crit_version = json_data['sys_crit_version'] # preference_oriented / diversity_oriented / personality_adjusted
        
        sys_crit_version = json_data['sys_crit_version'] # preference_oriented / diversity_oriented / personality_adjusted
        time_helper.print_current_time()
        print("Get System Critiques ---- System critique generation version: %s." % sys_crit_version)

        state = 'SC_and_Recommendation'
        sys_crit = None
        if sys_crit_version == 'preference_oriented':
            sys_crit = system_critiquing.generate_system_critiques_preference_oriented(user_preference_model, user_critique_preference,estimated_score_dict, item_pool_for_SC, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes)
        if sys_crit_version == 'diversity_oriented':
            state, sys_crit = system_critiquing.generate_system_critiques_diversity_oriented(user_preference_model, user_critique_preference, user_interaction_log, estimated_score_dict, item_pool_for_SC, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes, new_item_pool_state)
        # if sys_crit_version == 'personality_adjusted':
        #     sys_crit = system_critiquing.generate_system_critiques_personality_adjusted(user_preference_model, user_interaction_log, estimated_score_dict, item_pool, cur_rec, top_K, unit_or_compound, categorical_attributes, numerical_attributes)



        updated_item_pool = []

        if len(new_item_pool) > 0:
            time_helper.print_current_time()
            print("Get System Critiques ---- New Pool: %d songs." % (len(new_item_pool))) 
            time_helper.print_current_time()
            print("Get System Critiques ---- Original Item Pool: %d songs." % (len(item_pool))) 
            integrated_item_pool = new_item_pool + item_pool 
            assert(len(integrated_item_pool) == len(item_pool) + len(new_item_pool))

            max_item_pool_number = min([150, len(integrated_item_pool)])
            updated_item_pool = recommendation.update_recommendation_pool(user_preference_model, user_critique_preference, new_item_pool, integrated_item_pool, max_item_pool_number, categorical_attributes, numerical_attributes, method, alpha)
            print("Get System Critiques ---- Updated Item Pool: %d songs." % (len(updated_item_pool))) 
            
            user_profile['pool'] = updated_item_pool
            user_profile['new_pool'] = []
        
        time_helper.print_current_time()
        print(state)
        time_helper.print_current_time()
        pp.pprint(sys_crit)
        sys_crit_with_rec_list = {'state': state, 'result': sys_crit, 'user_profile': user_profile}

        end = time.process_time()
        time_helper.print_current_time()
        print ('Get System Critiques ---- run time : %ss ' % str(end-start))

        return json.dumps(sys_crit_with_rec_list), 201


class TriggerSysCri(Resource):
 
    def post(self):

        start = time.process_time()
        time_helper.print_current_time()
        print("Determine Whether to Trigger System Critiques ---- start")

        json_data = request.get_json(force=True)
        user_profile = json_data['user_profile']
        user_interaction_log = user_profile['logger']
        cur_rec = user_profile['topRecommendedSong']

        results_triggerSC = dialog_management.determine_trigger_sc_or_not(user_interaction_log, cur_rec, categorical_attributes, numerical_attributes)
        
        determination_triggerSC = {'triggerSC': results_triggerSC}

        time_helper.print_current_time()
        print ('Results of Determination of trigger SC : %s.' % determination_triggerSC['triggerSC'])

        end = time.process_time()
        time_helper.print_current_time()
        print ('Determine Whether to Trigger System Critiques ---- run time : %ss ' % str(end-start))

        return json.dumps(determination_triggerSC), 201



api.add_resource(InitializeUserModel, "/initialize_user_model") 
api.add_resource(UpdateUserModel, "/update_user_model") 
api.add_resource(GetRec, "/get_rec")
api.add_resource(GetSysCri, "/get_sys_cri")
api.add_resource(TriggerSysCri, "/trigger_sys_cri")

if __name__ == "__main__":
    server = '127.0.0.1'
    port =  '5000'
    app.run(debug=True, host= server, port=port)
