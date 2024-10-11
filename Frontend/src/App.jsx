// src/App.js
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FlashMessages from './components/FlashMessages';
import Listings from './pages/Listings'; // Example page

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="container mx-auto mb-48">
          <FlashMessages />
          <Switch>
            <Route path="/listings" component={Listings} />
            {/* Add other routes here */}
          </Switch>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
