//Roaia Habashi and Rawan Habashi

// דף הדשבורד של אדמין
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import InventorySnapshot from "./InventorySnapshot";

export default function AdminDashboard({
  // callbacks מהאפליקציה הראשית
  onBack = () => {},
  onManageUsers = () => {},
  onManageProducts = () => {},
  onManageCategories = () => {},
   onManageOrders = () => {},
   onManageInventory = () => {},
}) {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    orders: 0,
  });
  const [adminName] = useState("Admin"); 

  // ---------- סטייט למע״מ ----------
  const [vatPercent, setVatPercent] = useState(18);  // הערך שהמנהל יכול לערוך בשדה הקלט
  const [currentVat, setCurrentVat] = useState(18);// Current-הערך הנוכחי ששמור בשרת ומוצג כ
const [savingVat, setSavingVat] = useState(false);// דגל המייצג שהשמירה מתבצעת כרגע
  // הודעות למשתמש – הצלחה / שגיאה בשמירת המע״מ
const [vatMsg, setVatMsg] = useState({ type: "", text: "" });
  //טעינת סטטיסטיקות
  useEffect(() => {
    let isMounted = true;// כדי למנוע-setState  אחרי שהקומפוננטה הוסר
    (async () => {
      try {
                // קריאה לשרת להבאת סיכום סטטיסטי (משתמשים, מוצרים, הזמנות וכו')
        const res = await axios.get("http://localhost:5000/api/admin/stats");
        if (isMounted && res?.data && typeof res.data === "object") {
                    // איחוד הערכים מהשרת עם הערכים הקיימים בסטייט
          setStats((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      }
    })();
    return () => {
      isMounted = false;  // פונקציית ניקוי – מסמנת שהקומפוננטה כבר לא קיימת

    };
  }, []);

  // ---------- משיכת אחוז המע״מ מהשרת ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
                // בקשת-GET  להגדרת המע״מ מהשרת
        const res = await axios.get("http://localhost:5000/api/settings/vat");
        if (mounted && typeof res?.data?.vat_percent === "number") {
        setVatPercent(res.data.vat_percent);
      setCurrentVat(res.data.vat_percent);}
      } catch (e) {
        console.error("Failed to fetch VAT", e);
      }
    })();
    return () => (mounted = false);
  }, []);

  // ---------- שמירת אחוז המע״מ ----------
const saveVat = async () => {
  if (isNaN(vatPercent) || vatPercent < 0 || vatPercent > 100) {
    setVatMsg({ type: "err", text: "נא להזין ערך בין 0 ל־100" });
    return;
  }
  try {
    setSavingVat(true);
    await axios.put("http://localhost:5000/api/settings/vat", {
      vat_percent: vatPercent,
    });
    setCurrentVat(vatPercent); 
    setVatMsg({ type: "ok", text: `נשמר בהצלחה ✅ (${vatPercent}%)` });
  } catch (e) {
    console.error("Failed to save VAT", e);
    setVatMsg({ type: "err", text: "שמירה נכשלה ❌" });
  } finally {
    setSavingVat(false);
  }
};

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
  <div className="card">
    👥 Users: {stats.users}
    <button onClick={onManageUsers} className="manage-btn">Manage Users👥</button>
  </div>

  <div className="card">
    👜 Products: {stats.products}
    <button onClick={onManageProducts} className="manage-btn">Manage Products👜</button>
  </div>

  <div className="card">
    📁 Categories: {stats.categories}
    <button onClick={onManageCategories} className="manage-btn">Manage Categories📁</button>
  </div>

  <div className="card">
    📦 Orders: {stats.orders}
    <button onClick={onManageOrders} className="manage-btn">Manage Orders📦</button>
  </div>

  <div className="card">  🗃️ Inventory
   <button onClick={onManageInventory} className="manage-btn">Manage Inventory</button>
  </div>
</div>

      {/* ----------  כרטיס הגדרות למע״מ בדף הראשי ---------- */}
      <div className="vat-card">
  <h3 className="vat-title">VAT Change:</h3>

  {/* Current למעלה ובמרכז */}
  <div className="vat-current top">Current: <strong>{currentVat}%</strong></div>

  <div className="vat-form vat-form--vertical">
    <label htmlFor="vatInput">VAT(%)</label>
    <input
      id="vatInput"
      type="number"
      min="0"
      max="100"
      step="1"
      value={vatPercent}
      onChange={(e) => {
        const n = parseInt(e.target.value || "0", 10);
        setVatPercent(Number.isNaN(n) ? 0 : Math.min(100, Math.max(0, n)));
        setVatMsg({ type: "", text: "" });
      }}
    />
    <button
      className="vat-save"
      onClick={saveVat}
      disabled={savingVat || vatPercent === currentVat}
    >
      {savingVat ? "Saving…" : "Save"}
    </button>
  </div>

  {vatMsg.text && (
    <div className={`vat-msg ${vatMsg.type === "ok" ? "ok" : "err"}`}>
      {vatMsg.text}
    </div>
  )}
</div>

{/* תקציר מלאי בדף הראשי */}
<InventorySnapshot onManageClick={onManageInventory} />

  <div className="dashboard-buttons">
  <button onClick={onBack}>🏠 Back to Home</button>
</div>

    </div>
  );
}
