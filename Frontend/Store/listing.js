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

        // if (!selectedTags.length) {
        //     set({ filterListings: state.allListings })
        //     return
        // }

        const tempListings = state.allListings.filter((listing) =>
            selectedTags.every((tag) => listing.tags.includes(tag))
        )

        set({ filterListings: tempListings })
    },
}))

export default useListingStore
