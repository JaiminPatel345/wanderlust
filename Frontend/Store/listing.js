import { create } from "zustand"
import useTagStore from "./tagStore.js"

const useListingStore = create((set, get) => ({
    allListings: [],
    filterListings: [],

    // Add a listing
    addListing: (listing) =>
        set((state) => ({
            allListings: [...state.allListings, listing],
        })),

    // Remove a listing
    removeListing: (listingId) =>
        set((state) => ({
            allListings: state.allListings.filter(
                (listing) => listing.id !== listingId
            ),
        })),

    // Set all listings
    setListings: (listings) => set({ allListings: listings }),

    // Set filtered listings
    setFilterListings: (listings) => set({ filterListings: listings }),

    // Filter listings based on selected tags
    filterListingsOnTag: () => {
        const selectedTags = useTagStore.getState().selectedTags
        const state = get()

        const tempListings = state.allListings.filter((listing) =>
            selectedTags.every((tag) => listing.tags.includes(tag))
        )

        set({ filterListings: tempListings })
    },

    filterListingOnTyping: (searchTerm) => {
        const state = get()
        if (searchTerm?.length === 0) {
            const selectedTags = useTagStore.getState().selectedTags
            if (selectedTags?.length === 0) {
                set({ filterListings: state.allListings })
                return
            } else {
                state.filterListingsOnTag()
                return
            }
        }
        state.filterListingsOnTag()
        let tempListings = state.filterListings.filter(
            (listing) =>
                listing.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                listing.price.toString().includes(searchTerm) ||
                listing.location
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                listing.country.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const tempListings2 = state.filterListings.filter(
            (listing) =>
                listing.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) &&
                !tempListings.includes(listing)
        )
        tempListings.push(...tempListings2)
        set({ filterListings:  tempListings})
    },
}))

export default useListingStore
