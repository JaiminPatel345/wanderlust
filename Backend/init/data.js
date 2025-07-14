const default_img = "https://img.freepik.com/free-vector/wanderlust-explore-adventure-landscape_24908-55313.jpg?w=740&t=st=1711876159~exp=1711876759~hmac=b91c9ca5ccaf8ba289e930b3c62030b97c46e70ad36177b312e199938db1c47c";

const sampleListings = [
    {
        title: "Cozy Beachfront Cottage",
        description: "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
        image: {
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 1500,
        nightOnlyPrice: 1200,
        childPricing: [
            { ageRange: { min: 0, max: 5 }, pricePerDay: 500 },
            { ageRange: { min: 6, max: 12 }, pricePerDay: 800 }
        ],
        location: "MALIBU",
        country: "UNITED STATES",
        coordinates: { lat: 34.0259, lng: -118.7798 },
        tags: ["Amazing pools", "Camping"]
    },
    {
        title: "Modern Loft in Downtown",
        description: "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
        image: {
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 1200,
        nightOnlyPrice: 1000,
        childPricing: [
            { ageRange: { min: 0, max: 10 }, pricePerDay: 600 }
        ],
        location: "NEW YORK CITY",
        country: "UNITED STATES",
        coordinates: { lat: 40.7128, lng: -74.0060 },
        tags: ["Trending", "Mountains", "Amazing pools"]
    },
    {
        title: "Mountain Retreat",
        description: "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
        image: {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 1000,
        nightOnlyPrice: 800,
        childPricing: [
            { ageRange: { min: 0, max: 12 }, pricePerDay: 400 }
        ],
        location: "ASPEN",
        country: "UNITED STATES",
        coordinates: { lat: 39.1911, lng: -106.8175 },
        tags: ["Trending", "Iconic cities", "Mountains", "Amazing pools"]
    },
    {
        title: "Historic Villa in Tuscany",
        description: "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
        image: {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 2500,
        nightOnlyPrice: 2000,
        childPricing: [
            { ageRange: { min: 0, max: 8 }, pricePerDay: 800 },
            { ageRange: { min: 9, max: 15 }, pricePerDay: 1200 }
        ],
        location: "FLORENCE",
        country: "ITALY",
        coordinates: { lat: 43.7696, lng: 11.2558 },
        tags: ["Rooms", "Amazing pools"]
    },
    {
        title: "Secluded Treehouse Getaway",
        description: "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
        image: {
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 800,
        nightOnlyPrice: 600,
        childPricing: [
            { ageRange: { min: 0, max: 12 }, pricePerDay: 300 }
        ],
        location: "PORTLAND",
        country: "UNITED STATES",
        coordinates: { lat: 45.5152, lng: -122.6784 },
        tags: ["Amazing pools", "Farms"]
    },
    {
        title: "Beachfront Paradise",
        description: "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
        image: {
            url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 2000,
        nightOnlyPrice: 1600,
        childPricing: [
            { ageRange: { min: 0, max: 10 }, pricePerDay: 700 }
        ],
        location: "CANCUN",
        country: "MEXICO",
        coordinates: { lat: 21.1619, lng: -86.8515 },
        tags: ["Iconic cities", "Amazing pools", "Farms"]
    },
    {
        title: "Rustic Cabin by the Lake",
        description: "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
        image: {
            url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 900,
        nightOnlyPrice: 700,
        childPricing: [
            { ageRange: { min: 0, max: 12 }, pricePerDay: 350 }
        ],
        location: "LAKE TAHOE",
        country: "UNITED STATES",
        coordinates: { lat: 39.0968, lng: -120.0324 },
        tags: ["Mountains", "Farms", "Camping"]
    },
    {
        title: "Historic Canal House",
        description: "Stay in a piece of history in this beautifully preserved canal house in Amsterdam's iconic district.",
        image: {
            url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FtcGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 1800,
        nightOnlyPrice: 1400,
        childPricing: [
            { ageRange: { min: 0, max: 10 }, pricePerDay: 600 }
        ],
        location: "AMSTERDAM",
        country: "NETHERLANDS",
        coordinates: { lat: 52.3676, lng: 4.9041 },
        tags: ["Mountains", "Farms", "Camping"]
    },
    {
        title: "Private Island Retreat",
        description: "Have an entire island to yourself for a truly exclusive and unforgettable vacation experience.",
        image: {
            url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9kZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 10000,
        nightOnlyPrice: 8000,
        childPricing: [
            { ageRange: { min: 0, max: 12 }, pricePerDay: 3000 }
        ],
        location: "FIJI",
        country: "FIJI",
        coordinates: { lat: -17.7134, lng: 178.0650 },
        tags: ["Mountains", "Rooms", "Farms", "Camping"]
    },
    {
        title: "Art Deco Apartment in Miami",
        description: "Step into the glamour of the 1920s in this stylish Art Deco apartment in South Beach.",
        image: {
            url: "https://plus.unsplash.com/premium_photo-1670963964797-942df1804579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 1600,
        nightOnlyPrice: 1300,
        childPricing: [
            { ageRange: { min: 0, max: 10 }, pricePerDay: 500 }
        ],
        location: "MIAMI",
        country: "UNITED STATES",
        coordinates: { lat: 25.7617, lng: -80.1918 },
        tags: ["Trending", "Mountains", "Rooms", "Arctic"]
    },
    {
        title: "Tropical Villa in Phuket",
        description: "Escape to a tropical paradise in this luxurious villa with a private infinity pool in Phuket.",
        image: {
            url: "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 3000,
        nightOnlyPrice: 2500,
        childPricing: [
            { ageRange: { min: 0, max: 8 }, pricePerDay: 1000 },
            { ageRange: { min: 9, max: 15 }, pricePerDay: 1500 }
        ],
        location: "PHUKET",
        country: "THAILAND",
        coordinates: { lat: 7.8804, lng: 98.3923 },
        tags: ["Trending", "Mountains", "Rooms", "Arctic"]
    },
    {
        title: "Desert Oasis in Dubai",
        description: "Experience luxury in the middle of the desert in this opulent oasis in Dubai with a private pool.",
        image: {
            url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHViYWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 30000,
        nightOnlyPrice: 25000,
        childPricing: [
            { ageRange: { min: 0, max: 12 }, pricePerDay: 10000 }
        ],
        location: "DUBAI",
        country: "UNITED ARAB EMIRATES",
        coordinates: { lat: 25.2048, lng: 55.2708 },
        tags: ["Trending", "Rooms", "Iconic cities", "Castles"]
    },
    {
        title: "Rustic Log Cabin in Montana",
        description: "Unplug and unwind in this cozy log cabin surrounded by the natural beauty of Montana.",
        image: {
            url: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
            filename: "listingimage"
        },
        pricePerDay: 1100,
        nightOnlyPrice: 900,
        childPricing: [
            { ageRange: { min: 0, max: 12 }, pricePerDay: 400 }
        ],
        location: "MONTANA",
        country: "UNITED STATES",
        coordinates: { lat: 46.8797, lng: -110.3626 },
        tags: ["Trending", "Rooms", "Farms"]
    }
];

module.exports = { data: sampleListings };