import pandas as pd
import json

def convert_user_historical_record_from_csv_to_json(user_history_simulated_data):

    user_listened_data = pd.read_csv(user_history_simulated_data, index_col=False)
    user_listened_data.to_json('data/user_history_simulated.json', indent=4, orient='records')
    return user_listened_data


def load_json_data(json_file):

    json_data = []
    with open (json_file, 'r') as file_json:
        json_data = json.load(file_json)

    return json_data
    
def load_user_historical_record_json(user_history_simulated_data):

    user_listened_data = []
    with open (user_history_simulated_data, 'r') as file_user_data:
        user_listened_data = json.load(file_user_data)

    return user_listened_data

def load_user_preference_model_json(user_preference_model_data):
    user_preference_model = []
    with open (user_preference_model_data, 'r') as file_user_data:
        user_preference_model = json.load(file_user_data)

    return user_preference_model


def convert_item_data_from_csv_to_json(item_data):

    item_data_all = pd.read_csv(item_data, index_col=False)
    print(item_data_all)
    item_data_all.to_json('data/item_data.json', indent=4, orient='records')
    return item_data_all

def load_item_data_json(item_data):

    item_data_all = []
    with open (item_data, 'r') as file_item_data:
        item_data_all = json.load(file_item_data)

    return item_data_all