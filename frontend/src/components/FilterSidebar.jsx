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
    <div className="lg:w-64">
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between"
        >
          <span className="font-medium">Filters</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category}
                    onChange={() => handleCategoryChange(category)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Difficulty</h4>
            <div className="space-y-2">
              {difficulties.map((difficulty) => (
                <label key={difficulty} className="flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={filters.difficulty === difficulty}
                    onChange={() => handleDifficultyChange(difficulty)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{difficulty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {ratings.map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="mr-2"
                  />
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">& up</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Creators */}
          {creators && creators.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Creators</h4>
              <select
                value={filters.creatorId || ''}
                onChange={(e) => handleCreatorChange(e.target.value || null)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
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
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Active Filters</h4>
              <div className="space-y-1">
                {filters.category && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                    Category: {filters.category}
                  </span>
                )}
                {filters.difficulty && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                    Difficulty: {filters.difficulty}
                  </span>
                )}
                {filters.minRating > 0 && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                    Rating: {filters.minRating}+ stars
                  </span>
                )}
                {filters.creatorId && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
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