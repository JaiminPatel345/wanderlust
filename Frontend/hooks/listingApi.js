// hooks/useListingApi.js
import useListingStore from "../Store/listing"

export const useListingApi = () => {
    const setListings = useListingStore((state) => state.setListings)
    const setFilterListings = useListingStore(
        (state) => state.setFilterListings
    )

    const getAllListings = (setLoading) => {
        fetch(`${process.env.VITE_API_BASE_URL}/listings`)
            .then((response) => response.json())
            .then((data) => {
                setListings(data)
                setFilterListings(data)
            })
            .catch((error) => {
                console.error("Error fetching listings:", error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return { getAllListings }
}
