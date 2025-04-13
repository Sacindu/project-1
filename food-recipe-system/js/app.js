// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  checkAuthState();
  
  // Initialize UI elements
  initUI();
  
  // Handle search functionality
  initSearch();
  
  // Handle newsletter form
  initNewsletter();
});

function initUI() {
  // Initialize navigation menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      document.querySelector('.nav-links').classList.toggle('show');
    });
  }
  
  // Initialize share button
  const shareButton = document.getElementById('share-recipe');
  if (shareButton) {
    shareButton.addEventListener('click', shareRecipe);
  }
  
  // Initialize print button
  const printButton = document.getElementById('print-recipe');
  if (printButton) {
    printButton.addEventListener('click', printRecipe);
  }
  
  // Initialize rating stars
  const stars = document.querySelectorAll('.stars-container i');
  if (stars.length > 0) {
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = this.getAttribute('data-rating');
        setRating(rating);
      });
      
      star.addEventListener('mouseover', function() {
        const rating = this.getAttribute('data-rating');
        highlightStars(rating);
      });
      
      star.addEventListener('mouseout', function() {
        resetStars();
      });
    });
  }
  
  // Initialize comment submission
  const submitComment = document.getElementById('submit-comment');
  if (submitComment) {
    submitComment.addEventListener('click', addComment);
  }
}

function initSearch() {
  const searchForm = document.querySelector('.search-bar');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchQuery = document.getElementById('search-input').value.trim();
      if (searchQuery) {
        window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
      }
    });
    
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
      searchButton.addEventListener('click', function() {
        const searchQuery = document.getElementById('search-input').value.trim();
        if (searchQuery) {
          window.location.href = `search.html?q=${encodeURIComponent(searchQuery)}`;
        }
      });
    }
  }
}

function initNewsletter() {
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value.trim();
      if (email && validateEmail(email)) {
        // Here you would normally send to a backend
        alert('Thank you for subscribing to our newsletter!');
        this.reset();
      } else {
        alert('Please enter a valid email address.');
      }
    });
  }
}

// Recipe actions
function shareRecipe() {
  // Get current URL
  const recipeUrl = window.location.href;
  
  // Check if the browser supports the clipboard API
  if (navigator.clipboard) {
    navigator.clipboard.writeText(recipeUrl)
      .then(() => {
        alert('Recipe link copied to clipboard!');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        // Fallback
        prompt('Copy this link to share the recipe:', recipeUrl);
      });
  } else {
    // Fallback for older browsers
    prompt('Copy this link to share the recipe:', recipeUrl);
  }
}

function printRecipe() {
  window.print();
}

// Rating functionality
function setRating(rating) {
  // Here you would normally send to a backend
  console.log('Rating set to:', rating);
  
  // Update visual stars
  const stars = document.querySelectorAll('.stars-container i');
  stars.forEach(star => {
    const starRating = parseInt(star.getAttribute('data-rating'));
    if (starRating <= rating) {
      star.classList.remove('far');
      star.classList.add('fas');
    } else {
      star.classList.remove('fas');
      star.classList.add('far');
    }
  });
  
  // Save to localStorage for demonstration
  const recipeId = getRecipeIdFromUrl();
  if (recipeId) {
    const ratings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
    ratings[recipeId] = rating;
    localStorage.setItem('recipeRatings', JSON.stringify(ratings));
    
    alert('Thank you for rating this recipe!');
  }
}

function highlightStars(rating) {
  const stars = document.querySelectorAll('.stars-container i');
  stars.forEach(star => {
    const starRating = parseInt(star.getAttribute('data-rating'));
    if (starRating <= rating) {
      star.classList.remove('far');
      star.classList.add('fas');
    }
  });
}

function resetStars() {
  // Get the actual rating if exists
  const recipeId = getRecipeIdFromUrl();
  let userRating = 0;
  
  if (recipeId) {
    const ratings = JSON.parse(localStorage.getItem('recipeRatings')) || {};
    userRating = ratings[recipeId] || 0;
  }
  
  // Reset stars to show only the user's rating
  const stars = document.querySelectorAll('.stars-container i');
  stars.forEach(star => {
    const starRating = parseInt(star.getAttribute('data-rating'));
    if (starRating <= userRating) {
      star.classList.remove('far');
      star.classList.add('fas');
    } else {
      star.classList.remove('fas');
      star.classList.add('far');
    }
  });
}

// Comments functionality
function addComment() {
  const commentText = document.getElementById('comment-text').value.trim();
  if (!commentText) {
    alert('Please enter a comment before submitting.');
    return;
  }
  
  const recipeId = getRecipeIdFromUrl();
  if (!recipeId) return;
  
  // Get current user
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user) {
    alert('You must be logged in to add a comment.');
    return;
  }
  
  // Create comment object
  const comment = {
    id: Date.now(),
    text: commentText,
    author: user.name || user.email.split('@')[0],
    date: new Date().toISOString(),
    recipeId: recipeId
  };
  
  // Save to localStorage
  let comments = JSON.parse(localStorage.getItem('recipeComments')) || [];
  comments.push(comment);
  localStorage.setItem('recipeComments', JSON.stringify(comments));
  
  // Clear the input
  document.getElementById('comment-text').value = '';
  
  // Display the new comment
  displayComments(recipeId);
}

function displayComments(recipeId) {
  const commentsContainer = document.querySelector('.comments-list');
  if (!commentsContainer) return;
  
  // Get comments for this recipe
  const allComments = JSON.parse(localStorage.getItem('recipeComments')) || [];
  const recipeComments = allComments.filter(comment => comment.recipeId == recipeId);
  
  // Clear container
  commentsContainer.innerHTML = '';
  
  if (recipeComments.length === 0) {
    commentsContainer.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
    return;
  }
  
  // Sort comments by date (newest first)
  recipeComments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Display each comment
  recipeComments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    
    const date = new Date(comment.date);
    const formattedDate = date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    commentElement.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${comment.author}</span>
        <span class="comment-date">${formattedDate}</span>
      </div>
      <div class="comment-body">
        <p>${comment.text}</p>
      </div>
    `;
    
    commentsContainer.appendChild(commentElement);
  });
}

// Helper functions
function getRecipeIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show error message
function showError(message, elementId = 'error-message') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  } else {
    alert(message);
  }
}

// Hide error message
function hideError(elementId = 'error-message') {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.style.display = 'none';
  }
}