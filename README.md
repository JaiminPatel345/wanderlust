# Wanderlust: Explore and Book Unique Stays

**Live Project** <a href="https://wanderlust-zt2d.onrender.com/"> Click here
</a>

**Project Overview**

Wanderlust is a web application inspired by Airbnb, built using JavaScript (JS),
HTML, CSS, Node.js, Express.js, EJS templating, Passport.js for authentication,
and various other NPM packages. It follows a well-structured
Model-View-Controller (MVC) architecture for efficient development and
maintainability.

**Key Features**

- **Explore Listings:**
  - Users can discover a variety of listings tailored to their travel needs.
  - Utilize comprehensive search filters to narrow down options based on
    location, price range, amenities, and more.
- **Add Listings:**
  - Existing users can effortlessly create listings for their unique spaces.
  - Provide descriptive details, captivating photos, and compelling descriptions
    to attract potential guests.
- **Booking Management:**
  - Users can conveniently book available listings, enabling them to plan their
    adventures.
  - A clear and intuitive booking interface allows for a seamless user
    experience.
- **User Management:**
  - Users can register and log in securely using Passport.js authentication.
  - Owners have the ability to edit or delete their own listings, ensuring
    complete control over their properties.
  - Other users can only book listings, respecting ownership rights.

**Technology Stack**

- **Frontend:**
  - HTML: Core structure of web pages.
  - CSS: Styling and visual design of the application.
  - JavaScript: Interactivity and dynamic behavior.
  - Bootstrap: Responsive design framework for a user-friendly experience across
    various devices.
- **Backend:**
  - Node.js: Server-side runtime environment for building scalable applications.
  - Express.js: Web framework for building robust RESTful APIs.
  - EJS: Templating engine for generating dynamic HTML content.
  - Passport.js: Authentication and authorization middleware for secure user
    management.
  - NPM Packages: Additional functionalities for specific needs.
- **Cloud Storage:**
  - Cloudinary: Cloud-based image storage and management platform for storing
    and handling user-uploaded listing images.

**Prerequisites**

- **Cloudinary Account:** Create a free Cloudinary account at
  https://cloudinary.com/ to store images for your listings.
- **Node.js and npm:** Ensure you have Node.js and npm (Node Package Manager)
  installed on your system. You can download them from https://nodejs.org/en.

**Setting Up Cloudinary Credentials**

1. Create a Cloudinary account and log in.
2. Navigate to the "Settings" -> "API Keys" section.
3. Copy the values for **Cloud Name**, **API Key**, and **API Secret**.
4. Create a file named `.env` (note the leading dot) in your project's root
   directory. This file is not version-controlled for security reasons.
5. Paste the copied Cloudinary credentials into the `.env` file, following this
   format:

```bash
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

<h2> Running the Project </h2>

1. Open a terminal window in your project's root directory.
2. Install the project's dependencies:

```bash
yarn install
node ./init/index.js
```

After the message, press CTRL + C and run this command:

```bash
yarn start
```

This will typically start the server on http://localhost:3000 . You can access
the application in your web browser.

**Contributing**

We welcome contributions to Wanderlust!
