#!/usr/local/bin/python

import numpy as np
from sklearn.decomposition import PCA

# Load csv file
hands = np.loadtxt('hands.csv', delimiter=',')

# Perform PCA
hands_pca = PCA().fit_transform(hands)

# If there are fewer points than dimensions the PCA will automatically remove some columns. 
# They're not needed, but for completeness I readd them
if hands.shape[0] < hands.shape[1]:
    hands_pca = np.append(hands_pca, np.zeros((hands.shape[0], hands.shape[1] - hands.shape[0])), axis=1)

# Store PCA
np.savetxt('hands_pca.csv', hands_pca, fmt="%11.8f", delimiter=',')
