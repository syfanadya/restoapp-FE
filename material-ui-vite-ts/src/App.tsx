import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing jadi halaman utama */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </Router>
  );
};

export default App;
