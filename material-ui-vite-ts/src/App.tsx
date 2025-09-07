import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Order from "./pages/Order";
import MasterFood from "./pages/MasterFood";
import OrderList from "./pages/OrderList";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order/:tableId" element={<Order />} />
        <Route path="/masterfood" element={<MasterFood />} />
        <Route path="/orderlist" element={<OrderList />} />
      </Routes>
    </Router>
  );
};

export default App;
