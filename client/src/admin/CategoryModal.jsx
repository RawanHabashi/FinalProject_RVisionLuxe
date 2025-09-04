import "./CategoryModal.css";
import React, { useEffect, useState } from "react";
export default function CategoryModal({ mode = "add", category, onSave, onClose }) {
  const [form, setForm] = useState({
    category_id: category?.category_id ?? category?.id ?? null,
    name: category?.name ?? "",
    image: category?.image ?? "",   
  });
  const [file, setFile] = useState(null);     

  // סגירה ב-Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.name?.trim()) { alert("Name is required"); return; }
    if (!payload.category_id) delete payload.category_id; 
    if (!payload.image?.trim()) delete payload.image;     
    onSave?.(payload, file);
  };

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose?.();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">
        <h3>{mode === "edit" ? "Update Category" : "Add Category"}</h3>
        <form onSubmit={submit} className="form-grid">
          <label>
            Name
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </label>

          <label>
            Image URL (optional)
            <input
              placeholder="https://... or /uploads/file.jpg"
              value={form.image}
              onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            />
          </label>

          <label>
            Upload Image (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              {mode === "edit" ? "Save" : "Add"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
