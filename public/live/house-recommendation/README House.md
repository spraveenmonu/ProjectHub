# 🏠 House Recommendation System

A content-based and collaborative filtering house recommendation system built as a final year AI & Data Science project. The system suggests houses/properties to users based on their preferences (budget, location, amenities) and behavior, similar to how real estate platforms personalize listings.

---

## 📌 Project Overview

Real estate platforms like 99acres, Zillow, and MagicBricks help buyers find relevant properties among thousands of listings. This project builds a simplified house recommendation engine using:

- **Content-Based Filtering** — recommends houses similar to ones a user liked, based on features like price, location, area (sq. ft.), number of bedrooms, amenities, etc.
- **Collaborative Filtering** — recommends houses based on preferences of similar users (using cosine similarity / matrix factorization on user interactions/ratings).

---

## 🎯 Objectives

- Build a system that predicts and recommends houses a user is likely to be interested in.
- Apply data preprocessing, feature engineering, and similarity computation techniques on real estate data.
- Provide a simple, interactive interface where users can filter and get personalized house recommendations.

---

## 🛠️ Tech Stack

| Component        | Technology                          |
|-------------------|--------------------------------------|
| Language          | Python 3.x                          |
| Data Handling     | Pandas, NumPy                       |
| ML / Similarity   | Scikit-learn (Cosine Similarity, StandardScaler, KNN) |
| Visualization     | Matplotlib, Seaborn                 |
| Interface         | Streamlit (web app)                 |
| Dataset           | Kaggle House Price / Real Estate Dataset (e.g., "House Prices", "Real Estate Listings") |

---

## 📂 Project Structure

```
house-recommendation-system/
│
├── data/
│   ├── houses.csv              # Property listings (price, location, area, bhk, amenities)
│   └── user_interactions.csv   # (Optional) user views/likes/ratings on properties
│
├── notebooks/
│   └── data_exploration.ipynb
│
├── src/
│   ├── preprocessing.py        # Data cleaning & feature engineering
│   ├── content_based.py        # Content-based filtering logic
│   ├── collaborative.py        # Collaborative filtering logic
│   └── recommend.py            # Combined recommendation function
│
├── app.py                      # Streamlit web app
├── requirements.txt
└── README.md
```

---

## ⚙️ How It Works

1. **Data Preprocessing**
   - Clean listing data: handle missing values, standardize price/area units, encode categorical features (location, property type, furnishing status).
   - Normalize numerical features (price, area, BHK) for fair similarity comparison.

2. **Content-Based Filtering**
   - Convert house features (location, price range, BHK, amenities) into feature vectors.
   - Compute cosine similarity or use KNN between houses.
   - Recommend houses most similar to a house/property the user selected or their input preferences (budget, location, BHK).

3. **Collaborative Filtering** *(if user interaction data is available)*
   - Build a user-property interaction matrix (views, likes, ratings).
   - Use similarity scores or matrix factorization (SVD) to predict interest in unseen properties.
   - Recommend top properties predicted to interest a similar user group.

4. **Hybrid Recommendation (Optional Enhancement)**
   - Combine content-based filtering (feature match) with collaborative filtering (user behavior) for more accurate results.
   - Handles the "cold start" problem for new users with no interaction history.

---

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/house-recommendation-system.git
   cd house-recommendation-system
   ```

2. **Create a virtual environment (optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Streamlit app**
   ```bash
   streamlit run app.py
   ```

5. Open the local URL shown in the terminal (usually `http://localhost:8501`) to use the app.

---

## 📊 Sample requirements.txt

```
pandas
numpy
scikit-learn
streamlit
matplotlib
seaborn
```

---

## 🖥️ Usage

- Enter your preferences: budget range, preferred location, number of bedrooms (BHK), and desired amenities.
- Alternatively, select a house you like, and the system finds similar listings.
- The system returns a ranked list of top N recommended houses with key details (price, location, area, similarity score).
- View comparison charts (price vs. area, location-wise distribution) for better decision-making.

---

## 📈 Results / Evaluation

- Content-based recommendations evaluated using similarity scores and manual relevance checks.
- If collaborative filtering is used, evaluated with metrics such as **RMSE** / **MAE** on predicted vs actual user ratings.
- Achieved relevant, budget-appropriate recommendations on the test dataset.

*(Add your actual results/screenshots here once you run the model.)*

---

## 🔮 Future Enhancements

- Integrate real-time property listings via a real estate API.
- Add map-based visualization (using Folium) to show recommended houses on a map.
- Incorporate deep learning-based embeddings for more nuanced similarity (e.g., using Autoencoders).
- Add user login with saved preferences and interaction history.
- Deploy the app on Streamlit Cloud / Heroku for public access.

---

## 👤 Author

**[Your Name]**
Final Year — AI & Data Science
[Your College Name]

---

## 📄 License

This project is developed for academic purposes as part of a final year college project.
