// Recipe related functions

// Initialize recipe functionality once DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize local storage with sample recipes if empty
  initializeRecipes();

  // Load recipes for homepage
  const featuredContainer = document.getElementById('featured-recipes-container');
  if (featuredContainer) {
    displayRecipes('featured-recipes-container', getFeaturedRecipes());
  }
  
  const recentContainer = document.getElementById('recent-recipes-container');
  if (recentContainer) {
    displayRecipes('recent-recipes-container', getRecentRecipes());
  }
  
  // Load recipe details if on recipe page
  const recipeDetail = document.querySelector('.recipe-detail');
  if (recipeDetail) {
    const recipeId = getRecipeIdFromUrl();
    if (recipeId) {
      displayRecipeDetails(recipeId);
      
      // Initialize save recipe button
      const saveRecipeBtn = document.getElementById('save-recipe');
      if (saveRecipeBtn) {
        saveRecipeBtn.addEventListener('click', function() {
          saveRecipe(recipeId);
        }
  ];
}

// Display recipes in the given container
function displayRecipes(containerId, recipes = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '';
  
  if (recipes.length === 0) {
    container.innerHTML = '<p class="no-results">No recipes found</p>';
    return;
  }
  
  recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.classList.add('recipe-card');
    
    // Calculate average rating
    const avgRating = recipe.ratings && recipe.ratings.length > 0 
      ? recipe.ratings.reduce((sum, rating) => sum + rating, 0) / recipe.ratings.length 
      : 0;
    
    const totalTime = recipe.prepTime + recipe.cookTime;
    
    recipeCard.innerHTML = `
      <img src="${recipe.image || 'img/recipe-placeholder.jpg'}" alt="${recipe.title}">
      <div class="recipe-content">
        <h3>${recipe.title}</h3>
        <p>${recipe.description.substring(0, 100)}${recipe.description.length > 100 ? '...' : ''}</p>
        <div class="recipe-meta">
          <span><i class="far fa-clock"></i> ${totalTime} mins</span>
          <span><i class="fas fa-chart-line"></i> ${recipe.difficulty}</span>
        </div>
        <div class="recipe-rating">
          ${getStarRating(avgRating)}
        </div>
        <a href="recipe.html?id=${recipe.id}" class="btn">View Recipe</a>
      </div>
    `;
    
    container.appendChild(recipeCard);
  });
}

