const DeleteListing = (id) => {
    fetch(`/api/listings/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    }).catch((error) => {
        console.log(error);

    })

}

export default DeleteListing