// Roaia Habashi and Rawan Habashi

import "./CategoryModal.css";
import React, { useEffect, useState } from "react";
 //  קומפוננטת מודאל להוספה/עריכה של קטגוריה
export default function CategoryModal({
  mode = "add",
  category,
  onSave,
  onClose,
}) {
  const isEdit = mode === "edit";

   //שדות הטופס שמנהל ממלא
  const [form, setForm] = useState({
    id: category?.category_id ?? category?.id ?? null,
    name:
      category?.name ??
      category?.category_name ??
      "",
    image_url: category?.image ?? category?.image_url ?? "",
  });

   //אם המשתמש מעלה קובץ תמונה חדש
  const [file, setFile] = useState(null);

  // לעדכן טופס כשנפתחת קטגוריה אחרת לעריכה
  useEffect(() => {
    if (isEdit && category) {
      setForm({
        id: category.category_id ?? category.id ?? null,
        name:
          category.name ??
          category.category_name ??
          "",
        image_url: category.image ?? category.image_url ?? "",
      });
    } else if (!isEdit) {
      setForm({ id: null, name: "", image_url: "" });
      setFile(null);
    }
  }, [isEdit, category]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  
  // היא בודקת תקינות בסיסית, מכינה את הנתונים לפונקציית
  const submit = (e) => {
    e.preventDefault();

    if (!form.name?.trim()) {
      alert("Name is required");
      return;
    }
  
    //הגוף שנשלח לשרת
    const payload = {
      id: form.id, 
      name: form.name.trim(),
      image_url: form.image_url.trim(),
    };

    if (!payload.id) delete payload.id; 
    if (!payload.image_url) delete payload.image_url;

    onSave?.(payload, file);
  };

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose?.();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">
        <h3>{isEdit ? "Update Category" : "Add Category"}</h3>

        <form onSubmit={submit} className="form-grid">
          {isEdit && (
            <label>
              ID
              <input value={form.id ?? ""} readOnly />
            </label>
          )}

          <label>
            Name
            <input
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              required
             placeholder=" Category Name"
            />
          </label>

          <label>
            Image URL 
            <input
              placeholder="Image Name.jpg"
              value={form.image_url}
              onChange={(e) =>
                setForm((p) => ({ ...p, image_url: e.target.value }))
              }
            />
          </label>

          <label>
            Upload Image 
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Save" : "Add"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
