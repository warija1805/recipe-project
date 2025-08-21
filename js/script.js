// State management
const state = {
    recipes: [],
    favorites: JSON.parse(localStorage.getItem('favoriteRecipes')) || [],
    currentFilter: 'all',
    searchQuery: '',
    isLoading: false
};

// DOM Elements
const elements = {
    recipesGrid: document.getElementById('recipes-grid'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    favoritesToggle: document.getElementById('favorites-toggle'),
    filtersBar: document.querySelector('.filters-bar'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    resultsTitle: document.getElementById('results-title'),
    loadingSpinner: document.getElementById('loading-spinner'),
    noResults: document.getElementById('no-results'),
    modalOverlay: document.getElementById('modal-overlay'),
    recipeModal: document.getElementById('recipe-modal'),
    closeModal: document.getElementById('close-modal'),
    modalContent: document.querySelector('.modal-content'),
    suggestionsBox: document.querySelector('.suggestions-box')
};

// API configuration
const API = {
    baseURL: 'https://www.themealdb.com/api/json/v1/1/',
    endpoints: {
        search: 'search.php?s=',
        lookup: 'lookup.php?i=',
        categories: 'categories.php',
        random: 'random.php'
    }
};

// Mock data for fallback
const mockRecipes = [
    {
        idMeal: '1',
        strMeal: 'Creamy Garlic Pasta',
        strCategory: 'Pasta',
        strArea: 'Italian',
        strInstructions: '1. Cook pasta according to package directions.\n2. In a pan, sauté garlic in olive oil until fragrant.\n3. Add cream and bring to a simmer.\n4. Toss cooked pasta with the sauce and grated Parmesan.\n5. Season with salt, pepper, and fresh parsley.',
        strMealThumb: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
        strTags: 'Pasta,Creamy,Italian',
        strYoutube: 'https://www.youtube.com/watch?v=4v9c0FADDu4',
        ingredients: [
            { ingredient: 'Pasta', measure: '200g' },
            { ingredient: 'Garlic', measure: '3 cloves' },
            { ingredient: 'Heavy cream', measure: '1 cup' },
            { ingredient: 'Parmesan cheese', measure: '1/2 cup' },
            { ingredient: 'Olive oil', measure: '2 tbsp' },
            { ingredient: 'Parsley', measure: '2 tbsp' }
        ]
    },
    {
        idMeal: '2',
        strMeal: 'Chocolate Lava Cake',
        strCategory: 'Dessert',
        strArea: 'French',
        strInstructions: '1. Preheat oven to 425°F (220°C).\n2. Butter and cocoa dust four ramekins.\n3. Melt chocolate and butter together.\n4. Whisk eggs, egg yolks, and sugar until pale.\n5. Fold chocolate mixture into egg mixture.\n6. Add flour and mix until combined.\n7. Divide batter among ramekins and bake for 12-14 minutes.\n8. Let cool for 1 minute, then invert onto plates.',
        strMealThumb: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
        strTags: 'Dessert,Chocolate,Cake',
        strYoutube: 'https://www.youtube.com/watch?v=qg_5f66Xrxo',
        ingredients: [
            { ingredient: 'Dark chocolate', measure: '200g' },
            { ingredient: 'Butter', measure: '100g' },
            { ingredient: 'Eggs', measure: '2 whole' },
            { ingredient: 'Egg yolks', measure: '2' },
            { ingredient: 'Sugar', measure: '100g' },
            { ingredient: 'Flour', measure: '60g' },
            { ingredient: 'Cocoa powder', measure: 'for dusting' }
        ]
    },
    {
        idMeal: '3',
        strMeal: 'Mediterranean Grilled Salmon',
        strCategory: 'Seafood',
        strArea: 'Mediterranean',
        strInstructions: '1. Preheat grill to medium-high heat.\n2. In a bowl, mix olive oil, lemon juice, garlic, and herbs.\n3. Season salmon fillets with salt and pepper.\n4. Brush salmon with the marinade.\n5. Grill salmon for 4-5 minutes per side.\n6. Serve with lemon wedges and fresh dill.',
        strMealThumb: 'https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg',
        strTags: 'Seafood,Healthy,Grilled',
        strYoutube: 'https://www.youtube.com/watch?v=5gLbsqXMBc8',
        ingredients: [
            { ingredient: 'Salmon fillets', measure: '4' },
            { ingredient: 'Olive oil', measure: '3 tbsp' },
            { ingredient: 'Lemon juice', measure: '2 tbsp' },
            { ingredient: 'Garlic', measure: '2 cloves' },
            { ingredient: 'Dill', measure: '2 tbsp' },
            { ingredient: 'Oregano', measure: '1 tsp' },
            { ingredient: 'Salt and pepper', measure: 'to taste' }
        ]
    }
];

// Initialize the app
function init() {
    loadPopularRecipes();
    bindEvents();
    updateFavoritesButton();
}

// Load popular recipes on initial load
async function loadPopularRecipes() {
    try {
        toggleLoading(true);
        
        // Try to fetch from API first
        let recipes = await fetchRecipes('chicken');
        
        // If API fails, use mock data
        if (!recipes || recipes.length === 0) {
            recipes = mockRecipes;
        }
        
        state.recipes = recipes;
        renderRecipes(recipes);
    } catch (error) {
        console.error('Error loading recipes:', error);
        state.recipes = mockRecipes;
        renderRecipes(mockRecipes);
    } finally {
        toggleLoading(false);
    }
}

// Fetch recipes from TheMealDB API
async function fetchRecipes(query) {
    try {
        const response = await fetch(`${API.baseURL}${API.endpoints.search}${query}`);
        const data = await response.json();
        
        if (data.meals) {
            // Enhance recipes with ingredients data
            return data.meals.map(meal => {
                const ingredients = [];
                
                // TheMealDB stores ingredients and measures in separate properties
                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    
                    if (ingredient && ingredient.trim() !== '') {
                        ingredients.push({ ingredient, measure });
                    }
                }
                
                return {
                    ...meal,
                    ingredients
                };
            });
        }
        
        return [];
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

// Fetch recipe details by ID
async function fetchRecipeDetails(id) {
    try {
        const response = await fetch(`${API.baseURL}${API.endpoints.lookup}${id}`);
        const data = await response.json();
        
        if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            const ingredients = [];
            
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                
                if (ingredient && ingredient.trim() !== '') {
                    ingredients.push({ ingredient, measure });
                }
            }
            
            return {
                ...meal,
                ingredients
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
}

// Render recipes to the grid
function renderRecipes(recipes) {
    elements.recipesGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        elements.noResults.style.display = 'block';
        return;
    }
    
    elements.noResults.style.display = 'none';
    
    // Apply filter if active
    let filteredRecipes = recipes;
    if (state.currentFilter === 'favorites') {
        filteredRecipes = recipes.filter(recipe => 
            state.favorites.some(fav => fav.idMeal === recipe.idMeal)
        );
        
        if (filteredRecipes.length === 0) {
            elements.noResults.style.display = 'block';
            elements.noResults.innerHTML = `
                <i class="fas fa-heart"></i>
                <h3>No favorite recipes yet</h3>
                <p>Start adding recipes to your favorites!</p>
            `;
        }
    }
    
    // Create recipe cards with staggered animation
    filteredRecipes.forEach((recipe, index) => {
        const isFavorite = state.favorites.some(fav => fav.idMeal === recipe.idMeal);
        const recipeCard = createRecipeCard(recipe, isFavorite);
        
        // Add staggered animation delay
        recipeCard.style.animationDelay = `${index * 0.1}s`;
        
        elements.recipesGrid.appendChild(recipeCard);
    });
}

// Create a recipe card element
function createRecipeCard(recipe, isFavorite) {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.id = recipe.idMeal;
    
    card.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="recipe-image">
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${recipe.idMeal}">
            <i class="fas fa-heart"></i>
        </button>
        <div class="recipe-content">
            <h3 class="recipe-title">${recipe.strMeal}</h3>
            <span class="recipe-category">${recipe.strCategory}</span>
        </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.favorite-btn')) {
            openRecipeModal(recipe.idMeal);
        }
    });
    
    return card;
}

