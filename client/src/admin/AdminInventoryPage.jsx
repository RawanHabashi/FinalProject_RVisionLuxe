// Roaia Habashi and Rawan Habashi

import React from "react";
import AdminInventory from "./AdminInventory";
import "./AdminCategories.css";
import "./AdminInventory.css";

export default function AdminInventoryPage({ onBack }) {
  return (
    <div className="admin-cats">
      <div className="admin-cats-header">
        <h2 className="cats-title">Manage Inventory</h2>

        <button className="cats-back-btn" onClick={onBack}>
          Back to Admin
        </button>
      </div>

      <AdminInventory />
    </div>
  );
}
