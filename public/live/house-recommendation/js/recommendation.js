// ============================================================
// House Recommendation System — Recommendation Algorithms
// Content-Based, Collaborative, and Hybrid Filtering
// ============================================================

(function () {
  "use strict";

  // ── Feature weights for content-based filtering ──
  const FEATURE_WEIGHTS = {
    price: 0.25,
    location: 0.20,
    bhk: 0.15,
    area_sqft: 0.10,
    furnishing: 0.10,
    property_type: 0.10,
    amenities: 0.10
  };

  // ── Normalization helpers ──
  function normalize(value, min, max) {
    if (max === min) return 0;
    return (value - min) / (max - min);
  }

  function getMinMax(arr, key) {
    const values = arr.map(item => item[key]);
    return { min: Math.min(...values), max: Math.max(...values) };
  }

  // ── Cosine Similarity ──
  function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  }

  // ── Jaccard Similarity for amenities (set overlap) ──
  function jaccardSimilarity(setA, setB) {
    const a = new Set(setA);
    const b = new Set(setB);
    const intersection = new Set([...a].filter(x => b.has(x)));
    const union = new Set([...a, ...b]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  // ── Convert property to feature vector ──
  function propertyToVector(property, allProperties) {
    const priceRange = getMinMax(allProperties, "price");
    const areaRange = getMinMax(allProperties, "area_sqft");
    const bhkRange = getMinMax(allProperties, "bhk");

    const locations = [...new Set(allProperties.map(p => p.location))].sort();
    const furnishings = ["Furnished", "Semi-Furnished", "Unfurnished"];
    const types = [...new Set(allProperties.map(p => p.property_type))].sort();

    const vector = [];

    // Numerical features (normalized)
    vector.push(normalize(property.price, priceRange.min, priceRange.max));
    vector.push(normalize(property.area_sqft, areaRange.min, areaRange.max));
    vector.push(normalize(property.bhk, bhkRange.min, bhkRange.max));

    // One-hot encode location
    locations.forEach(loc => {
      vector.push(property.location === loc ? 1 : 0);
    });

    // One-hot encode furnishing
    furnishings.forEach(f => {
      vector.push(property.furnishing === f ? 1 : 0);
    });

    // One-hot encode property type
    types.forEach(t => {
      vector.push(property.property_type === t ? 1 : 0);
    });

    return vector;
  }

  // ────────────────────────────────────────────────────────────
  // CONTENT-BASED FILTERING
  // Find properties similar to a given property
  // ────────────────────────────────────────────────────────────
  function contentBasedRecommend(targetProperty, allProperties, topN = 10) {
    const targetVector = propertyToVector(targetProperty, allProperties);

    const similarities = allProperties
      .filter(p => p.id !== targetProperty.id)
      .map(p => {
        const vector = propertyToVector(p, allProperties);
        const vectorSim = cosineSimilarity(targetVector, vector);
        const amenitySim = jaccardSimilarity(targetProperty.amenities, p.amenities);

        // Weighted combination of vector similarity and amenity similarity
        const totalSim = vectorSim * 0.75 + amenitySim * 0.25;

        return {
          ...p,
          similarity_score: Math.round(totalSim * 100) / 100
        };
      })
      .sort((a, b) => b.similarity_score - a.similarity_score);

    return similarities.slice(0, topN);
  }

  // ────────────────────────────────────────────────────────────
  // PREFERENCE-BASED FILTERING
  // Match properties to user input preferences
  // ────────────────────────────────────────────────────────────
  function preferenceBasedRecommend(preferences, allProperties, topN = 12) {
    const {
      budgetMin = 0,
      budgetMax = Infinity,
      locations = [],
      bhk = [],
      amenities = [],
      furnishing = [],
      propertyType = []
    } = preferences;

    const scored = allProperties.map(p => {
      let score = 0;
      let maxScore = 0;

      // Budget match (0-30 points)
      maxScore += 30;
      if (p.price >= budgetMin && p.price <= budgetMax) {
        score += 30;
      } else {
        // Partial score based on proximity
        const midBudget = (budgetMin + budgetMax) / 2;
        const budgetRange = budgetMax - budgetMin || 1;
        const distance = Math.abs(p.price - midBudget) / budgetRange;
        score += Math.max(0, 30 * (1 - distance));
      }

      // Location match (0-25 points)
      maxScore += 25;
      if (locations.length === 0 || locations.includes(p.location)) {
        score += 25;
      }

      // BHK match (0-20 points)
      maxScore += 20;
      if (bhk.length === 0 || bhk.includes(p.bhk)) {
        score += 20;
      } else {
        // Partial score for nearby BHK
        const minDiff = Math.min(...bhk.map(b => Math.abs(b - p.bhk)));
        score += Math.max(0, 20 * (1 - minDiff / 4));
      }

      // Amenities match (0-15 points)
      maxScore += 15;
      if (amenities.length > 0) {
        const matchCount = amenities.filter(a => p.amenities.includes(a)).length;
        score += (matchCount / amenities.length) * 15;
      } else {
        score += 15;
      }

      // Furnishing match (0-5 points)
      maxScore += 5;
      if (furnishing.length === 0 || furnishing.includes(p.furnishing)) {
        score += 5;
      }

      // Property type match (0-5 points)
      maxScore += 5;
      if (propertyType.length === 0 || propertyType.includes(p.property_type)) {
        score += 5;
      }

      const relevanceScore = Math.round((score / maxScore) * 100) / 100;

      return {
        ...p,
        similarity_score: relevanceScore
      };
    });

    return scored
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, topN);
  }

  // ────────────────────────────────────────────────────────────
  // COLLABORATIVE FILTERING
  // Recommend based on similar users' preferences
  // ────────────────────────────────────────────────────────────
  function collaborativeRecommend(activeUserRatings, allUsers, allProperties, topN = 10) {
    // Build the user-item interaction matrix
    const allPropertyIds = allProperties.map(p => p.id);

    // Convert active user ratings to a vector
    const activeVector = allPropertyIds.map(id => activeUserRatings[id] || 0);

    // Find similar users
    const userSimilarities = allUsers.map(user => {
      const userVector = allPropertyIds.map(id => user.ratings[id] || 0);
      return {
        user,
        similarity: cosineSimilarity(activeVector, userVector)
      };
    }).filter(u => u.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);

    // Predict ratings for unseen properties
    const ratedProperties = new Set(Object.keys(activeUserRatings).map(Number));
    const predictions = {};

    allPropertyIds.forEach(propId => {
      if (ratedProperties.has(propId)) return;

      let weightedSum = 0;
      let similaritySum = 0;

      userSimilarities.forEach(({ user, similarity }) => {
        if (user.ratings[propId]) {
          weightedSum += similarity * user.ratings[propId];
          similaritySum += Math.abs(similarity);
        }
      });

      if (similaritySum > 0) {
        predictions[propId] = weightedSum / similaritySum;
      }
    });

    // Sort by predicted rating and return top N
    return Object.entries(predictions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topN)
      .map(([propId, predictedRating]) => {
        const property = allProperties.find(p => p.id === parseInt(propId));
        return {
          ...property,
          similarity_score: Math.round((predictedRating / 5) * 100) / 100,
          predicted_rating: Math.round(predictedRating * 10) / 10
        };
      });
  }

  // ────────────────────────────────────────────────────────────
  // HYBRID RECOMMENDATION
  // Combine content-based and collaborative filtering
  // ────────────────────────────────────────────────────────────
  function hybridRecommend(targetProperty, activeUserRatings, allUsers, allProperties, topN = 10) {
    const contentResults = contentBasedRecommend(targetProperty, allProperties, topN * 2);
    const collabResults = collaborativeRecommend(activeUserRatings, allUsers, allProperties, topN * 2);

    const combined = {};

    // Weight: 60% content-based, 40% collaborative
    contentResults.forEach(p => {
      combined[p.id] = {
        ...p,
        content_score: p.similarity_score,
        collab_score: 0,
        similarity_score: p.similarity_score * 0.6
      };
    });

    collabResults.forEach(p => {
      if (combined[p.id]) {
        combined[p.id].collab_score = p.similarity_score;
        combined[p.id].similarity_score += p.similarity_score * 0.4;
      } else {
        combined[p.id] = {
          ...p,
          content_score: 0,
          collab_score: p.similarity_score,
          similarity_score: p.similarity_score * 0.4
        };
      }
    });

    return Object.values(combined)
      .map(p => ({
        ...p,
        similarity_score: Math.round(p.similarity_score * 100) / 100
      }))
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, topN);
  }

  // ── Export ──
  window.Recommend = {
    contentBased: contentBasedRecommend,
    preferenceBased: preferenceBasedRecommend,
    collaborative: collaborativeRecommend,
    hybrid: hybridRecommend,
    cosineSimilarity,
    jaccardSimilarity
  };
})();
