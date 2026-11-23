"use client";
import axios from "axios";
import { ArrowLeft, Loader2, Package, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Biscuits",
  "Spices",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
];
const units = ["kg", "g", "litre", "ml", "piece", "pack"];

interface IGrocery {
  _id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  image?: string;
}

function ViewGrocery() {
  const router = useRouter();
  const [groceries, setGroceries] = useState<IGrocery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<IGrocery | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getGroceries = async () => {
      try {
        const result = await axios.get("/api/auth/admin/grocery");
        setGroceries(result.data.groceries);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getGroceries();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groceries;
    return groceries.filter(
      (g) => g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q),
    );
  }, [groceries, search]);

  const openEdit = (g: IGrocery) => {
    setEditing({ ...g });
    setNewImage(null);
    setPreview(null);
    setError("");
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.price.toString().trim()) {
      setError("Name and price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", editing.name);
      formData.append("category", editing.category);
      formData.append("price", String(editing.price));
      formData.append("unit", editing.unit);
      if (newImage) formData.append("image", newImage);
      const result = await axios.put(`/api/auth/admin/grocery/${editing._id}`, formData);
      const updated = result.data.grocery;
      setGroceries((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      setEditing(null);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (g: IGrocery) => {
    if (!window.confirm(`Delete "${g.name}"? This cannot be undone.`)) return;
    setDeletingId(g._id);
    try {
      await axios.delete(`/api/auth/admin/grocery/${g._id}`);
      setGroceries((prev) => prev.filter((x) => x._id !== g._id));
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/70 shadow-sm border-b z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="text-green-700" size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <span className="text-sm text-gray-500">({groceries.length})</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border mb-6">
          <Search className="text-gray-400 w-5 h-5 mr-2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or category…"
            className="w-full outline-none text-gray-700"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-500 gap-2">
            <Loader2 className="animate-spin" /> Loading products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="mx-auto text-green-600 mb-3" size={56} />
            No products found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((g) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border shadow-sm p-3 flex items-center gap-4"
              >
                <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {g.image && (
                    <Image src={g.image} alt={g.name} fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{g.name}</p>
                  <p className="text-xs text-gray-500">{g.category}</p>
                  <p className="text-sm text-green-700 font-bold">
                    ${g.price} <span className="text-gray-500 font-normal">/ {g.unit}</span>
                  </p>
                </div>
                <button
                  onClick={() => openEdit(g)}
                  className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(g)}
                  disabled={deletingId === g._id}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === g._id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditing(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Edit product</h2>
                <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-red-500">
                  <X />
                </button>
              </div>

              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Name"
                className="w-full border rounded-lg p-3 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="border rounded-lg p-3 text-sm bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={editing.unit}
                  onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                  className="border rounded-lg p-3 text-sm bg-white"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                min={0}
                value={editing.price}
                onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                placeholder="Price"
                className="w-full border rounded-lg p-3 text-sm"
              />
              <label className="flex items-center gap-3 cursor-pointer border border-dashed rounded-lg p-3 text-sm text-gray-600 hover:bg-gray-50">
                <Upload size={18} className="text-green-600" />
                {newImage ? newImage.name : "Change image (optional)"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setNewImage(f);
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </label>
              {(preview || editing.image) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview || editing.image}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={18} />} Save changes
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewGrocery;
