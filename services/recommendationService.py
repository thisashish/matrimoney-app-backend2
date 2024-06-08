from surprise import Dataset, Reader, KNNBasic
from surprise.model_selection import train_test_split

def train_collaborative_filtering_model(dataset_path):
    reader = Reader(line_format='user item rating', sep=',')
    data = Dataset.load_from_file(dataset_path, reader=reader)
    trainset, _ = train_test_split(data, test_size=0)

    model = KNNBasic()
    model.fit(trainset)
    return model

def get_recommendations(model, user_id):
    recommendations = model.get_neighbors(model.trainset.to_inner_uid(user_id), k=5)
    recommended_users = [model.trainset.to_raw_uid(uid) for uid in recommendations]
    return recommended_users

if __name__ == "__main__":
    # Example usage for testing
    dataset_path = 'datasets/dataset.csv'  # Update with your dataset path
    model = train_collaborative_filtering_model(dataset_path)
    user_id = input("Enter user ID: ")
    recommendations = get_recommendations(model, user_id)
    print("Recommendations:", recommendations)
