import React, { useEffect, useState } from 'react';
import { getInventoryStats, adjustStock } from '../api/inventoryApi';
import './InventorySnapshot.css';
//תקציר מלאי בדף ראשי בממשק מנהל 
export default function InventorySnapshot({ onManageClick }) {
  const [stats, setStats] = useState({ outOfStock: 0, lowCount: 0, reservedTotal: 0, topLow: [] });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setStats(await getInventoryStats()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function quickAdjust(item, delta) {
    await adjustStock({
      product_id: item.product_id,
      qty_change: delta,
      reason: delta > 0 ? 'Purchase' : 'Correction'
    });
    await load();
  }

  return (
    <div className="inv-snap">
      <div className="inv-snap-header">
        <h3>Inventory Snapshot</h3>
        <button className="manage-btn" onClick={onManageClick}>Manage Inventory</button>
      </div>

      <div className="inv-snap-kpis">
        <div className="kpi"><div className="kpi-title">Out of stock</div><div className="kpi-value">{stats.outOfStock}</div></div>
        <div className="kpi"><div className="kpi-title">Low stock</div><div className="kpi-value">{stats.lowCount}</div></div>
        <div className="kpi"><div className="kpi-title">Reserved (units)</div><div className="kpi-value">{stats.reservedTotal}</div></div>
      </div>

      <div className="inv-snap-table">
        {loading ? <div className="loading">Loading…</div> :
         stats.topLow.length === 0 ? <div className="empty">No products</div> :
         <table>
           <thead>
             <tr>
               <th>Name</th><th>Stock</th><th>Reserved</th><th>Available</th><th>Reorder</th><th>Quick</th>
             </tr>
           </thead>
           <tbody>
             {stats.topLow.map(item => (
               <tr key={item.product_id} className={item.available <= 0 ? 'row-out' : (item.available <= item.reorder_level ? 'row-low' : '')}>
                 <td>{item.name}</td>
                 <td>{item.stock}</td>
                 <td>{item.reserved}</td>
                 <td>{item.available}</td>
                 <td>{item.reorder_level}</td>
                 <td className="quick">
                   <button onClick={() => quickAdjust(item, +1)}>+</button>
                   <button onClick={() => quickAdjust(item, -1)}>-</button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>}
      </div>
    </div>
  );
}
