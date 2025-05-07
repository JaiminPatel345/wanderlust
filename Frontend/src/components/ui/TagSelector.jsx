import React from 'react';

const AVAILABLE_TAGS = [
    'Trending',
    'Rooms',
    'Iconic cities',
    'Mountains',
    'Castles',
    'Amazing pools',
    'Camping',
    'Farms',
    'Arctic'
];

const TagSelector = ({ selectedTags, onTagsChange }) => {
    const handleTagChange = (e) => {
        const selectedTag = e.target.value;
        if (selectedTag !== 'null' && !selectedTags.includes(selectedTag)) {
            onTagsChange([...selectedTags, selectedTag]);
            e.target.value = 'null';
        }
    };

    const removeTag = (tagToRemove) => {
        onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    // Filter out already selected tags from the dropdown
    const availableTags = AVAILABLE_TAGS.filter(tag => !selectedTags.includes(tag));

    return (
        <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
            </label>
            <select
                name="tags"
                id="tags"
                onChange={handleTagChange}
                className="w-full p-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500"
            >
                <option value="null">--Select Tags--</option>
                {availableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                ))}
            </select>
            <div className="flex gap-2 mt-2 flex-wrap">
                {selectedTags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-gray-200 px-3 py-1 rounded-md">
                        <span>{tag}</span>
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-gray-600 hover:text-red-500 focus:outline-none"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagSelector; 