// Open recipe modal with details
async function openRecipeModal(recipeId) {
    try {
        toggleLoading(true);
        
        // Try to fetch recipe details from API
        let recipe = await fetchRecipeDetails(recipeId);
        
        // If not found in API, try to find in our current recipes or mock data
        if (!recipe) {
            recipe = state.recipes.find(r => r.idMeal === recipeId) || 
                     mockRecipes.find(r => r.idMeal === recipeId);
        }
        
        if (recipe) {
            renderRecipeModal(recipe);
            elements.modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    } catch (error) {
        console.error('Error opening recipe modal:', error);
    } finally {
        toggleLoading(false);
    }
}

// Render recipe details in modal
function renderRecipeModal(recipe) {
    const isFavorite = state.favorites.some(fav => fav.idMeal === recipe.idMeal);
    
    elements.modalContent.innerHTML = `
        <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="modal-hero">
        <div class="modal-header">
            <h2 class="modal-title">${recipe.strMeal}</h2>
            <span class="modal-category">${recipe.strCategory}</span>
        </div>
        <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${recipe.idMeal}">
            <i class="fas fa-heart"></i>
        </button>
        <div class="modal-section">
            <h3 class="modal-section-title">Ingredients</h3>
            <div class="ingredients-grid">
                ${recipe.ingredients.map(ing => `
                    <div class="ingredient-item">
                        <i class="fas fa-check-circle"></i>
                        <span>${ing.ingredient} - ${ing.measure}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="modal-section">
            <h3 class="modal-section-title">Instructions</h3>
            <div class="instructions-list">
                ${recipe.strInstructions.split('\n').filter(step => step.trim() !== '').map(step => `
                    <p class="instruction-item">${step}</p>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listener to favorite button in modal
    const modalFavoriteBtn = elements.modalContent.querySelector('.favorite-btn');
    if (modalFavoriteBtn) {
        modalFavoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(recipe);
            
            // Update button state
            modalFavoriteBtn.classList.toggle('active');
            
            // Update corresponding card if it exists
            const cardFavoriteBtn = document.querySelector(`.recipe-card[data-id="${recipe.idMeal}"] .favorite-btn`);
            if (cardFavoriteBtn) {
                cardFavoriteBtn.classList.toggle('active');
            }
            
            // If we're in favorites view and un-favoriting, update the view
            if (state.currentFilter === 'favorites' && !modalFavoriteBtn.classList.contains('active')) {
                const updatedRecipes = state.recipes.filter(r => 
                    state.favorites.some(fav => fav.idMeal === r.idMeal)
                );
                renderRecipes(updatedRecipes);
            }
        });
    }
}

// Close recipe modal
function closeRecipeModal() {
    elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Toggle favorite status of a recipe
function toggleFavorite(recipe) {
    const index = state.favorites.findIndex(fav => fav.idMeal === recipe.idMeal);
    
    if (index === -1) {
        // Add to favorites
        state.favorites.push(recipe);
    } else {
        // Remove from favorites
        state.favorites.splice(index, 1);
    }
    
    // Save to localStorage
    localStorage.setItem('favoriteRecipes', JSON.stringify(state.favorites));
    
    // Update UI
    updateFavoritesButton();
}

// Update favorites button state
function updateFavoritesButton() {
    if (state.favorites.length > 0) {
        elements.favoritesToggle.innerHTML = `
            <i class="fas fa-heart"></i>
            <span>Favorites (${state.favorites.length})</span>
        `;
    } else {
        elements.favoritesToggle.innerHTML = `
            <i class="fas fa-heart"></i>
            <span>Favorites</span>
        `;
    }
}

// Toggle loading state
function toggleLoading(isLoading) {
    state.isLoading = isLoading;
    
    if (isLoading) {
        elements.loadingSpinner.style.display = 'block';
    } else {
        elements.loadingSpinner.style.display = 'none';
    }
}

// Handle search
async function handleSearch() {
    const query = elements.searchInput.value.trim();
    
    if (query === '') {
        return;
    }
    
    try {
        toggleLoading(true);
        state.searchQuery = query;
        state.currentFilter = 'all';
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
        
        // Update results title
        elements.resultsTitle.textContent = `Results for "${query}"`;
        
        // Try to fetch from API
        let recipes = await fetchRecipes(query);
        
        // If API fails, filter mock data
        if (!recipes || recipes.length === 0) {
            recipes = mockRecipes.filter(recipe => 
                recipe.strMeal.toLowerCase().includes(query.toLowerCase()) ||
                recipe.strCategory.toLowerCase().includes(query.toLowerCase()) ||
                (recipe.strTags && recipe.strTags.toLowerCase().includes(query.toLowerCase()))
            );
        }
        
        state.recipes = recipes;
        renderRecipes(recipes);
    } catch (error) {
        console.error('Error searching recipes:', error);
    } finally {
        toggleLoading(false);
    }
}

// Show search suggestions
function showSuggestions() {
    const query = elements.searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        elements.suggestionsBox.classList.remove('show');
        return;
    }
    
    // Get suggestions from mock data and common terms
    const allTerms = new Set();
    
    // Add from mock recipes
    mockRecipes.forEach(recipe => {
        allTerms.add(recipe.strMeal.toLowerCase());
        allTerms.add(recipe.strCategory.toLowerCase());
        if (recipe.strTags) {
            recipe.strTags.split(',').forEach(tag => allTerms.add(tag.trim().toLowerCase()));
        }
    });
    
    // Add common cooking terms
    const commonTerms = ['pasta', 'chicken', 'dessert', 'vegetarian', 'vegan', 'breakfast', 'dinner', 'lunch', 'quick', 'easy', 'healthy'];
    commonTerms.forEach(term => allTerms.add(term));
    
    // Filter suggestions based on query
    const suggestions = Array.from(allTerms).filter(term => 
        term.includes(query) && term !== query
    ).slice(0, 5);
    
    // Display suggestions
    if (suggestions.length > 0) {
        elements.suggestionsBox.innerHTML = suggestions.map(term => `
            <div class="suggestion-item">${term}</div>
        `).join('');
        
        elements.suggestionsBox.classList.add('show');
        
        // Add click events to suggestions
        elements.suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                elements.searchInput.value = item.textContent;
                elements.suggestionsBox.classList.remove('show');
                handleSearch();
            });
        });
    } else {
        elements.suggestionsBox.classList.remove('show');
    }
}

// Bind event listeners
function bindEvents() {
    // Search button click
    elements.searchBtn.addEventListener('click', handleSearch);
    
    // Search input enter key
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Search input for suggestions
    elements.searchInput.addEventListener('input', showSuggestions);
    
    // Click outside to close suggestions
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            elements.suggestionsBox.classList.remove('show');
        }
    });
    
    // Favorites toggle
    elements.favoritesToggle.addEventListener('click', () => {
        state.currentFilter = state.currentFilter === 'favorites' ? 'all' : 'favorites';
        
        // Update button state
        elements.favoritesToggle.classList.toggle('active', state.currentFilter === 'favorites');
        
        // Update results title
        if (state.currentFilter === 'favorites') {
            elements.resultsTitle.textContent = 'Your Favorite Recipes';
        } else if (state.searchQuery) {
            elements.resultsTitle.textContent = `Results for "${state.searchQuery}"`;
        } else {
            elements.resultsTitle.textContent = 'Popular Recipes';
        }
        
        renderRecipes(state.recipes);
    });
    
    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update active button
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            state.currentFilter = filter;
            
            // Update results title
            if (filter === 'favorites') {
                elements.resultsTitle.textContent = 'Your Favorite Recipes';
            } else if (state.searchQuery) {
                elements.resultsTitle.textContent = `Results for "${state.searchQuery}"`;
            } else {
                elements.resultsTitle.textContent = 'Popular Recipes';
            }
            
            renderRecipes(state.recipes);
        });
    });
    
    // Close modal
    elements.closeModal.addEventListener('click', closeRecipeModal);
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            closeRecipeModal();
        }
    });
    
    // Favorite buttons event delegation
    document.addEventListener('click', (e) => {
        if (e.target.closest('.favorite-btn')) {
            const btn = e.target.closest('.favorite-btn');
            const recipeId = btn.dataset.id;
            const recipe = state.recipes.find(r => r.idMeal === recipeId) || 
                          mockRecipes.find(r => r.idMeal === recipeId);
            
            if (recipe) {
                toggleFavorite(recipe);
                btn.classList.toggle('active');
                
                // If we're in favorites view and un-favoriting, update the view
                if (state.currentFilter === 'favorites' && !btn.classList.contains('active')) {
                    const updatedRecipes = state.recipes.filter(r => 
                        state.favorites.some(fav => fav.idMeal === r.idMeal)
                    );
                    renderRecipes(updatedRecipes);
                }
            }
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modalOverlay.classList.contains('active')) {
            closeRecipeModal();
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);