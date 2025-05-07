
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import sklearn
import joblib
import boto3
import pathlib
from io import StringIO 
import argparse
import joblib
import os
import numpy as np
import pandas as pd

# Loading the model    
def model_fn(model_dir):
    clf = joblib.load(os.path.join(model_dir, "model.joblib"))
    return clf

# Function for making predictions
def predict_fn(input_data, model):
    return model.predict(input_data)

# Starting the execution    
if __name__ == "__main__":

    print("[INFO] Extracting arguments")
    parser = argparse.ArgumentParser()

    # hyperparameters sent by the client are passed as command-line arguments to the script
    parser.add_argument("--n_estimators", type=int, default=100)
    parser.add_argument("--random_state", type=int, default=0)
    parser.add_argument("--max_depth", type=int, default=None)
    parser.add_argument("--min_samples_split", type=int, default=2)

    # Data, model, and output directories
    parser.add_argument("--model-dir", type=str, default=os.environ.get("SM_MODEL_DIR"))
    parser.add_argument("--train", type=str, default=os.environ.get("SM_CHANNEL_TRAIN"))
    parser.add_argument("--test", type=str, default=os.environ.get("SM_CHANNEL_TEST"))
    parser.add_argument("--train-file", type=str, default="train-rain-v1.csv")
    parser.add_argument("--test-file", type=str, default="test-rain-v1.csv")

    args, _ = parser.parse_known_args()

    print("SKLearn Version: ", sklearn.__version__)
    print("Joblib Version: ", joblib.__version__)

    print("[INFO] Reading data")
    print()
    train_df = pd.read_csv(os.path.join(args.train, args.train_file))
    test_df = pd.read_csv(os.path.join(args.test, args.test_file))

    features = list(train_df.columns)
    label = features.pop(-1)  # Assuming the target column is the last column

    print("Building training and testing datasets")
    print()
    X_train = train_df[features]
    X_test = test_df[features]
    y_train = train_df[label]
    y_test = test_df[label]

    print('Feature columns: ')
    print(features)
    print()

    print("Target column is: ", label)
    print()

    print("Data Shape: ")
    print()
    print("---- SHAPE OF TRAINING DATA (85%) ----")
    print(X_train.shape)
    print(y_train.shape)
    print()
    print("---- SHAPE OF TESTING DATA (15%) ----")
    print(X_test.shape)
    print(y_test.shape)
    print()

    print("Training RandomForest Regressor Model for Rainfall Prediction...")
    print()
    model = RandomForestRegressor(
        n_estimators=args.n_estimators, 
        random_state=args.random_state, 
        max_depth=args.max_depth,
        min_samples_split=args.min_samples_split,
        verbose=3, 
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    print()

    model_path = os.path.join(args.model_dir, "model.joblib")
    joblib.dump(model, model_path)
    print("Model persisted at " + model_path)
    print()

    y_pred_test = model.predict(X_test)

    # Use regression metrics for evaluating the model
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_r2 = r2_score(y_test, y_pred_test)

    print()
    print("---- METRICS RESULTS FOR TESTING DATA ----")
    print()
    print("Total Rows are: ", X_test.shape[0])
    print(f'[TESTING] Root Mean Squared Error: {test_rmse:.4f} hours')
    print(f'[TESTING] Mean Absolute Error: {test_mae:.4f} hours')
    print(f'[TESTING] R² Score: {test_r2:.4f}')

    # Feature importance
    feature_importance = pd.DataFrame({
        'Feature': X_train.columns,
        'Importance': model.feature_importances_
    }).sort_values('Importance', ascending=False)

    print("\n---- TOP 10 IMPORTANT FEATURES FOR RAINFALL PREDICTION ----")
    print(feature_importance.head(10))

    # Analyze predictions by time range
    print("\n---- PREDICTION ACCURACY BY TIME RANGE ----")
    # Group predictions by hour ranges
    bins = [0, 1, 3, 6, 12, 24, 48, np.inf]
    labels = ['0-1h', '1-3h', '3-6h', '6-12h', '12-24h', '24-48h', '48h+']
    y_test_binned = pd.cut(y_test, bins=bins, labels=labels)

    for time_range in labels:
        range_indices = y_test_binned == time_range
        if sum(range_indices) > 0:
            range_rmse = np.sqrt(mean_squared_error(
                y_test[range_indices], y_pred_test[range_indices]
            ))
            range_mae = mean_absolute_error(
                y_test[range_indices], y_pred_test[range_indices]
            )
            count = sum(range_indices)
            print(f"Time range {time_range}: {count} samples, RMSE: {range_rmse:.2f}h, MAE: {range_mae:.2f}h")
