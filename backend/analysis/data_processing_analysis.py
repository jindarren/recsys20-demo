
import pandas as pd
import numpy as np
import pprint
import copy

from statistics import mean 
from scipy.stats import entropy

import sys
sys.path.append("..") 
from function import helper

from sklearn.preprocessing import OneHotEncoder,MaxAbsScaler
from sklearn.decomposition import PCA


def preprocessing_constrctur_feature_vectors(user_listened_songs_info_df, crit_item_info_df,combined_songs_info_df, categorical_attributes, numerical_attributes):
    # One Hot Encoder to encode the categorical features
    enc = OneHotEncoder()
    enc.fit(combined_songs_info_df[categorical_attributes])
    user_listened_songs_categorical_onehot_vectors = enc.transform(user_listened_songs_info_df[categorical_attributes]).toarray()
    crit_item_categorical_onehot_vectors = enc.transform(crit_item_info_df[categorical_attributes]).toarray()

    # Standardizing the numerical features
    
    scaler = MaxAbsScaler().fit(combined_songs_info_df[numerical_attributes])
    user_listened_songs_numerical_vectors = scaler.transform(user_listened_songs_info_df[numerical_attributes])
    crit_item_numerical_vectors = scaler.transform(crit_item_info_df[numerical_attributes])

    # combine the vectors for categorical features and numerical features
    user_listened_songs_vectors = np.concatenate((user_listened_songs_categorical_onehot_vectors, user_listened_songs_numerical_vectors), axis=1)
    crit_item_vectors = np.concatenate((crit_item_categorical_onehot_vectors, crit_item_numerical_vectors), axis=1)
    assert(len(user_listened_songs_vectors[0]) == len(crit_item_vectors[0]))

    return user_listened_songs_vectors, crit_item_vectors

def pca_analysis(user_listened_songs_info_df, crit_item_info_df,combined_songs_info_df, categorical_attributes, numerical_attributes):

    user_listened_songs_vectors, crit_item_vectors = preprocessing_constrctur_feature_vectors(user_listened_songs_info_df, crit_item_info_df,combined_songs_info_df, categorical_attributes, numerical_attributes)
    pca = PCA(n_components=2)
    pca.fit(np.concatenate((user_listened_songs_vectors,crit_item_vectors), axis=0))
    user_listened_songs_pc = pca.transform(user_listened_songs_vectors)
    crit_item_pc = pca.transform(crit_item_vectors)

    user_listened_song_pc_df = pd.DataFrame(user_listened_songs_pc, index=user_listened_songs_info_df.index, columns=['PC1', 'PC2'])
    user_listened_song_pc_df['label'] = 'listened'
    criti_item_pc_df = pd.DataFrame(crit_item_pc, index=crit_item_info_df.index,columns=['PC1', 'PC2'])
    criti_item_pc_df['label'] = 'To Recommend'

    combined_pc_df = pd.concat([user_listened_song_pc_df, criti_item_pc_df])
    return combined_pc_df

