// דף הדשבורד של אדמין
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard({
  // callbacks מהאפליקציה הראשית
  onBack = () => {},
  onManageUsers = () => {},
  onManageProducts = () => {},
  onManageCategories = () => {},
   onManageOrders = () => {},
}) {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    orders: 0,
  });
  const [adminName] = useState("Admin"); // אם תרצי: לשאוב מ-localStorage

  // טעינת סטטיסטיקות פעם אחת
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/stats");
        if (isMounted && res?.data && typeof res.data === "object") {
          setStats((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="admin-dashboard"
      style={{
        backgroundImage: "url('/images/admin-background.jpg')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        backgroundAttachment: "fixed",
      }}
    >
      <img src="/Rvision Luxe-Logo.jpg" alt="Admin" className="admin-avatar" />
      <h1>Admin Dashboard</h1>
      <p className="welcome-text">
        Welcome back, <strong>{adminName}</strong>! Here's your control panel.
      </p>

      <div className="stats-cards">
        <div className="card">👥 Users: {stats.users}</div>
        <div className="card">👜 Products: {stats.products}</div>
        <div className="card">📁 Categories: {stats.categories}</div>
        <div className="card">📦 Orders: {stats.orders}</div>
      </div>

      <div className="dashboard-buttons">
        <button onClick={onManageUsers}>👥 Manage Users</button>
        <button onClick={onManageProducts}>👜 Manage Products</button>
        <button onClick={onManageCategories}>📁 Manage Categories</button>
         <button onClick={onManageOrders}>📦 Manage Orders</button>
        <button onClick={onBack}>🏠 Back to Home</button>
      </div>
    </div>
  );
}
