import React, { useState } from 'react';

export default function FilterSidebar({ filters, onFilterChange, categories, creators }) {
  const [isOpen, setIsOpen] = useState(false);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const ratings = [4, 3, 2, 1];

  const handleCategoryChange = (category) => {
    const newCategories = filters.category === category 
      ? null 
      : category;
    onFilterChange({ ...filters, category: newCategories });
  };

  const handleDifficultyChange = (difficulty) => {
    const newDifficulties = filters.difficulty === difficulty 
      ? null 
      : difficulty;
    onFilterChange({ ...filters, difficulty: newDifficulties });
  };

  const handleRatingChange = (rating) => {
    const newRating = filters.minRating === rating ? 0 : rating;
    onFilterChange({ ...filters, minRating: newRating });
  };

  const handleCreatorChange = (creatorId) => {
    const newCreator = filters.creatorId === creatorId ? null : creatorId;
    onFilterChange({ ...filters, creatorId: newCreator });
  };

  const clearFilters = () => {
    onFilterChange({
      category: null,
      difficulty: null,
      minRating: 0,
      creatorId: null
    });
  };

  const hasActiveFilters = filters.category || filters.difficulty || filters.minRating > 0 || filters.creatorId;

  return (
    <div className="w-full lg:w-64">
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between shadow-sm"
        >
          <span className="font-medium text-sm sm:text-base">Filters</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
  
      {/* Filter sidebar */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>
  
          {/* Categories */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Categories</h4>
            <div className="space-y-1 sm:space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category}
                    onChange={() => handleCategoryChange(category)}
                    className="mr-2 sm:mr-3 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">{category}</span>
                </label>
              ))}
            </div>
          </div>
  
          {/* Difficulty */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Difficulty</h4>
            <div className="space-y-1 sm:space-y-2">
              {difficulties.map((difficulty) => (
                <label key={difficulty} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={filters.difficulty === difficulty}
                    onChange={() => handleDifficultyChange(difficulty)}
                    className="mr-2 sm:mr-3 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">{difficulty}</span>
                </label>
              ))}
            </div>
          </div>
  
          {/* Rating */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Minimum Rating</h4>
            <div className="space-y-1 sm:space-y-2">
              {ratings.map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="mr-2 sm:mr-3 flex-shrink-0"
                  />
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs sm:text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 ml-1">& up</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
  
          {/* Creators */}
          {creators && creators.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Creators</h4>
              <select
                value={filters.creatorId || ''}
                onChange={(e) => handleCreatorChange(e.target.value || null)}
                className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Creators</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>
          )}
  
          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Active Filters</h4>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {filters.category && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    Category: {filters.category}
                  </span>
                )}
                {filters.difficulty && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    Difficulty: {filters.difficulty}
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    Rating: {filters.minRating}+ stars
                  </span>
                )}
                {filters.creatorId && (
                  <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                    Creator: {creators?.find(c => c.id === filters.creatorId)?.name}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 