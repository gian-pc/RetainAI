"""
Custom transformers for the ML pipeline.
These classes are needed to load the pickled model (11_production_pipeline.pkl).
"""

from sklearn.base import BaseEstimator, TransformerMixin
import pandas as pd


class ColumnSelector(BaseEstimator, TransformerMixin):
    """
    Selects specific columns from a DataFrame.
    Used in the pipeline to select the 24 features needed by the model.
    """
    def __init__(self, columns):
        self.columns = columns

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X[self.columns]


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Feature engineering transformer.
    Currently a pass-through, but can be extended for future feature engineering.
    """
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        return X
