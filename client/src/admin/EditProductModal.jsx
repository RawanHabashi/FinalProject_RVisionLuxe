import React, { useEffect, useState } from "react";

// מודאל עריכת מוצר
   // אם נבחר קובץ חדש: ההורה ישלח multipart
   // אחרת: ההורה ישלח JSON, ו-image (אם מולא) יישמר כ-URL/שם קובץ
const EditProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({
    product_id: product?.product_id ?? product?.id ?? null,
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    image: product?.image ?? "",              // URL/שם קובץ קיים
    category_id: product?.category_id ?? "",
  });
  const [file, setFile] = useState(null);     // קובץ חדש (אופציונלי)

  // סגירה ב-Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.product_id) {
      alert("❌ Missing product id");
      return;
    }
    const payload = {
      ...form,
      price: Number(form.price),
    };
    // אם image ריק – לא נדרוס את הקיים בעדכון JSON
    if (!payload.image) delete payload.image;

    onSave(payload, file); // ההורה יחליט JSON/Multipart
  };

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("modal-backdrop")) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-product-title">
        <h3 id="edit-product-title">Edit Product</h3>

        <form onSubmit={submit}>
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />

          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} required />

          <label>Price</label>
          <input name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} required />

          <label>Image URL (optional)</label>
          <input name="image" value={form.image} onChange={handleChange} placeholder="https://... or /uploads/file.jpg" />

          <label>Replace Image (optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

          <label>Category ID (optional)</label>
          <input name="category_id" type="number" min="1" step="1" value={form.category_id ?? ""} onChange={handleChange} />

          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
