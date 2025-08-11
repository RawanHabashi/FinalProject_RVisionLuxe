import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CategoryModal from "./CategoryModal";
import "./AdminCategories.css";

export default function AdminCategories({ onBack = () => {} }) {
  const [categories, setCategories] = useState([]);
  const [usageMap, setUsageMap] = useState({}); // { [category_id]: count of products }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [editingCat, setEditingCat] = useState(null);
  const [adding, setAdding] = useState(false);

  // עוזר להצגת תמונה
  const API_HOST = (api?.defaults?.baseURL || "http://localhost:5000").replace(/\/api\/?$/, "");
  const getImageSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) return img;
    if (img.startsWith("uploads/") || img.startsWith("images/")) return `${API_HOST}/${img}`;
    return `${API_HOST}/images/${img}`;
  };

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [catRes, useRes] = await Promise.all([
        api.get("/categories"),
        api.get("/categories/in-use-map").catch(() => ({ data: [] })),
      ]);
      const cats = Array.isArray(catRes.data) ? catRes.data : [];
      const useArr = Array.isArray(useRes.data) ? useRes.data : [];
      const map = {};
      useArr.forEach((r) => { if (r.category_id != null) map[r.category_id] = Number(r.count) || 0; });
      setCategories(cats);
      setUsageMap(map);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const isInUse = (id) => (usageMap?.[id] ?? 0) > 0;

  const handleDelete = async (id) => {
    try {
      // בדיקה פר-קטגוריה (למקרה שהמפה לא עדכנית)
      let count = usageMap?.[id] ?? undefined;
      if (count === undefined) {
        const chk = await api.get(`/categories/${id}/in-use`);
        count = chk.data?.count ?? 0;
      }
      if (count > 0) {
        alert(`אי אפשר למחוק: בקטגוריה יש ${count} מוצרים.`);
        return;
      }

      if (!window.confirm("Delete this category?")) return;

      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => (c.category_id ?? c.id) !== id));
      setUsageMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      alert("✅ Category deleted");
    } catch (e) {
      console.error(e);
      if (e?.response?.status === 409) {
        alert("אי אפשר למחוק: בקטגוריה יש מוצרים.");
      } else {
        alert("❌ Delete failed");
      }
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

      await fetchAll();
      setEditingCat(null);
      setAdding(false);
      alert("✅ Saved");
    } catch (e) {
      console.error(e);
      alert("❌ Save failed");
    }
  };

  // מיון לפי שם
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || ""))
    );
  }, [categories]);

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
          {sortedCategories.length === 0 ? (
            <div className="empty">No categories yet.</div>
          ) : (
            sortedCategories.map((c) => {
              const id = c.category_id ?? c.id;
              const used = isInUse(id);
              const count = usageMap?.[id] ?? 0;
              return (
                <div className={`card ${used ? "card-used" : ""}`} key={id}>
                  <div className="img-wrap">
                    {c.image ? (
                      <img src={getImageSrc(c.image)} alt={c.name} />
                    ) : (
                      <div className="noimg">No image</div>
                    )}
                  </div>
                  <div className="title-row">
                    <div className="title">{c.name}</div>
                    {used && <span className="badge-used" title={`${count} product(s)`}>Has products</span>}
                  </div>
                  <div className="actions">
                    <button
                      className="danger"
                      disabled={used}
                      title={used ? "Cannot delete a category that has products" : ""}
                      onClick={() => handleDelete(id)}
                    >
                      delete
                    </button>
                    <button className="secondary" onClick={() => setEditingCat(c)}>update</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {adding && (
        <CategoryModal
          mode="add"
          onClose={() => setAdding(false)}
          onSave={handleSave}
        />
      )}

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
