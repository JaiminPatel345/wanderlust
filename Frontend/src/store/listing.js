import { create } from "zustand"
import useTagStore from "./tagStore.js"

const useListingStore = create((set, get) => ({
    allListings: [],
    filterListings: [],
    searchResults: [],
    isSearching: false,

    setListings: (listings) => set({ allListings: listings }),
    setFilterListings: (listings) => set({ filterListings: listings }),

    filterListingsOnTag: () => {
        const selectedTags = useTagStore.getState().selectedTags
        const state = get()

        // If no tags selected, show all listings
        if (selectedTags.length === 0) {
            set({ filterListings: state.allListings })
            return // Added return to prevent further execution
        }

        const tempListings = state.allListings.filter((listing) =>
            listing?.tags && selectedTags.every((tag) => listing.tags.includes(tag))
        )

        set({ filterListings: tempListings })
    },

    filterListingOnTyping: async (searchTerm) => {
        const state = get()
        const selectedTags = useTagStore.getState().selectedTags

        if (!searchTerm || searchTerm.length === 0) {
            if (selectedTags.length === 0) {
                set({ filterListings: state.allListings })
            } else {
                await state.filterListingsOnTag()
            }
            set({ searchResults: [] })
            return
        }

        // Wait for tag filtering to complete
        await state.filterListingsOnTag()

        // Now we can access the updated filterListings
        const currentState = get()
        const searchTermLower = searchTerm.toLowerCase()

        const tempListings = currentState.filterListings.filter(
            (listing) => {
                if (!listing) return false;
                return (
                    (listing.title?.toLowerCase() || '').includes(searchTermLower) ||
                    (listing.pricePerDay?.toString() || '').includes(searchTerm) ||
                    (listing.location?.toLowerCase() || '').includes(searchTermLower) ||
                    (listing.country?.toLowerCase() || '').includes(searchTermLower) ||
                    (listing.tags?.some(tag => tag?.toLowerCase().includes(searchTermLower)) || false)
                );
            }
        )

        set({ filterListings: tempListings })
    },

    searchListingsBackend: async (searchTerm) => {
        if (!searchTerm || searchTerm.trim() === '') {
            set({ searchResults: [], isSearching: false }) 
            return
        }

        set({ isSearching: true })
        
        try {
            const response = await fetch(`${process.env.VITE_API_BASE_URL}/listings/search?query=${encodeURIComponent(searchTerm)}`)
            
            if (!response.ok) {
                throw new Error('Search request failed')
            }
            
            const results = await response.json()
            set({ searchResults: results, isSearching: false })
            
            // When "view all results" is clicked, we'll update filterListings
            return results
        } catch (error) {
            console.error('Error searching listings:', error)
            set({ isSearching: false })
            // Fall back to frontend search if backend fails
            const { filterListingOnTyping } = get()
            await filterListingOnTyping(searchTerm)
            return []
        }
    },
    
    clearSearchResults: () => {
        set({ searchResults: [], isSearching: false })
    },
    
    setSearchResultsAsFilter: (results) => {
        set({ filterListings: results || [] })
    }
}))

export default useListingStore
