//Roaia Habashi and Rawan Habashi

import React, { useEffect, useMemo, useState } from 'react';
import { listInventory, adjustStock, fetchMovements } from '../api/inventoryApi';
import './AdminInventory.css';
//ניהול מלאי 
const LowBadge = ({ available, reorder }) => {
  const status = available <= 0 ? 'out' : available <= reorder ? 'low' : 'ok';
  const label  = status === 'out' ? 'Out of stock' : status === 'low' ? 'Low' : 'OK';
  return <span className={`inv-badge ${status}`}>{label}</span>;
};
export default function AdminInventory() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sort, setSort] = useState('name');
  const [dir, setDir] = useState('asc');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const pages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);
  async function load() {
    setLoading(true);
    try {
      const data = await listInventory({ query, page, pageSize, sort, dir });
      setRows(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, sort, dir]);
  const onSearch = (e) => { setQuery(e.target.value); setPage(1); };
  const runSearch = () => load();
  const onAdjust = async (product_id) => {
    const qtyStr = prompt('Enter quantity change (use negative to decrease):', '1');
    if (!qtyStr) return;
    const qty_change = Number(qtyStr);
    if (!Number.isInteger(qty_change) || qty_change === 0) return alert('Invalid quantity');
    const reason = window.prompt('Reason (Purchase/Correction/Return/Damage):', 'Purchase');
    if (!reason) return;
    await adjustStock({ product_id, qty_change, reason });
    await load();
    alert('Stock updated');
  };
  const openHistory = async (row) => {
    const moves = await fetchMovements(row.product_id);
    setSel({ ...row, moves });
  };
  const th = (key, label) => (
    <th onClick={() => { if (sort === key) setDir(dir === 'asc' ? 'desc' : 'asc'); else { setSort(key); setDir('asc'); } }}>
      {label} {sort === key ? (dir === 'asc' ? '▲' : '▼') : ''}
    </th>
  );
  return (
    <div className="inv-wrap">
      <div className="inv-header">
        <h3>Inventory</h3>
        <div className="inv-actions">
          <input placeholder="Search by name" value={query} onChange={onSearch} onKeyDown={(e)=>e.key==='Enter'&&runSearch()} />
          <button onClick={runSearch}>Search</button>
        </div>
      </div>
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead>
            <tr>
              {th('name','Name')}
              <th>Category</th>
              {th('price','Price')}
              {th('stock','Stock')}
              <th>Reserved</th>
              <th>Available</th>
              {th('reorder_level','Reorder')}
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" style={{ textAlign:'center' }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign:'center' }}>No products found</td></tr>
            ) : rows.map(r => (
              <tr key={r.product_id} className={(r.stock - r.reserved) <= r.reorder_level ? 'low-row' : ''}>
                <td>{r.name}</td>
                <td>{r.category || '-'}</td>
                <td>{Number(r.price).toFixed(2)}</td>
                <td>{r.stock}</td>
                <td>{r.reserved}</td>
                <td>{r.available}</td>
                <td>{r.reorder_level}</td>
                <td><LowBadge available={r.available} reorder={r.reorder_level} /></td>
                <td className="actions">
                  <button onClick={() => onAdjust(r.product_id)}>Adjust</button>
                  <button onClick={() => openHistory(r)}>History</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="inv-pager">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prev</button>
        <span>{page}/{pages}</span>
        <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
      {sel && (
        <div className="inv-modal" onClick={()=>setSel(null)}>
          <div className="inv-modal-body" onClick={e=>e.stopPropagation()}>
            <h4>Movements – {sel.name}</h4>
            <table className="inv-table small">
              <thead><tr><th>Date</th><th>Change</th><th>Reason</th><th>Note</th></tr></thead>
              <tbody>
                {(sel.moves||[]).map(m => (
                  <tr key={m.id}>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                    <td>{m.qty_change}</td>
                    <td>{m.reason}</td>
                    <td>{m.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={()=>setSel(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
