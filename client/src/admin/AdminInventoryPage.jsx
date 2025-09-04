import React from 'react';
import AdminInventory from './AdminInventory';

export default function AdminInventoryPage() {
  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ color:'#5b3e2b', marginBottom:'12px' }}>Manage Inventory</h2>
      <AdminInventory />
    </div>
  );
}
