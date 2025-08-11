import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import EditProductModal from "./EditProductModal";
import "./AdminProducts.css";
// שימי לב: בשלב ראשון בלי המודאל. נוסיף אותו אחרי שמוודאים שאין לולאה.

export default function AdminProducts({ onBack = () => {}, categoryId, categoryName }) {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // טופס הוספה
  const [newProd, setNewProd] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category_id: categoryId ?? "",
  });
  const [file, setFile] = useState(null);
  const fileKeyRef = useRef(0); // לאפס שדה קובץ ב-UI

  // helper להצגת תמונה
 const API_HOST =
  (api?.defaults?.baseURL || 'http://localhost:5000')
    .replace(/\/api\/?$/, ''); // "http://localhost:5000"

const getImageSrc = (img) => {
  if (!img) return '';

  // אם כבר כתובת מוחלטת או מתחיל ב-/ – השאירי כמו שהוא
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
    return img;
  }

  // אם נשמר מסלול יחסי ממסד (uploads/... או images/...)
  if (img.startsWith('uploads/') || img.startsWith('images/')) {
    return `${API_HOST}/${img}`;
  }

  // אם זה רק שם קובץ מה-D B (למשל "wallet2.jpg") – זה בתוך server/images
  return `${API_HOST}/images/${img}`;
};

  // שליפה - בטוחה מלולאות
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        let list;
        if (categoryId) {
          const all = await api.get("/products");
          const data = Array.isArray(all.data) ? all.data : [];
          list = data.filter((p) => Number(p.category_id) === Number(categoryId));
        } else {
          const res = await api.get("/products");
          list = Array.isArray(res.data) ? res.data : [];
        }
        if (alive) setProducts(list);
      } catch (e) {
        console.error("Failed to fetch products", e);
        if (alive) setError("Failed to load products");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [categoryId]);

  // מחיקה
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      // רענון
      const res = await api.get("/products");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(categoryId ? list.filter(p => Number(p.category_id) === Number(categoryId)) : list);
      alert("✅ Product deleted");
    } catch (e) {
      console.error("Delete failed", e);
      alert("❌ Delete failed");
    }
  };

  // הוספה (URL או קובץ)
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (!file && !newProd.image.trim()) {
        alert("Please provide an image URL or upload a file.");
        return;
      }

      if (file) {
        const fd = new FormData();
        fd.append("name", newProd.name.trim());
        fd.append("description", newProd.description.trim());
        fd.append("price", String(Number(newProd.price)));
        if (newProd.category_id !== "") fd.append("category_id", String(Number(newProd.category_id)));
        fd.append("image", file);
        await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const payload = {
          name: newProd.name.trim(),
          description: newProd.description.trim(),
          price: Number(newProd.price),
          image: newProd.image.trim(),
        };
        if (newProd.category_id !== "") payload.category_id = Number(newProd.category_id);
        await api.post("/products", payload);
      }

      // איפוס
      setNewProd({ name: "", description: "", price: "", image: "", category_id: categoryId ?? "" });
      setFile(null);
      fileKeyRef.current += 1;

      // רענון
      const res = await api.get("/products");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(categoryId ? list.filter(p => Number(p.category_id) === Number(categoryId)) : list);

      alert("✅ Product added");
    } catch (e) {
      console.error("Add failed", e);
      alert("❌ Add failed");
    }
  };
  const handleSaveEdit = async (payload, fileFromModal) => {
  try {
    let res;
    const id = payload.product_id ?? payload.id;

    if (fileFromModal) {
      // שליחה עם קובץ (multipart)
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
      fd.append("image", fileFromModal);
      res = await api.put(`/products/${id}`, fd); // axios מזהה FormData לבד
    } else {
      // עדכון JSON רגיל (אם image ריק, המודאל כבר מוחק את השדה כדי לא לדרוס)
      res = await api.put(`/products/${id}`, payload);
    }

    if (res.status !== 200) throw new Error("Update failed");

    // עדכון מקומי של הרשימה בלי רענון מלא:
    setProducts(prev =>
      prev.map(pr =>
        (pr.product_id ?? pr.id) === id
          ? { ...pr, ...payload }   // נשמר גם price ו־description; אם השרת מחזיר image חדש – אפשר למשוך שוב או להשאיר כפי שהיה
          : pr
      )
    );
    setEditingProduct(null);
    alert("✅ Product updated");
  } catch (e) {
    console.error("Update failed", e);
    alert("❌ Update failed");
  }
};


  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h2>👜 Manage Products{categoryName ? ` in: ${categoryName}` : ""}</h2>
        <button className="back-home-btn" onClick={onBack}>← Back to Admin</button>
      </div>

      {loading && <div className="loading">Loading products...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>No products found.</td>
              </tr>
            ) : (
              products.map((p, i) => {
                const id = p.product_id ?? p.id;
                const price = Number(p.price);
                return (
                  <tr key={id} className={i % 2 === 0 ? "even" : "odd"}>
                    <td>
                      {p.image ? (
                        <img src={getImageSrc(p.image)} alt={p.name} className="product-thumb" />
                      ) : (
                        <span style={{ opacity: 0.6 }}>No image</span>
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>{Number.isFinite(price) ? `${price.toFixed(0)}$` : "-"}</td>
                    <td className="actions-cell">
                      <button onClick={() => setEditingProduct(p)} // p = המוצר הנוכחי
                        className="edit-btn"> Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(id)}>Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}

      <div className="add-product-card">
        <h3>Add New Product{categoryName ? " to Category" : ""}</h3>
        <form onSubmit={handleAdd} className="add-product-form">
          <label>Product Name</label>
          <input value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required />

          <label>Description</label>
          <input value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} required />

          <label>Price</label>
          <input type="number" min="0" step="1" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required />

          <label>Image URL (optional)</label>
          <input value={newProd.image} onChange={(e) => setNewProd({ ...newProd, image: e.target.value })} placeholder="https://... or /uploads/file.jpg" />

          <label>Image Upload (optional)</label>
          <input
            key={fileKeyRef.current}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          {categoryId == null && (
            <>
              <label>Category ID (optional)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={newProd.category_id}
                onChange={(e) => setNewProd({ ...newProd, category_id: e.target.value })}
                placeholder="e.g. 1"
              />
            </>
          )}

          <button type="submit" className="primary-btn">Add Product</button>
        </form>
      </div>
      {editingProduct && (<EditProductModal
          product={editingProduct}
         onClose={() => setEditingProduct(null)}
         onSave={handleSaveEdit}   
  />
)}
    </div>
  );
}
