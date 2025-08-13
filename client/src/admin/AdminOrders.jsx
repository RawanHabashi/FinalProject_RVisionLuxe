import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./AdminOrders.css";

const STATUS_OPTIONS = ["Pending","Processing","Ready for Shipment","In Transit","Delivered"];

// פורמט ₪
const formatILS = (val) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 2 })
    .format(Number(val || 0));

// עמוד אחד – הכל
const LIMIT_ALL = 100000;

export default function AdminOrders({ onBack = () => {} }) {
  const [orders, setOrders]   = useState([]);
  const [q, setQ]             = useState("");
  const [status, setStatus]   = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // פונקציית טעינה שמקבלת אופציונלית override לפרמטרים
  const fetchOrders = async (overrides = {}) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = {
        q:      overrides.q      ?? q,
        status: overrides.status ?? status,
        page: 1,
        limit: LIMIT_ALL,
      };
      const { data } = await api.get("/orders", { params });
      setOrders(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("Failed to load orders", err);
      setErrorMsg("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  // טעינה ראשונית
  useEffect(() => { fetchOrders(); /* eslint-disable-next-line */ }, []);

  // חיפוש עם Enter בלבד
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchOrders({ q: e.currentTarget.value.trim() });
    }
  };

  // שינוי סטטוס מסנן – טען מחדש
  const handleStatusFilter = (e) => {
    const v = e.target.value;
    setStatus(v);
    fetchOrders({ status: v });
  };

  const handleStatusChange = async (order_id, newStatus) => {
    const prev = orders.map(o => ({ ...o }));
    setOrders(list => list.map(o => o.order_id === order_id ? { ...o, status: newStatus } : o));
    try {
      await api.patch(`/orders/${order_id}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("❌ Failed to update status");
      setOrders(prev);
    }
  };

  const openInvoice = (order_id) =>
    window.open(`${api.defaults.baseURL}/orders/invoice/${order_id}`, "_blank");

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
      <h2 className="title">Order Management 📦</h2>
     <button className="orders-back-btn" onClick={onBack}> Back to Admin</button>
     </div>

      {/* סרגל סינון – ללא כפתור חיפוש */}
      <div className="filters">
        <input
          placeholder="Search by name, email, or order id"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={handleKeyDown}   
        />
        <select value={status} onChange={handleStatusFilter}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {errorMsg && <div className="error">{errorMsg}</div>}

      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th style={{ minWidth: 80 }}>ID</th>
                <th style={{ minWidth: 160 }}>Customer</th>
                <th style={{ minWidth: 220 }}>Email</th>
                <th className="num">Items</th>
                <th className="num">Total</th>
                <th style={{ minWidth: 160 }}>Order Date</th>
                <th style={{ minWidth: 160 }}>Status</th>
                <th className="right" style={{ minWidth: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="8" className="center">No orders found</td></tr>
              ) : orders.map((o) => {
                  const totalAmount = Number(o.total_amount) || 0;
                  const created = o.order_date
                    ? new Date(o.order_date).toLocaleString("he-IL", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })
                    : "";
                  return (
                    <tr key={o.order_id}>
                      <td>#{o.order_id}</td>
                      <td>{o.customer_name || "-"}</td>
                      <td>{o.customer_email || "-"}</td>
                      <td className="num">{o.items_count || 0}</td>
                      <td className="num">{formatILS(totalAmount)}</td>
                      <td>{created}</td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="right">
                        <button onClick={() => openInvoice(o.order_id)}>Invoice</button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
