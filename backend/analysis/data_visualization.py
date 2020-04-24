import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.decomposition import PCA
import os


def pca_visualization(combined_pc_df, title_name):
    fig = plt.figure(figsize = (8,8))
    ax = fig.add_subplot(1,1,1) 
    ax.set_xlabel('Principal Component 1', fontsize = 15)
    ax.set_ylabel('Principal Component 2', fontsize = 15)
    ax.set_title(title_name, fontsize = 20)
    labels = combined_pc_df['label'].unique()
    colors = ['r', 'b']
    for label, color in zip(labels,colors):
        indicesToKeep = combined_pc_df['label'] == label
        ax.scatter(combined_pc_df.loc[indicesToKeep, 'PC1'], combined_pc_df.loc[indicesToKeep, 'PC2'], c = color, s = 50)
    ax.legend(labels)
    ax.grid()
    plt.savefig('../data/critique_related/%s.png'%title_name, dpi=400)
    plt.show()

if __name__ == "__main__":
    current_path = os.getcwd()
    l=os.listdir(os.chdir("../data/critique_related/" ))
    filelist=[]
    
    for each_file in l:
        if '.xlsx' in each_file:
            filelist.append(each_file)
    # print(filelist)
    os.chdir(current_path)
    for each_file in filelist:
        combined_pc_df = pd.read_excel("../data/critique_related/"+each_file)
        crit_name = each_file.replace('.xlsx', '')

        pca_visualization(combined_pc_df,crit_name)