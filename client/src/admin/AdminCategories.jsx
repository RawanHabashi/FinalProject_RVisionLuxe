import React, { useEffect, useState } from "react";
import api from "../api/axios";
import CategoryModal from "./CategoryModal";
import "./AdminCategories.css";

export default function AdminCategories({ onBack = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [editingCat, setEditingCat] = useState(null); // null -> אין מודאל
  const [adding, setAdding] = useState(false);        // true -> מודאל הוספה

  // עוזר להצגת תמונה (כמו במוצרים)
  const API_HOST = (api?.defaults?.baseURL || "http://localhost:5000").replace(/\/api\/?$/, "");
  const getImageSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) return img;
    if (img.startsWith("uploads/") || img.startsWith("images/")) return `${API_HOST}/${img}`;
    return `${API_HOST}/images/${img}`;
  };

  // שליפה
  const fetchCategories = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
      if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => (c.category_id ?? c.id) !== id));
    } catch (e) {
      console.error(e);
      alert("❌ Delete failed");
    }
  };

  const handleSave = async (payload, file) => {
    try {
      const isEdit = !!payload.category_id || !!payload.id;
      const id = payload.category_id ?? payload.id;

      if (file) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => fd.append(k, v ?? ""));
        fd.append("image", file);

        if (isEdit) await api.put(`/categories/${id}`, fd);
        else        await api.post("/categories", fd);
      } else {
        if (isEdit) await api.put(`/categories/${id}`, payload);
        else        await api.post("/categories", payload);
      }

      await fetchCategories();
      setEditingCat(null);
      setAdding(false);
      alert("✅ Saved");
    } catch (e) {
      console.error(e);
      alert("❌ Save failed");
    }
  };

  return (
    <div className="admin-cats">
      <div className="admin-cats-header">
        <h2>🗂️ Category management</h2>
        <button className="back-home-btn" onClick={onBack}>← Back to Admin</button>
      </div>

      <div className="toolbar">
        <button className="add-btn" onClick={() => setAdding(true)}>Add a new category +</button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {categories.length === 0 ? (
            <div className="empty">No categories yet.</div>
          ) : (
            categories.map((c) => {
              const id = c.category_id ?? c.id;
              return (
                <div className="card" key={id}>
                  <div className="img-wrap">
                    {c.image ? (
                      <img src={getImageSrc(c.image)} alt={c.name} />
                    ) : (
                      <div className="noimg">No image</div>
                    )}
                  </div>
                  <div className="title">{c.name}</div>
                  <div className="actions">
                    <button className="danger" onClick={() => handleDelete(id)}>delete</button>
                    <button className="secondary" onClick={() => setEditingCat(c)}>update</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* מודאל הוספה */}
      {adding && (
        <CategoryModal
          mode="add"
          onClose={() => setAdding(false)}
          onSave={handleSave}
        />
      )}

      {/* מודאל עדכון */}
      {editingCat && (
        <CategoryModal
          mode="edit"
          category={editingCat}
          onClose={() => setEditingCat(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