// Display recipe details
function displayRecipeDetails(recipeId) {
  const recipes = getAllRecipes();
  const recipe = recipes.find(r => r.id == recipeId);
  
  if (!recipe) {
    document.querySelector('main').innerHTML = '<div class="container"><p class="error">Recipe not found</p></div>';
    return;
  }
  
  // Update title and meta information
  document.title = `${recipe.title} - Food Recipe System`;
  document.querySelector('.recipe-title').textContent = recipe.title;
  document.querySelector('.recipe-image').src = recipe.image || 'img/recipe-placeholder.jpg';
  document.querySelector('.prep-time').textContent = recipe.prepTime;
  document.querySelector('.cook-time').textContent = recipe.cookTime;
  document.querySelector('.servings').textContent = recipe.servings;
  document.querySelector('.difficulty').textContent = recipe.difficulty;
  
  // Update description
  document.querySelector('.recipe-description').textContent = recipe.description;
  
  // Update ingredients
  const ingredientsList = document.querySelector('.ingredients-list');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });
  
  // Update instructions
  const instructionsList = document.querySelector('.instructions-list');
  instructionsList.innerHTML = '';
  recipe.instructions.forEach((instruction, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="step-number">${index + 1}</span> ${instruction}`;
    instructionsList.appendChild(li);
  });
  
  // Show user's rating if exists
  displayUserRating(recipeId);
}

// Filter recipes by category
function filterRecipesByCategory(category) {
  const recipes = getAllRecipes();
  const filtered = recipes.filter(recipe => 
    recipe.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
  );
  
  displayRecipes('category-recipes-container', filtered);
  
  // Update count
  const countElement = document.querySelector('.recipe-count');
  if (countElement) {
    countElement.textContent = filtered.length;
  }
}

// Search recipes
function searchRecipes(query) {
  const recipes = getAllRecipes();
  const searchQuery = query.toLowerCase();
  
  const results = recipes.filter(recipe => {
    return (
      recipe.title.toLowerCase().includes(searchQuery) ||
      recipe.description.toLowerCase().includes(searchQuery) ||
      recipe.categories.some(cat => cat.toLowerCase().includes(searchQuery)) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery))
    );
  });
  
  displayRecipes('search-results-container', results);
  
  // Update count
  const countElement = document.querySelector('.results-count');
  if (countElement) {
    countElement.textContent = results.length;
  }
}

// Save recipe to user's collection
function saveRecipe(recipeId) {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    alert('Please log in to save recipes');
    window.location.href = 'login.html';
    return;
  }
  
  // Get saved recipes
  let savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || {};
  
  // Initialize user's saved recipes if doesn't exist
  if (!savedRecipes[user.id]) {
    savedRecipes[user.id] = [];
  }
  
  // Check if already saved
  if (savedRecipes[user.id].includes(parseInt(recipeId))) {
    // Remove from saved
    savedRecipes[user.id] = savedRecipes[user.id].filter(id => id !== parseInt(recipeId));
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    
    alert('Recipe removed from your collection');
    updateSaveButtonState(recipeId);
  } else {
    // Add to saved
    savedRecipes[user.id].push(parseInt(recipeId));
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    
    alert('Recipe saved to your collection!');
    updateSaveButtonState(recipeId);
  }
}

// Update save button state
function updateSaveButtonState(recipeId) {
  const saveButton = document.getElementById('save-recipe');
  if (!saveButton) return;
  
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return;
  
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || {};
  const userSaved = savedRecipes[user.id] || [];
  
  if (userSaved.includes(parseInt(recipeId))) {
    saveButton.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
    saveButton.classList.add('saved');
  } else {
    saveButton.innerHTML = '<i class="far fa-bookmark"></i> Save';
    saveButton.classList.remove('saved');
  }
}

// Display user's saved recipes
function displaySavedRecipes() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) return;
  
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || {};
  const userSaved = savedRecipes[user.id] || [];
  
  if (userSaved.length === 0) {
    document.getElementById('saved-recipes-container').innerHTML = 
      '<p class="no-results">You haven\'t saved any recipes yet.</p>';
    return;
  }
  
  const allRecipes = getAllRecipes();
  const userRecipes = allRecipes.filter(recipe => userSaved.includes(recipe.id));
  
  displayRecipes('saved-recipes-container', userRecipes);
  
  // Update count
  const countElement = document.querySelector('.saved-count');
  if (countElement) {
    countElement.textContent = userRecipes.length;
  }
}

// Display related recipes based on categories
function displayRelatedRecipes(recipeId) {
  const recipes = getAllRecipes();
  const currentRecipe = recipes.find(r => r.id == recipeId);
  
  if (!currentRecipe) return;
  
  // Find recipes with similar categories
  const relatedRecipes = recipes.filter(recipe => 
    recipe.id != recipeId && // Not the current recipe
    recipe.categories.some(cat => currentRecipe.categories.includes(cat))
  ).slice(0, 3); // Limit to 3 related recipes
  
  displayRecipes('related-recipes-container', relatedRecipes);
}

// Display user's rating
function displayUserRating(recipeId) {
  const ratings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
  const userRating = ratings[recipeId] || 0;
  
  if (userRating > 0) {
    highlightStars(userRating);
  }
}

// Generate star rating HTML
function getStarRating(rating) {
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5
  let starsHtml = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      starsHtml += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 === roundedRating) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHtml += '<i class="far fa-star"></i>';
    }
  }
  
  return `<div class="stars">${starsHtml} <span>(${rating.toFixed(1)})</span></div>`;
}

// Helper function to get recipe ID from URL
function getRecipeIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
});
        
        // Update button state
        updateSaveButtonState(recipeId);
      }
      
      // Load comments
      displayComments(recipeId);
      
      // Load related recipes
      displayRelatedRecipes(recipeId);
    }
  }
  
  // Load saved recipes if on saved recipes page
  const savedRecipesContainer = document.getElementById('saved-recipes-container');
  if (savedRecipesContainer) {
    displaySavedRecipes();
  }
  
  // Handle category filtering if on categories page
  const categoryRecipesContainer = document.getElementById('category-recipes-container');
  if (categoryRecipesContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
      document.getElementById('category-title').textContent = category;
      filterRecipesByCategory(category);
    } else {
      displayRecipes('category-recipes-container', getAllRecipes());
    }
  }
  
  // Handle search results if on search page
  const searchResultsContainer = document.getElementById('search-results-container');
  if (searchResultsContainer) {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
      document.getElementById('search-query').textContent = query;
      searchRecipes(query);
    }
  }
});

// Initialize recipes in local storage if not already present
function initializeRecipes() {
  if (!localStorage.getItem('recipes')) {
    localStorage.setItem('recipes', JSON.stringify(getSampleRecipes()));
  }
}

// Function to get all recipes from local storage
function getAllRecipes() {
  return JSON.parse(localStorage.getItem('recipes')) || [];
}

// Function to get featured recipes
function getFeaturedRecipes() {
  const recipes = getAllRecipes();
  return recipes.filter(recipe => recipe.featured).slice(0, 4);
}

// Function to get recent recipes
function getRecentRecipes() {
  const recipes = getAllRecipes();
  return recipes.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
}

// Sample recipe data (would normally come from an API)
function getSampleRecipes() {
  return [
    {
      id: 1,
      title: 'Pasta Carbonara',
      description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and pepper',
      image: 'img/recipes/carbonara.jpg',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Medium',
      ingredients: [
        '350g spaghetti',
        '150g pancetta',
        '50g pecorino cheese',
        '50g parmesan',
        '3 large eggs',
        'Black pepper'
      ],
      instructions: [
        'Cook pasta in salted water according to package instructions',
        'Fry pancetta until crispy',
        'Beat eggs with grated cheese and pepper',
        'Drain pasta, mix with pancetta, then quickly stir in egg mixture',
        'Serve immediately with extra cheese and pepper'
      ],
      categories: ['Pasta', 'Italian', 'Quick Meals'],
      author: 'Chef Mario',
      date: '2025-03-01',
      ratings: [4, 5, 5, 4, 5],
      featured: true
    },
    {
      id: 2,
      title: 'Chicken Tikka Masala',
      description: 'Creamy and flavorful Indian curry with marinated chicken pieces',
      image: 'img/recipes/tikka-masala.jpg',
      prepTime: 30,
      cookTime: 40,
      servings: 6,
      difficulty: 'Medium',
      ingredients: [
        '800g chicken breast',
        '200ml yogurt',
        '2 tbsp garam masala',
        '1 tbsp cumin',
        '1 tbsp turmeric',
        '400ml tomato sauce',
        '200ml heavy cream',
        '2 onions',
        '4 garlic cloves',
        'Fresh coriander'
      ],
      instructions: [
        'Mix yogurt with spices and marinate chicken for at least 1 hour',
        'Grill or bake chicken until cooked through',
        'Sauté onions and garlic until soft',
        'Add tomato sauce and simmer for 10 minutes',
        'Add cream and simmer for another 5 minutes',
        'Cut chicken into pieces and add to the sauce',
        'Garnish with fresh coriander and serve with rice or naan'
      ],
      categories: ['Curry', 'Indian', 'Chicken'],
      author: 'Chef Raj',
      date: '2025-03-15',
      ratings: [5, 4, 5, 5, 4],
      featured: true
    },
    {
      id: 3,
      title: 'Vegetable Stir Fry',
      description: 'Quick and healthy vegetable stir fry with soy sauce and ginger',
      image: 'img/recipes/stir-fry.jpg',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'Easy',
      ingredients: [
        '1 red bell pepper',
        '1 yellow bell pepper',
        '1 carrot',
        '1 broccoli head',
        '1 onion',
        '2 garlic cloves',
        '1 tbsp ginger',
        '3 tbsp soy sauce',
        '1 tbsp sesame oil',
        '1 tbsp honey'
      ],
      instructions: [
        'Cut all vegetables into similar sized pieces',
        'Heat sesame oil in a wok or large frying pan',
        'Add garlic and ginger, stir for 30 seconds',
        'Add vegetables and stir fry for 5-7 minutes until crisp-tender',
        'Add soy sauce and honey, stir to coat',
        'Serve immediately with rice or noodles'
      ],
      categories: ['Vegetarian', 'Asian', 'Quick Meals'],
      author: 'Chef Lin',
      date: '2025-03-20',
      ratings: [4, 4, 5, 4, 4],
      featured: false
    },
    {
      id: 4,
      title: 'Classic Margherita Pizza',
      description: 'Traditional Italian pizza with tomato sauce, fresh mozzarella, and basil',
      image: 'img/recipes/pizza.jpg',
      prepTime: 90,
      cookTime: 10,
      servings: 4,
      difficulty: 'Medium',
      ingredients: [
        '500g bread flour',
        '7g dried yeast',
        '1 tsp salt',
        '1 tbsp olive oil',
        '300ml warm water',
        '400g canned tomatoes',
        '2 garlic cloves',
        '250g fresh mozzarella',
        'Fresh basil leaves',
        'Extra virgin olive oil'
      ],
      instructions: [
        'Mix flour, yeast, and salt in a bowl',
        'Add olive oil and water, mix to form a dough',
        'Knead for 10 minutes until smooth',
        'Let rise for 1 hour or until doubled in size',
        'Blend tomatoes, garlic, and a pinch of salt for the sauce',
        'Divide dough into 4 pieces and roll out into thin rounds',
        'Top with sauce, torn mozzarella pieces, and bake at 250°C for 8-10 minutes',
        'Add fresh basil leaves and a drizzle of olive oil before serving'
      ],
      categories: ['Pizza', 'Italian', 'Vegetarian'],
      author: 'Chef Giovanni',
      date: '2025-03-25',
      ratings: [5, 5, 4, 5, 5],
      featured: true
    },
    {
      id: 5,
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies with crisp edges and soft centers',
      image: 'img/recipes/cookies.jpg',
      prepTime: 15,
      cookTime: 12,
      servings: 24,
      difficulty: 'Easy',
      ingredients: [
        '250g all-purpose flour',
        '1/2 tsp baking soda',
        '1/2 tsp salt',
        '170g unsalted butter',
        '150g brown sugar',
        '100g white sugar',
        '1 large egg',
        '1 tsp vanilla extract',
        '200g chocolate chips'
      ],
      instructions: [
        'Preheat oven to 180°C',
        'Mix flour, baking soda, and salt in a bowl',
        'Cream butter and sugars until light and fluffy',
        'Add egg and vanilla, mix well',
        'Gradually add flour mixture',
        'Stir in chocolate chips',
        'Drop tablespoons of dough onto baking sheets',
        'Bake for 10-12 minutes until edges are golden',
        'Let cool on sheets for 2 minutes, then transfer to wire racks'
      ],
      categories: ['Dessert', 'Baking', 'Cookies'],
      author: 'Chef Emma',
      date: '2025-04-01',
      ratings: [5, 5, 5, 4, 5],
      featured: false
    },
    {
      id: 6,
      title: 'Greek Salad',
      description: 'Fresh and tangy Greek salad with cucumbers, tomatoes, olives, and feta cheese',
      image: 'img/recipes/greek-salad.jpg',
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      difficulty: 'Easy',
      ingredients: [
        '1 cucumber',
        '4 large tomatoes',
        '1 red onion',
        '200g feta cheese',
        '100g kalamata olives',
        '2 tbsp olive oil',
        '1 tbsp red wine vinegar',
        '1 tsp dried oregano',
        'Salt and pepper'
      ],
      instructions: [
        'Cut cucumber, tomatoes, and red onion into chunks',
        'Combine in a large bowl with olives',
        'Crumble feta cheese over the top',
        'Mix olive oil, vinegar, oregano, salt, and pepper for dressing',
        'Pour dressing over salad and toss gently',
        'Serve immediately or refrigerate for up to 1 hour'
      ],
      categories: ['Salad', 'Greek', 'Vegetarian'],
      author: 'Chef Nikos',
      date: '2025-04-05',
      ratings: [4, 5, 4, 4, 5],
      featured: false
    }