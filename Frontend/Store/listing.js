import { create } from "zustand"
import useTagStore from "./tagStore.js"

const useListingStore = create((set, get) => ({
    allListings: [],
    filterListings: [],

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
            selectedTags.every((tag) => listing.tags.includes(tag))
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
            return
        }

        // Wait for tag filtering to complete
        await state.filterListingsOnTag()

        // Now we can access the updated filterListings
        const currentState = get()
        const searchTermLower = searchTerm.toLowerCase()

        const tempListings = currentState.filterListings.filter(
            (listing) =>
                listing.title.toLowerCase().includes(searchTermLower) ||
                listing.price.toString().includes(searchTerm) ||
                listing.location.toLowerCase().includes(searchTermLower) ||
                listing.country.toLowerCase().includes(searchTermLower)
        )

        set({ filterListings: tempListings })
    },
}))

export default useListingStore
