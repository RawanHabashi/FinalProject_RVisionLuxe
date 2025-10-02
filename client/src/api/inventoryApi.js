//Roaia Habashi and Rawan Habashi
import axios from 'axios';
const BASE = 'http://localhost:5000/api/inventory';
//Api עזר לניהול  מלאי
export async function listInventory({ query = '', page = 1, pageSize = 10, sort = 'name', dir = 'asc' } = {}) {
  const { data } = await axios.get(`${BASE}/list`, { params: { query, page, pageSize, sort, dir } });
  return data;
}
export async function adjustStock({ product_id, qty_change, reason, note }) {
  const { data } = await axios.post(`${BASE}/adjust`, { product_id, qty_change, reason, note });
  return data;
}
export async function fetchMovements(product_id) {
  const { data } = await axios.get(`${BASE}/movements/${product_id}`);
  return data;
}
export async function getInventoryStats() {
  const { data } = await axios.get(`${BASE}/stats`);
  return data;
}
