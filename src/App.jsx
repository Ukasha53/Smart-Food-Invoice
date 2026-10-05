// ============================================================
// Al Rashid Food Company — Food Billing & Menu Management App
// Built with: Vite + React + Tailwind CSS + Supabase + jsPDF
// ============================================================
// ⚠️  REPLACE THE TWO PLACEHOLDER VALUES BELOW WITH YOUR OWN:
// ============================================================
const SUPABASE_URL  = "https://rfrfxcouzbnrpwwfjxpx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xYK21XX_Kh5uH-uygTXGhg_CfXpoVvh";
// ============================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ShoppingCart,
  Utensils,
  Plus,
  Minus,
  Trash2,
  Upload,
  Edit3,
  X,
  CheckCircle,
  AlertCircle,
  PackageOpen,
  ChefHat,
  Receipt,
  ImagePlus,
  Save,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  Sparkles,
  FileText,
  DollarSign,
  ShoppingBag,
  Layers,
  ArrowRight,
  BadgeCheck,
  Flame,
  BadgeDollarSign,
} from "lucide-react";

// Supabase client — wrapped so the UI still renders with placeholder credentials
let supabase = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch {
  console.warn("Supabase not configured yet — replace the placeholder URL and anon key.");
}

const STORAGE_BUCKET = "food-images";

