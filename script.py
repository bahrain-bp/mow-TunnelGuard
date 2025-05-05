
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score  # Changed to regression metrics
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

#loading the model    
def model_fn(model_dir):
    clf = joblib.load(os.path.join(model_dir, "model.joblib"))
    return clf

# Starting the execution    
if __name__ == "__main__":

    print("[INFO] Extracting arguments")
    parser = argparse.ArgumentParser()

    # hyperparameters sent by the client are passed as command-line arguments to the script. For RF
    parser.add_argument("--n_estimators", type=int, default=100)
    parser.add_argument("--random_state", type=int, default=0)

    # Data, model, and output directories
    parser.add_argument("--model-dir", type=str, default=os.environ.get("SM_MODEL_DIR"))
    parser.add_argument("--train", type=str, default=os.environ.get("SM_CHANNEL_TRAIN"))
    parser.add_argument("--test", type=str, default=os.environ.get("SM_CHANNEL_TEST"))
    parser.add_argument("--train-file", type=str, default="train-v1.csv")
    parser.add_argument("--test-file", type=str, default="test-v1.csv")

    args, _ = parser.parse_known_args()

    print("SKLearn Version: ", sklearn.__version__)
    print("Joblib Version: ", joblib.__version__)

    print("[INFO] Reading data")
    print()
    train_df = pd.read_csv(os.path.join(args.train, args.train_file))
    test_df = pd.read_csv(os.path.join(args.test, args.test_file))

    features = list(train_df.columns)
    label = features.pop(-1)

    print("Building training and testing datasets")
    print()
    X_train = train_df[features]
    X_test = test_df[features]
    y_train = train_df[label]
    y_test = test_df[label]


    print('Column order: ')
    print(features)
    print()

    print("Label column is: ",label)
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


    print("Training RandomForest Model.....")
    print()
    model = RandomForestRegressor(n_estimators=args.n_estimators, random_state=args.random_state, verbose=3, n_jobs=-1)
    model.fit(X_train, y_train)
    print()


    model_path = os.path.join(args.model_dir, "model.joblib")
    joblib.dump(model, model_path)
    print("Model persisted at " + model_path)
    print()


    y_pred_test = model.predict(X_test)

    # UPDATED: Use regression metrics instead of classification metrics
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_r2 = r2_score(y_test, y_pred_test)

    print()
    print("---- METRICS RESULTS FOR TESTING DATA ----")
    print()
    print("Total Rows are: ", X_test.shape[0])
    print(f'[TESTING] Root Mean Squared Error: {test_rmse:.4f}')
    print(f'[TESTING] Mean Absolute Error: {test_mae:.4f}')
    print(f'[TESTING] R² Score: {test_r2:.4f}')

    # Feature importance
    feature_importance = pd.DataFrame({
        'Feature': X_train.columns,
        'Importance': model.feature_importances_
    }).sort_values('Importance', ascending=False)

    print("\n---- TOP 10 IMPORTANT FEATURES ----")
    print(feature_importance.head(10))
