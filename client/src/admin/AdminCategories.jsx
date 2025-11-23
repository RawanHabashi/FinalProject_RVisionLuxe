// Roaia Habashi and Rawan Habashi

import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import CategoryModal from "./CategoryModal";
import "./AdminCategories.css";

// ניהול קטגוריות
export default function AdminCategories({ onBack = () => {} }) {
  const [categories, setCategories] = useState([]);  // רשימת כל הקטגוריות
  const [usageMap, setUsageMap] = useState({});//לכל קטגוריה כמה מוצרים שייכים אליה
   
  // טעינה ושגיאה להצגת מצבים למשתמש
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
    // סטייטים עבור הוספה/עריכה
  const [editingCat, setEditingCat] = useState(null);
  const [adding, setAdding] = useState(false);

  //להצגת תמונה מהשרת
  const API_HOST = (api?.defaults?.baseURL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );

    // פונקציה המחזירה את כתובת התמונה המלאה
  const getImageSrc = (img) => {
    if (!img) return "";
    if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/"))
      return img;
    if (img.startsWith("uploads/") || img.startsWith("images/"))
      return `${API_HOST}/${img}`;
    return `${API_HOST}/images/${img}`;
  };

  // פונקציה שמיישרת את השדות מה-DB לצורה נוחה בצד לקוח
  const normalizeCategory = (row) => {
    const id = row.category_id ?? row.id;
    const name = row.category_name ?? row.name;
    const image = row.image_url ?? row.image;

    return {
      ...row,
      id,
      name,
      image,
    };
  };
  
    // טעינת כל הקטגוריות + בדיקה כמה מוצרים משוייכים לכל קטגוריה
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
            // שתי קריאות API במקביל – רשימת קטגוריות ומפת שימוש
      const [catRes, useRes] = await Promise.all([
        api.get("/categories"),
        api.get("/categories/in-use-map").catch(() => ({ data: [] })),
      ]);

      const catsArr = Array.isArray(catRes.data) ? catRes.data : [];
      const normalizedCats = catsArr.map(normalizeCategory);

      const useArr = Array.isArray(useRes.data) ? useRes.data : [];
      const map = {};

      useArr.forEach((r) => {
        if (r.category_id != null) {
          map[r.category_id] = Number(r.count) || 0;
        }
      });

      setCategories(normalizedCats);
      setUsageMap(map);
    } catch (e) {
      console.error(e);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

     // בדיקה האם הקטגוריה נמצאת בשימוש (יש מוצרים שמקושרים אליה)
  const isInUse = (id) => (usageMap?.[id] ?? 0) > 0;
  
    // מחיקת קטגוריה
  const handleDelete = async (id) => {
    try {
      let count = usageMap?.[id] ?? undefined;

      // לוודא מהשרת שהקטגוריה לא בשימוש
      if (count === undefined) {
        const chk = await api.get(`/categories/${id}/in-use`);
        count = chk.data?.count ?? 0;
      }
      if (count > 0) {
        alert(`אי אפשר למחוק: בקטגוריה יש ${count} מוצרים.`);
        return;
      }

      if (!window.confirm("Delete this category?")) return;
      
            // מחיקה ב-API
      await api.delete(`/categories/${id}`);
    
       // עדכון רשימת הקטגוריות בצד לקוח
      setCategories((prev) => prev.filter((c) => c.id !== id));
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

  // שמירה של קטגוריה – גם הוספה וגם עריכה
  const handleSave = async (payload, file) => {
  try {
    const isEdit = !!payload.id;   
    const id = payload.id;

    // תמיד נשתמש ב-FormData, גם בהוספה וגם בעריכה
    const fd = new FormData();

    // השם שהמשתמשת הקלידה
    fd.append("name", payload.name);

    // אם הזנת ידנית שם קובץ/URL
    if (payload.image_url) {
      fd.append("image_url", payload.image_url);
    }

    // אם בחרת קובץ – נוסיף אותו
    if (file) {
      fd.append("image", file); 
    }

    if (isEdit) {
      await api.put(`/categories/${id}`, fd);
    } else {
      await api.post("/categories", fd);
    }

      // ריענון כל הרשימה לאחר השמירה
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
        <h2 className="cats-title">Category Management🗂️</h2>
        <button className="cats-back-btn" onClick={onBack}>
          Back to Admin
        </button>
      </div>

      <div className="toolbar">
        <button className="add-btn" onClick={() => setAdding(true)}>
          Add a new category +
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {sortedCategories.length === 0 ? (
            <div className="empty">No categories yet.</div>
          ) : (
            sortedCategories.map((c) => {
              const id = c.id;
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
                    {used && (
                      <span
                        className="badge-used"
                        title={`${count} product(s)`}
                      >
                        Has products
                      </span>
                    )}
                  </div>

                  <div className="actions">
                    <button
                      className="danger"
                      disabled={used}
                      title={
                        used
                          ? "Cannot delete a category that has products"
                          : ""
                      }
                      onClick={() => handleDelete(id)}
                    >
                      delete
                    </button>
                    <button
                      className="secondary"
                      onClick={() => setEditingCat(c)}
                    >
                      update
                    </button>
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