// Utility helpers
const generateInvoiceNo = () =>
  `ARF-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-4)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(n);

// Toast component
function Toast({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold pointer-events-auto border animate-slide-in
            ${t.type === "success"
              ? "bg-emerald-950 border-emerald-500/40 text-emerald-300 shadow-emerald-900/40"
              : "bg-red-950 border-red-500/40 text-red-300 shadow-red-900/40"}`}
        >
          <div className={`p-1 rounded-lg ${t.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
            {t.type === "success" ? <CheckCircle size={16} className="text-emerald-400" /> : <AlertCircle size={16} className="text-red-400" />}
          </div>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// Placeholder image
const PlaceholderImg = () => (
  <div className="w-full h-48 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 flex flex-col items-center justify-center rounded-t-2xl relative overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #f59e0b 0%, transparent 60%)" }} />
    <div className="p-4 bg-slate-700/60 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
      <Utensils className="text-amber-400/70" size={36} />
    </div>
    <p className="text-slate-500 text-xs mt-2 font-medium">No Image</p>
  </div>
);

// Food Card — Premium
function FoodCard({ item, onSelect, onEdit, onDelete }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-lg overflow-hidden flex flex-col border border-slate-700/60 hover:border-amber-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImg />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={() => onSelect(item)}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs px-5 py-2 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus size={13} /> Quick Add
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm leading-snug flex-1">{item.name}</h3>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
            <Star size={9} className="text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">Top</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-4">
          <BadgeDollarSign size={14} className="text-amber-400" />
          <span className="text-amber-400 font-extrabold text-base">{formatCurrency(item.price)}</span>
        </div>

        <div className="mt-auto flex gap-1.5">
          <button
            onClick={() => onSelect(item)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold text-xs py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30"
          >
            <ShoppingCart size={13} /> Add to Order
          </button>
          <button
            onClick={() => onEdit(item)}
            title="Edit item"
            className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-blue-600/80 text-slate-400 hover:text-white transition-all duration-200 border border-slate-600/40 hover:border-blue-500/40"
          >
            <Edit3 size={13} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            title="Delete item"
            className="p-2.5 rounded-xl bg-slate-700/80 hover:bg-red-600/80 text-slate-400 hover:text-white transition-all duration-200 border border-slate-600/40 hover:border-red-500/40"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Item Form Modal — Enhanced
function ItemFormModal({ initial, onClose, onSaved, addToast }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.image_url ?? null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!name.trim()) return "Item name is required.";
    if (!price || isNaN(Number(price)) || Number(price) <= 0) return "A valid price is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { addToast(err, "error"); return; }
    if (!supabase) { addToast("Supabase not configured. Please add your credentials.", "error"); return; }

    setLoading(true);

    try {
      let imageUrl = initial?.image_url ?? null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const filePath = `public/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, imageFile, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const payload = { name: name.trim(), price: Number(price), image_url: imageUrl };

      if (initial?.id) {
        const { error } = await supabase.from("food_items").update(payload).eq("id", initial.id);
        if (error) throw error;
        addToast("Item updated successfully!", "success");
      } else {
        const { error } = await supabase.from("food_items").insert([payload]);
        if (error) throw error;
        addToast("Item added successfully!", "success");
      }

      onSaved();
      onClose();
    } catch (err) {
      addToast(err.message ?? "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700/60 overflow-hidden">
        {/* Modal Header */}
        <div className="relative px-6 py-5 border-b border-slate-700/60 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, #f59e0b, transparent 60%)" }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl">
                <ChefHat className="text-amber-400" size={20} />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{initial?.id ? "Edit Food Item" : "Add New Item"}</h2>
                <p className="text-slate-400 text-xs">{initial?.id ? "Update item details" : "Fill in the details below"}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700/60 hover:bg-red-600/60 text-slate-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Image Drop Zone */}
          <div
            className={`w-full h-44 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center cursor-pointer bg-slate-900/60 transition-all relative group
              ${dragging ? "border-amber-400 bg-amber-500/5 scale-[1.01]" : "border-slate-600 hover:border-amber-500/60"}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="text-white mb-1" size={24} />
                  <span className="text-white text-xs font-medium">Click or drag to change</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2.5 text-slate-500">
                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <ImagePlus size={32} className="text-amber-400/50" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-400">Drop image here or click to upload</p>
                  <p className="text-xs text-slate-600 mt-0.5">PNG, JPG, WEBP supported</p>
                </div>
              </div>
            )}
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Fields */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              <Utensils size={12} /> Item Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chicken Biryani"
              className="w-full bg-slate-900 text-white border border-slate-600/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder-slate-600"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              <BadgeDollarSign size={12} /> Price (PKR) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">Rs.</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="350"
                min="1"
                className="w-full bg-slate-900 text-white border border-slate-600/60 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <X size={15} /> Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
            >
              {loading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {initial?.id ? "Update Item" : "Save Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Cart Item Row
function CartItem({ ci, onIncrease, onDecrease, onRemove }) {
  return (
    <div className="bg-slate-900/60 rounded-2xl p-3.5 flex items-center gap-3 border border-slate-700/40 hover:border-amber-500/20 transition-all duration-200 group">
      {ci.image_url ? (
        <img src={ci.image_url} alt={ci.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-700/60" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700/60">
          <Utensils size={18} className="text-amber-400/50" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-bold truncate mb-0.5">{ci.name}</p>
        <p className="text-amber-400 text-xs font-semibold">{formatCurrency(ci.price)} × {ci.qty}</p>
        <p className="text-slate-400 text-xs">= <span className="text-white font-bold">{formatCurrency(ci.price * ci.qty)}</span></p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onDecrease(ci.id)}
          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-red-600/80 text-white flex items-center justify-center transition-all duration-200 border border-slate-600/40 hover:border-red-500/40"
        >
          <Minus size={12} />
        </button>
        <span className="text-white font-extrabold text-sm w-7 text-center tabular-nums">{ci.qty}</span>
        <button
          onClick={() => onIncrease(ci.id)}
          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-emerald-600/80 text-white flex items-center justify-center transition-all duration-200 border border-slate-600/40 hover:border-emerald-500/40"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={() => onRemove(ci.id)}
          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-red-700 text-slate-500 hover:text-white flex items-center justify-center transition-all duration-200 ml-0.5 border border-slate-600/40 hover:border-red-500/40"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// Cart Panel — Premium
function CartPanel({ cart, onIncrease, onDecrease, onRemove, onDownloadPDF }) {
  const grandTotal = cart.reduce((sum, ci) => sum + ci.price * ci.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);
  const tax = Math.round(grandTotal * 0.05);

  return (
    <aside className="w-full lg:w-[400px] flex flex-col gap-0 rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl shadow-slate-950/80 flex-shrink-0">
      {/* Panel Header */}
      <div className="px-5 py-4 flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f59e0b, transparent 60%)" }} />
        <div className="relative flex items-center gap-3 w-full">
          <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl">
            <ShoppingCart className="text-amber-400" size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-bold text-base">Current Order</h2>
            <p className="text-slate-400 text-xs">
              {cart.length === 0 ? "No items added yet" : `${totalItems} item${totalItems !== 1 ? "s" : ""} in cart`}
            </p>
          </div>
          {cart.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-amber-900/40">
              {totalItems}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto bg-slate-800/60 px-4 py-3 space-y-2.5" style={{ maxHeight: "calc(100vh - 380px)", minHeight: "180px" }}>
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
            <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700/60">
              <PackageOpen className="text-slate-600" size={44} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-semibold">Your order is empty</p>
              <p className="text-slate-600 text-xs mt-1">Click "Add to Order" on any menu item</p>
            </div>
          </div>
        ) : (
          cart.map((ci) => (
            <CartItem
              key={ci.id}
              ci={ci}
              onIncrease={onIncrease}
              onDecrease={onDecrease}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-700/60 px-5 py-5 space-y-4">
        {cart.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1.5"><Receipt size={13} />Subtotal</span>
              <span className="text-white font-semibold tabular-nums">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1.5"><Sparkles size={13} />Service Tax (5%)</span>
              <span className="text-white font-semibold tabular-nums">{formatCurrency(tax)}</span>
            </div>
            <div className="border-t border-slate-700/60 pt-2.5" />
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-sm flex items-center gap-1.5">
                <TrendingUp size={15} className="text-amber-400" />
                Grand Total
              </span>
              <span className="text-amber-400 font-extrabold text-2xl tabular-nums">
                {formatCurrency(grandTotal + tax)}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onDownloadPDF}
          disabled={cart.length === 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-slate-900 disabled:cursor-not-allowed font-extrabold text-sm transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 group"
        >
          <FileText size={17} className="group-hover:scale-110 transition-transform" />
          Generate PDF Invoice
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </aside>
  );
}

// PDF Generator — Professional Invoice
function generatePDF(cart) {
  if (cart.length === 0) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const invoiceNo = generateInvoiceNo();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", {
    year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  const grandTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(grandTotal * 0.05);
  const netTotal = grandTotal + tax;

  // Background
  doc.setFillColor(250, 250, 252);
  doc.rect(0, 0, pageW, pageH, "F");

  // Header Band
  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, pageW, 58, "F");

  // Amber accent bar at top
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageW, 4, "F");

  // Company icon block
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(14, 11, 22, 22, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(10, 15, 30);
  doc.text("AR", 25, 25.5, { align: "center" });

  // Company Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(245, 158, 11);
  doc.text("AL RASHID FOOD COMPANY", 42, 20);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Premium Quality Food Catering & Dining Services", 42, 27);

  // Contact info
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Karachi, Pakistan  |  +92-300-0000000  |  info@alrashidfood.com", 42, 33);

  // INVOICE label on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(245, 158, 11);
  doc.text("INVOICE", pageW - 14, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`No: ${invoiceNo}`, pageW - 14, 28, { align: "right" });
  doc.text(`Date: ${dateStr}`, pageW - 14, 34, { align: "right" });
  doc.text(`Time: ${timeStr}`, pageW - 14, 40, { align: "right" });

  // PAID badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageW - 14 - 34, 44, 34, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("PAID", pageW - 14 - 17, 49.5, { align: "center" });

  // Divider
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.8);
  doc.line(0, 58, pageW, 58);

  // Bill To / Info Band
  doc.setFillColor(245, 247, 250);
  doc.rect(0, 58, pageW, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("BILL TO", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text("Walk-in Customer", 14, 71.5);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Counter Sale", 14, 76.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("ORDER DETAILS", pageW / 2, 65);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text(`${cart.reduce((s, c) => s + c.qty, 0)} item(s)`, pageW / 2, 71.5);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Dine-in / Takeaway", pageW / 2, 76.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("PAYMENT METHOD", pageW - 14, 65, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.text("Cash", pageW - 14, 71.5, { align: "right" });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("On Counter", pageW - 14, 76.5, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, 80, pageW - 14, 80);

  // Items Table
  const tableRows = cart.map((ci, i) => [
    i + 1,
    ci.name,
    `Rs. ${ci.price.toLocaleString()}`,
    ci.qty,
    `Rs. ${(ci.price * ci.qty).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 84,
    head: [["#", "Item Description", "Unit Price", "Qty", "Amount"]],
    body: tableRows,
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      cellPadding: { top: 5, bottom: 5, left: 5, right: 5 },
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [10, 15, 30],
      textColor: [245, 158, 11],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12, fontStyle: "bold" },
      1: { cellWidth: "auto" },
      2: { halign: "right", cellWidth: 32 },
      3: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      4: { halign: "right", cellWidth: 34, fontStyle: "bold" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    rowStyles: { fillColor: [255, 255, 255] },
    tableLineColor: [203, 213, 225],
    tableLineWidth: 0.2,
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY;

  // Totals Block
  const totalsX = pageW - 14 - 75;
  const totalsW = 75;
  let ty = finalY + 6;

  // Subtotal
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX, ty, totalsW, 9, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Subtotal:", totalsX + 5, ty + 6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rs. ${grandTotal.toLocaleString()}`, pageW - 14, ty + 6.5, { align: "right" });
  ty += 10;

  // Tax
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX, ty, totalsW, 9, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Service Tax (5%):", totalsX + 5, ty + 6.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Rs. ${tax.toLocaleString()}`, pageW - 14, ty + 6.5, { align: "right" });
  ty += 11;

  // Grand Total
  doc.setFillColor(10, 15, 30);
  doc.roundedRect(totalsX, ty, totalsW, 14, 3, 3, "F");
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(totalsX, ty, 4, 14, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(245, 158, 11);
  doc.text("GRAND TOTAL:", totalsX + 8, ty + 9);
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Rs. ${netTotal.toLocaleString()}`, pageW - 16, ty + 9, { align: "right" });

  // Notes section
  const notesY = ty + 20;
  if (notesY + 24 < pageH - 30) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, notesY - 2, pageW / 2 - 10, notesY - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("NOTES", 14, notesY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("All prices include applicable taxes as stated above.", 14, notesY + 10);
    doc.text("This invoice is computer-generated and valid without signature.", 14, notesY + 16);
    doc.text("For queries, contact us at info@alrashidfood.com", 14, notesY + 22);
  }

  // Footer
  const footerY = pageH - 20;
  doc.setFillColor(10, 15, 30);
  doc.rect(0, footerY - 6, pageW, 26, "F");
  doc.setFillColor(245, 158, 11);
  doc.rect(0, footerY - 6, pageW, 1.2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11);
  doc.text("AL RASHID FOOD COMPANY", pageW / 2, footerY + 1, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Thank you for your order! Taste the Tradition of Excellence.", pageW / 2, footerY + 7, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice ${invoiceNo}  -  Generated on ${dateStr}`, pageW / 2, footerY + 13, { align: "center" });

  doc.save(`AlRashid_Invoice_${invoiceNo}.pdf`);
}

// Stats Bar
function StatsBar({ items, cart }) {
  const totalItems = items.length;
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartValue = cart.reduce((s, c) => s + c.price * c.qty, 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { icon: <Layers size={18} className="text-blue-400" />, label: "Menu Items", value: totalItems, bg: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20" },
        { icon: <ShoppingBag size={18} className="text-emerald-400" />, label: "In Cart", value: cartCount, bg: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20" },
        { icon: <DollarSign size={18} className="text-amber-400" />, label: "Order Value", value: formatCurrency(cartValue), bg: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20" },
      ].map((s, i) => (
        <div key={i} className={`bg-gradient-to-br ${s.bg} border ${s.border} rounded-2xl px-4 py-3 flex items-center gap-3`}>
          <div className="p-2 bg-slate-800/60 rounded-xl">{s.icon}</div>
          <div>
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className="text-white font-extrabold text-sm tabular-nums">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main App
export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const fetchItems = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .order("id", { ascending: false });
    if (error) addToast(error.message, "error");
    else setItems(data ?? []);
    setLoading(false);
  }, [addToast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id) => {
    if (!supabase) { addToast("Supabase not configured.", "error"); return; }
    if (!window.confirm("Delete this item permanently?")) return;
    const { error } = await supabase.from("food_items").delete().eq("id", id);
    if (error) addToast(error.message, "error");
    else { addToast("Item deleted.", "success"); fetchItems(); }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    addToast(`${item.name} added to order!`, "success");
  };

  const increaseQty = (id) => setCart((p) => p.map((c) => c.id === id ? { ...c, qty: c.qty + 1 } : c));
  const decreaseQty = (id) =>
    setCart((p) => {
      const updated = p.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return updated.filter((c) => c.qty > 0);
    });
  const removeFromCart = (id) => setCart((p) => p.filter((c) => c.id !== id));

  const openEdit = (item) => { setEditItem(item); setShowModal(true); };
  const openAdd  = () => { setEditItem(null); setShowModal(true); };

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const isConfigured = supabase !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Toast toasts={toasts} />

      {/* Setup banner */}
      {!isConfigured && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 text-sm font-semibold px-4 py-3 flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          Supabase not configured — open{" "}
          <code className="bg-amber-700/30 px-1.5 py-0.5 rounded font-mono text-xs">src/App.jsx</code>
          {" "}and replace{" "}
          <code className="bg-amber-700/30 px-1.5 py-0.5 rounded font-mono text-xs">SUPABASE_URL</code>
          {" "}and{" "}
          <code className="bg-amber-700/30 px-1.5 py-0.5 rounded font-mono text-xs">SUPABASE_ANON_KEY</code>.
        </div>
      )}

      {showModal && (
        <ItemFormModal
          initial={editItem}
          onClose={() => { setShowModal(false); setEditItem(null); }}
          onSaved={fetchItems}
          addToast={addToast}
        />
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-700/50 shadow-2xl shadow-slate-950/80 backdrop-blur-xl bg-slate-900/90">
        <div className="max-w-screen-2xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-900/40">
                <ChefHat size={24} className="text-slate-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">
                <span className="text-amber-400">Al Rashid</span>{" "}
                <span className="text-white">Food</span>
              </h1>
              <p className="text-slate-500 text-xs font-medium flex items-center gap-1">
                <Sparkles size={10} className="text-amber-500" />
                Menu & Billing System
              </p>
            </div>
          </div>

          {/* Center tagline */}
          <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs">
            <BadgeCheck size={14} className="text-amber-400" />
            <span>Premium Quality Catering</span>
            <span className="text-slate-700">•</span>
            <Flame size={12} className="text-red-400" />
            <span>Fresh Daily</span>
          </div>

          {/* Add Item */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-extrabold text-sm px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50 hover:scale-[1.02] active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Add Item
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-screen-2xl mx-auto px-5 py-6 flex flex-col lg:flex-row gap-6">
        {/* Menu Section */}
        <section className="flex-1 min-w-0">

          {/* Stats Bar */}
          <StatsBar items={items} cart={cart} />

          {/* Search & Controls */}
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/80 text-white border border-slate-700/60 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all placeholder-slate-600"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={fetchItems}
              title="Refresh menu"
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-2xl transition-all hover:border-amber-500/40 group"
            >
              <RefreshCw size={15} className={`text-slate-400 group-hover:text-amber-400 transition-colors ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="px-3 py-2.5 bg-slate-800/50 border border-slate-700/40 rounded-2xl">
              <span className="text-slate-400 text-sm font-semibold tabular-nums">
                <span className="text-white">{filtered.length}</span> item{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Section Label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-amber-500 rounded-full" />
              <h2 className="text-white font-bold text-sm tracking-wide">MENU ITEMS</h2>
            </div>
            <div className="flex-1 h-px bg-slate-700/60" />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-800/60 rounded-2xl animate-pulse border border-slate-700/30">
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-700 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-700 rounded-lg w-1/2" />
                    <div className="h-9 bg-slate-700 rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-5">
              <div className="p-8 bg-slate-800/60 rounded-3xl border border-slate-700/40">
                <PackageOpen className="text-slate-600" size={56} />
              </div>
              <div className="text-center">
                <p className="text-slate-400 font-bold text-lg">
                  {search ? "No items match your search" : "No food items yet"}
                </p>
                <p className="text-slate-600 text-sm mt-1">
                  {search ? "Try different keywords" : "Click Add Item to get started"}
                </p>
              </div>
              {!search && (
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm px-6 py-3 rounded-2xl transition-all"
                >
                  <Plus size={16} /> Add First Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onSelect={addToCart}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Cart Panel */}
        <CartPanel
          cart={cart}
          onIncrease={increaseQty}
          onDecrease={decreaseQty}
          onRemove={removeFromCart}
          onDownloadPDF={() => generatePDF(cart)}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-8 py-5 text-center">
        <p className="text-slate-600 text-xs flex items-center justify-center gap-2">
          <ChefHat size={12} className="text-amber-500" />
          © {new Date().getFullYear()} Al Rashid Food Company — All Rights Reserved
          <span className="text-slate-700">•</span>
          <Sparkles size={11} className="text-amber-500" />
          Taste the Tradition
        </p>
      </footer>
    </div>
  );
}
