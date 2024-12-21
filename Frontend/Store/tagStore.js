import { create } from "zustand"

const useTagStore = create((set) => ({
    selectedTags: [],
    tagClick: (tag) =>
        set((state) => {
            // Check if tag exists using state.selectedTags
            if (state.selectedTags.includes(tag)) {
                // Remove tag if it exists
                return {
                    selectedTags: state.selectedTags.filter((t) => t !== tag),
                }
            } else {
                // Add tag if it doesn't exist
                return {
                    selectedTags: [...state.selectedTags, tag],
                }
            }
        }),
}))

export default useTagStore
