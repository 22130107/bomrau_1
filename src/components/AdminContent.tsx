"use client";

import React, { useState, useRef, useTransition, useEffect, useMemo } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
} from "@/app/actions/category";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
  deleteMultipleProductsAction,
  togglePinProductAction,
  ProductFormData,
} from "@/app/actions/product";
import {
  createNotificationAction,
  updateNotificationAction,
  deleteNotificationAction,
} from "@/app/actions/notification";


import { AutocompleteField } from "@/components/AutocompleteField";
import {
  getAllProductOptions,
  createProductOption,
  updateProductOption,
  deleteProductOption,
  ProductOptionFull,
} from "@/app/actions/product-options";

async function uploadToLocal(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || "Upload thất bại");
  }
  return data.url as string;
}

export interface AdminNotification {
  id: number;
  title: string;
  content: string;
  image_url: string;
  is_pinned: boolean;
  is_active: boolean;
  date: string;
}

export interface AdminProduct {
  id: number;
  category_id: number;
  extra_categories: number[];
  title: string;
  image_url: string;
  images: string[];
  price: number;
  original_price: number;
  discount_percent: number;
  fake_sold_count: number;
  fake_remaining_count: number;
  category_name: string;
  status: "available" | "hidden";
  is_pinned: boolean;
  pet_tim?: string;
  san_tim?: string;
  chuong?: string;
  extra_info?: string;
}

export interface AdminAccount {
  id: number;
  product_id: number;
  distributor_id: number | null;
  login_username: string;
  login_password: string;
  cost_price: number;
  status: "available" | "sold" | "hidden";
  note: string;
  product_title: string;
  distributor_name: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  productCount: number;
  soldCount: number;
  is_active: boolean;
}

export interface AdminContentProps {
  initialProducts: AdminProduct[];
  initialAccounts: AdminAccount[];
  initialCategories: AdminCategory[];
  initialNotifications: AdminNotification[];
}

export function AdminContent({
  initialProducts,
  initialAccounts,
  initialCategories,
  initialNotifications,
}: AdminContentProps) {
  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "notifications" | "options"
  >("products");

  const [isPending, startTransition] = useTransition();

  // States cho Product Options
  const [allOptions, setAllOptions] = useState<ProductOptionFull[]>([]);
  const [showAddOption, setShowAddOption] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<number | null>(null);
  const [optionType, setOptionType] = useState<
    "pet_tim" | "san_tim" | "chuong"
  >("pet_tim");
  const [optionName, setOptionName] = useState("");

  useEffect(() => {
    if (activeTab === "options") {
      getAllProductOptions().then(setAllOptions);
    }
  }, [activeTab]);

  // States cho Sản phẩm
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAccountInProduct, setShowAccountInProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
    title: "",
    category_id: 0,
    extra_categories: [2],
    image_url: "",
    images: [],
    price: 0,
    original_price: 0,
    discount_percent: 0,
    fake_sold_count: 0,
    fake_remaining_count: 0,
    status: "available",
    is_pinned: false,
    pet_tim: "",
    san_tim: "",
    chuong: "",
    extra_info: "",
    account_username: "",
    account_password: "",
    account_cost_price: 0,
    account_note: "",
  });

  const productFormRef = useRef<HTMLDivElement>(null);
  const categoryFormRef = useRef<HTMLDivElement>(null);
  const notificationFormRef = useRef<HTMLDivElement>(null);


  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState(0);
  const [productStatusFilter, setProductStatusFilter] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());

  const availableCountByProduct = useMemo(() => {
    const map: Record<number, number> = {};
    for (const a of initialAccounts) {
      if (a.status === "available") {
        map[a.product_id] = (map[a.product_id] || 0) + 1;
      }
    }
    return map;
  }, [initialAccounts]);

  const soldCountByProduct = useMemo(() => {
    const map: Record<number, number> = {};
    for (const a of initialAccounts) {
      if (a.status === "sold") {
        map[a.product_id] = (map[a.product_id] || 0) + 1;
      }
    }
    return map;
  }, [initialAccounts]);

  const filteredProducts = initialProducts.filter((p) => {
    const matchesSearch = p.title
      .toLowerCase()
      .includes(productSearchTerm.toLowerCase());
    const matchesCategory =
      productCategoryFilter === 0 || p.category_id === productCategoryFilter || p.extra_categories.includes(productCategoryFilter);
    const matchesStatus =
      productStatusFilter === "all" || p.status === productStatusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  function toggleSelectProduct(id: number) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const allSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.has(p.id));
    if (allSelected) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(filteredProducts.map((p) => p.id)));
    }
  }

  // States cho Danh mục (Thật)
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    sort_order: 0,
  });

  // States cho Thông báo
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [editingNotificationId, setEditingNotificationId] = useState<
    number | null
  >(null);
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    content: "",
    image_url: "",
    is_pinned: false,
    is_active: true,
  });

  useEffect(() => {
    if (showAddProduct && productFormRef.current) {
      productFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAddProduct, editingProductId]);

  useEffect(() => {
    if (showAddCategory && categoryFormRef.current) {
      categoryFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAddCategory, editingCategoryId]);

  useEffect(() => {
    if (showAddNotification && notificationFormRef.current) {
      notificationFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAddNotification, editingNotificationId]);

  // Cloudinary image upload states and handlers
  const [isUploadingProduct, setIsUploadingProduct] = useState(false);
  const [isUploadingCategory, setIsUploadingCategory] = useState(false);
  const [isUploadingNotification, setIsUploadingNotification] = useState(false);

  const handleNotificationImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingNotification(true);
    try {
      const url = await uploadToLocal(file);
      setNotificationForm((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      alert("Có lỗi xảy ra khi tải ảnh lên: " + err.message);
    } finally {
      setIsUploadingNotification(false);
    }
  };

  const handleProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingProduct(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const url = await uploadToLocal(file);
        urls.push(url);
      }
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
        image_url: prev.image_url || urls[0],
      }));
    } catch (err: any) {
      alert("Có lỗi xảy ra khi tải ảnh lên: " + err.message);
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const removeProductImage = (index: number) => {
    setProductForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image_url: newImages[0] || "",
      };
    });
  };

  const moveProductImage = (from: number, to: number) => {
    setProductForm((prev) => {
      const newImages = [...prev.images];
      const [removed] = newImages.splice(from, 1);
      newImages.splice(to, 0, removed);
      return { ...prev, images: newImages };
    });
  };

  const handleCategoryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCategory(true);
    try {
      const url = await uploadToLocal(file);
      setCategoryForm((prev) => ({ ...prev, image_url: url }));
    } catch (err: any) {
      alert("Có lỗi xảy ra khi tải ảnh lên: " + err.message);
    } finally {
      setIsUploadingCategory(false);
    }
  };

  const tabs = [
    { key: "categories", label: "Danh mục" },
    { key: "products", label: "Sản phẩm" },

    { key: "notifications", label: "Thông báo" },
    { key: "options", label: "Pet/San/Chuong" },
  ] as const;

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto animate-fade-in-up">
      <h1 className="text-[rgb(251,191,36)] text-[24px] md:text-[32px] font-bold mb-6">
        Quản lý Admin
      </h1>

      {/* Tabs */}
      <div className="flex mb-6 bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl overflow-hidden">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-3 text-[11px] md:text-[14px] font-bold transition-colors ${activeTab === t.key ? "bg-[rgb(202,138,4)] text-black" : "text-[rgba(238,238,238,0.7)] hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {activeTab === "products" && (
        <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[rgb(251,191,36)] text-[18px] md:text-[22px] font-bold">
              Quản lý Sản phẩm (Loại)
            </h3>
            <button
              onClick={() => {
                setShowAddProduct(true);
                setEditingProductId(null);
                setShowAccountInProduct(false);
                setProductForm({
                  title: "",
                  category_id: initialCategories[0]?.id || 0,
                  extra_categories: [2],
                  image_url: "",
                  images: [],
                  price: 0,
                  original_price: 0,
                  discount_percent: 0,
                  fake_sold_count: 0,
                  fake_remaining_count: 0,
                  status: "available",
                  is_pinned: false,
                  pet_tim: "",
                  san_tim: "",
                  chuong: "",
                  extra_info: "",
                  account_username: "",
                  account_password: "",
                  account_cost_price: 0,
                  account_note: "",
                });
              }}
              className="px-3 md:px-4 py-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[12px] md:text-[14px] rounded-lg transition-colors"
            >
              + Thêm Sản phẩm
            </button>
          </div>
          {showAddProduct && (
            <div ref={productFormRef} className="mb-6 p-4 md:p-6 bg-[rgb(31,41,55)] rounded-lg border border-[rgb(75,85,99)]">
              <h4 className="text-[rgb(251,191,36)] font-bold text-[16px] mb-4">
                {editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Soraka Banana Chibi"
                    value={productForm.title}
                    onChange={(e) =>
                      setProductForm({ ...productForm, title: e.target.value })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Danh mục *
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category_id: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  >
                    <option value={0}>-- Chọn danh mục --</option>
                    {initialCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Danh mục phụ <span className="text-[rgba(238,238,238,0.3)]">(chọn thêm)</span>
                  </label>
                  <div className="flex items-center gap-2 px-2 py-1">
                    <span className="text-[11px] text-[rgba(238,238,238,0.4)]">Tự động: Giá &gt; 2.999.000đ →</span>
                    <span className={`text-[11px] font-bold ${productForm.price > 2999000 ? "text-[rgb(251,191,36)]" : "text-[rgba(238,238,238,0.3)]"}`}>ACC Vip</span>
                    <span className="text-[rgba(238,238,238,0.15)]">|</span>
                    <span className="text-[11px] text-[rgba(238,238,238,0.4)]">Giá ≤ 2.999.000đ →</span>
                    <span className={`text-[11px] font-bold ${productForm.price <= 2999000 && productForm.price > 0 ? "text-[rgb(34,197,94)]" : "text-[rgba(238,238,238,0.3)]"}`}>Siêu Rẻ</span>
                  </div>
                  <div className="flex flex-wrap gap-2 p-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg">
                    {initialCategories
                      .filter(c => c.id !== productForm.category_id)
                      .map(c => {
                        const checked = productForm.extra_categories.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setProductForm({
                                  ...productForm,
                                  extra_categories: checked
                                    ? productForm.extra_categories.filter(id => id !== c.id)
                                    : [...productForm.extra_categories, c.id]
                                });
                              }}
                              className="w-3.5 h-3.5 accent-[rgb(251,191,36)]"
                            />
                            <span className={`text-[12px] ${checked ? "text-[rgb(251,191,36)]" : "text-[rgba(238,238,238,0.7)]"}`}>
                              {c.name}
                            </span>
                          </label>
                        );
                      })}
                    {initialCategories.filter(c => c.id !== productForm.category_id).length === 0 && (
                      <span className="text-[12px] text-[rgba(238,238,238,0.3)]">Không có danh mục khác</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 md:col-span-3 border-t border-[rgba(238,238,238,0.1)] pt-3 mt-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Ảnh sản phẩm *
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {productForm.images.length === 0 && (
                      <div className="w-24 h-24 border border-dashed border-[rgb(75,85,99)] rounded-lg flex items-center justify-center text-[rgba(238,238,238,0.3)] text-[11px]">
                        Chưa có ảnh
                      </div>
                    )}
                    {productForm.images.map((url, index) => (
                      <div key={index} className="relative group w-24 h-24 border border-[rgb(75,85,99)] rounded-lg overflow-hidden bg-[rgb(17,24,39)]">
                        <img src={url} alt={`Ảnh ${index + 1}`} className="object-contain w-full h-full" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveProductImage(index, Math.max(0, index - 1))}
                            disabled={index === 0}
                            className="p-1 bg-[rgb(59,130,246)] hover:bg-[rgb(96,165,250)] text-white rounded text-[10px] disabled:opacity-30"
                          >◀</button>
                          <button
                            type="button"
                            onClick={() => moveProductImage(index, Math.min(productForm.images.length - 1, index + 1))}
                            disabled={index === productForm.images.length - 1}
                            className="p-1 bg-[rgb(59,130,246)] hover:bg-[rgb(96,165,250)] text-white rounded text-[10px] disabled:opacity-30"
                          >▶</button>
                          <button
                            type="button"
                            onClick={() => removeProductImage(index)}
                            className="p-1 bg-[rgb(220,38,38)] hover:bg-[rgb(248,113,113)] text-white rounded text-[10px]"
                          >✕</button>
                        </div>
                        {index === 0 && (
                          <span className="absolute top-0 left-0 bg-[rgb(251,191,36)] text-black text-[8px] font-bold px-1 py-0.5 rounded-br">
                            Chính
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <label className="cursor-pointer self-start px-4 py-2 bg-[rgb(55,65,81)] hover:bg-[rgb(75,85,99)] text-white text-[14px] rounded-lg border border-[rgb(75,85,99)] font-semibold transition-colors flex items-center justify-center min-w-[120px]">
                    {isUploadingProduct ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang tải...
                      </span>
                    ) : (
                      "+ Thêm ảnh"
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleProductImageUpload}
                      disabled={isUploadingProduct}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Giá gốc / Gạch ngang (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={productForm.original_price}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      const p = productForm.price;
                      setProductForm({
                        ...productForm,
                        original_price: v,
                        discount_percent:
                          p > 0 && v > p
                            ? Math.round((1 - p / v) * 100)
                            : productForm.discount_percent,
                      });
                    }}
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Giá bán thực tế (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      const d = productForm.discount_percent;
                      const autoCat = p > 2999000 ? 1 : 2;
                      setProductForm({
                        ...productForm,
                        price: p,
                        extra_categories: productForm.extra_categories.includes(autoCat)
                          ? productForm.extra_categories
                          : [...productForm.extra_categories, autoCat],
                        original_price:
                          d > 0 && p > 0 ? Math.round(p / (1 - d / 100)) : productForm.original_price,
                        discount_percent:
                          !d && productForm.original_price > 0 && p > 0 && productForm.original_price > p
                            ? Math.round((1 - p / productForm.original_price) * 100)
                            : d,
                      });
                    }}
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    % Giảm giá
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={productForm.discount_percent}
                    onChange={(e) => {
                      const d = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      const p = productForm.price;
                      setProductForm({
                        ...productForm,
                        discount_percent: d,
                        original_price:
                          d > 0 && p > 0 ? Math.round(p / (1 - d / 100)) : productForm.original_price,
                      });
                    }}
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-[rgb(251,191,36)] text-[14px] font-bold outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>



                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Trạng thái
                  </label>
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        status: e.target.value as "available" | "hidden",
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  >
                    <option value="available">Hiện</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </div>

                <div className="flex items-end gap-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_pinned}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          is_pinned: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[rgb(251,191,36)]"
                    />
                    <span className="text-[12px] text-[rgba(238,238,238,0.6)]">
                      Ghim lên đầu
                    </span>
                  </label>
                </div>

                {/* Extra info fields */}
                <div className="flex flex-col gap-1 md:col-span-3 border-t border-[rgba(238,238,238,0.2)] mt-2 pt-3">
                  <span className="text-[14px] text-[rgb(251,191,36)] font-bold">
                    Thông tin chi tiết in-game (Tuỳ chọn)
                  </span>
                </div>
                <AutocompleteField
                  label="Pet Tím"
                  value={productForm.pet_tim}
                  onChange={(v) =>
                    setProductForm({ ...productForm, pet_tim: v })
                  }
                  placeholder="VD: Soraka Chuối Tí Nị"
                  optionType="pet_tim"
                />
                <AutocompleteField
                  label="Sàn Tím"
                  value={productForm.san_tim}
                  onChange={(v) =>
                    setProductForm({ ...productForm, san_tim: v })
                  }
                  optionType="san_tim"
                />
                <AutocompleteField
                  label="Chưởng"
                  value={productForm.chuong}
                  onChange={(v) =>
                    setProductForm({ ...productForm, chuong: v })
                  }
                  optionType="chuong"
                />
                <div className="flex flex-col gap-1 md:col-span-3">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Extra Infor
                  </label>
                  <input
                    type="text"
                    value={productForm.extra_info || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        extra_info: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>

                {/* Thêm tài khoản kèm sản phẩm */}
                <div className="flex items-center gap-2 md:col-span-3 border-t border-[rgba(238,238,238,0.2)] mt-2 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAccountInProduct}
                      onChange={(e) => {
                        setShowAccountInProduct(e.target.checked);
                        if (!e.target.checked) {
                          setProductForm({ ...productForm, account_username: "", account_password: "" });
                        }
                      }}
                      className="w-4 h-4 accent-[rgb(251,191,36)]"
                    />
                    <span className="text-[14px] text-[rgb(251,191,36)] font-bold">
                      Thêm tài khoản kèm sản phẩm
                    </span>
                  </label>
                </div>
                {showAccountInProduct && (
                  <>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Tài khoản ĐN *
                  </label>
                  <input
                    type="text"
                    value={productForm.account_username || ""}
                    onChange={(e) =>
                      setProductForm({ ...productForm, account_username: e.target.value })
                    }
                    placeholder="VD: gameaccount123"
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Mật khẩu ĐN *
                  </label>
                  <input
                    type="text"
                    value={productForm.account_password || ""}
                    onChange={(e) =>
                      setProductForm({ ...productForm, account_password: e.target.value })
                    }
                    placeholder="VD: password123"
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                  </>
                )}

              </div>

              <div className="flex gap-2 mt-4">
                <button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = editingProductId
                        ? await updateProductAction(
                            editingProductId,
                            productForm,
                          )
                        : await createProductAction(productForm);
                      if (res.error) alert(res.error);
                      else {
                        alert(
                          editingProductId
                            ? "Sửa thành công!"
                            : "Thêm thành công!",
                        );
                        setShowAddProduct(false);
                      }
                    });
                  }}
                  className="px-5 py-2 bg-[rgb(34,197,94)] hover:bg-[rgb(22,163,74)] text-white font-bold text-[14px] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Đang lưu..." : "Lưu sản phẩm"}
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-5 py-2 bg-[rgb(75,85,99)] hover:bg-[rgb(107,114,128)] text-white font-bold text-[14px] rounded-lg transition-colors disabled:opacity-50"
                  disabled={isPending}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
          {/* Filter bar cho sản phẩm */}
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-[rgb(31,41,55)] rounded-lg border border-[rgb(75,85,99)]">
            <input
              type="text"
              placeholder="🔍 Tìm tên sản phẩm..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="flex-1 min-w-[180px] px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[13px] outline-none focus:border-[rgb(251,191,36)]"
            />
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(Number(e.target.value))}
              className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[13px] outline-none focus:border-[rgb(251,191,36)]"
            >
              <option value={0}>Tất cả danh mục</option>
              {initialCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[13px] outline-none focus:border-[rgb(251,191,36)]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Đang hiện</option>
              <option value="hidden">Ẩn</option>
            </select>
            <span className="flex items-center text-[12px] text-[rgba(238,238,238,0.5)] whitespace-nowrap">
              {filteredProducts.length}/{initialProducts.length} sản phẩm
            </span>
            <button
              onClick={() => { setSelectionMode(!selectionMode); setSelectedProductIds(new Set()); }}
              className={`px-3 py-2 text-[12px] font-bold rounded-lg transition-colors ${
                selectionMode
                  ? "bg-[rgb(251,191,36)] text-black"
                  : "bg-[rgb(55,65,81)] text-white hover:bg-[rgb(75,85,99)]"
              }`}
            >
              {selectionMode ? "Thoát chọn" : "Chọn nhiều"}
            </button>
            {selectionMode && selectedProductIds.size > 0 && (
              <button
                disabled={isPending}
                onClick={() => {
                  if (confirm(`Xóa ${selectedProductIds.size} sản phẩm đã chọn? Toàn bộ tài khoản thuộc các sản phẩm này cũng sẽ bị xóa!`)) {
                    startTransition(async () => {
                      const res = await deleteMultipleProductsAction([...selectedProductIds]);
                      if (res.error) alert(res.error);
                      else {
                        setSelectedProductIds(new Set());
                        alert(`Đã xóa ${selectedProductIds.size} sản phẩm.`);
                      }
                    });
                  }
                }}
                className="px-3 py-2 bg-[rgb(220,38,38)] text-white text-[12px] font-bold rounded-lg hover:bg-[rgb(185,28,28)] transition-colors disabled:opacity-50"
              >
                Xóa đã chọn ({selectedProductIds.size})
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] md:text-[14px]">
              <thead>
                <tr className="border-b border-[rgb(75,85,99)]">
                  {selectionMode && (
                    <th className="w-10 py-3">
                      <input
                        type="checkbox"
                        checked={filteredProducts.length > 0 && filteredProducts.every((p) => selectedProductIds.has(p.id))}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-[rgb(251,191,36)] cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    ID
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Tên Sản phẩm
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Giá bán
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] hidden md:table-cell">
                    Danh mục
                  </th>

                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Ghim
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[rgba(238,238,238,0.5)]">
                      Không tìm thấy sản phẩm phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                  <React.Fragment key={p.id}>
                  <tr
                    className="border-b border-[rgb(55,65,81)]"
                  >
                    {selectionMode && (
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.has(p.id)}
                          onChange={() => toggleSelectProduct(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-[rgb(251,191,36)] cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="py-3 text-white">#{p.id}</td>
                    <td className="py-3 text-[rgb(251,191,36)] font-semibold">
                      {p.title}
                    </td>
                    <td className="py-3 text-white">
                      {p.price.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-white">{p.category_name}</span>
                      {p.extra_categories.length > 0 && (
                        <span className="ml-1.5 text-[11px] text-[rgba(238,238,238,0.4)]">
                          +{p.extra_categories.length}
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const res = await togglePinProductAction(p.id);
                            if (res.error) alert(res.error);
                          });
                        }}
                        className={`text-[16px] leading-none px-1.5 py-1 rounded transition-colors ${
                          p.is_pinned
                            ? "text-[rgb(251,191,36)] bg-[rgba(251,191,36,0.15)]"
                            : "text-[rgb(107,114,128)] hover:text-[rgb(156,163,175)]"
                        }`}
                        title={p.is_pinned ? "Bỏ ghim" : "Ghim lên đầu"}
                      >
                        📌
                      </button>
                    </td>
                    <td className="py-3">
                      <button
                        disabled={isPending}
                        onClick={() => {
                          startTransition(async () => {
                            const newStatus = p.status === "available" ? "hidden" : "available";
                            const res = await updateProductAction(p.id, {
                              title: p.title,
                              category_id: p.category_id,
                              extra_categories: p.extra_categories,
                              image_url: p.image_url,
                              price: p.price,
                              original_price: p.original_price,
                              discount_percent: p.discount_percent,
                              fake_sold_count: p.fake_sold_count,
                              fake_remaining_count: p.fake_remaining_count,
                              status: newStatus,
                              is_pinned: p.is_pinned,
                              pet_tim: p.pet_tim || "",
                              san_tim: p.san_tim || "",
                              chuong: p.chuong || "",
                              extra_info: p.extra_info || "",
                            } as any);
                            if (res.error) alert(res.error);
                          });
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors ${
                          p.status === "available"
                            ? "bg-[rgba(34,197,94,0.2)] text-[rgb(34,197,94)] border-[rgb(34,197,94,0.3)] hover:bg-[rgba(34,197,94,0.3)]"
                            : "bg-[rgba(107,114,128,0.2)] text-[rgb(156,163,175)] border-[rgb(107,114,128,0.3)] hover:bg-[rgba(107,114,128,0.3)]"
                        }`}
                        title={p.status === "available" ? "Click để ẩn" : "Click để hiện"}
                      >
                        {p.status === "available" ? "Đang hiện" : "Ẩn"}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          disabled={isPending}
                          onClick={() => {
                            const prod = initialProducts.find(
                              (x) => x.id === p.id,
                            );
                            if (prod) {
                              setProductForm({
                                title: prod.title,
                                category_id: prod.category_id,
                                extra_categories: prod.extra_categories,
                                image_url: prod.image_url,
                                images: prod.images,
                                price: prod.price,
                                original_price: prod.original_price,
                                discount_percent: prod.discount_percent,
                                fake_sold_count: prod.fake_sold_count,
                                fake_remaining_count: prod.fake_remaining_count,
                                status: prod.status,
                                is_pinned: prod.is_pinned,
                                pet_tim: prod.pet_tim,
                                san_tim: prod.san_tim,
                                chuong: prod.chuong,
                                extra_info: prod.extra_info,
                                account_username: "",
                                account_password: "",
                                account_cost_price: 0,
                                account_note: "",
                              });
                              setEditingProductId(prod.id);
                              setShowAccountInProduct(false);
                              setShowAddProduct(true);
                            }
                          }}
                          className="px-2 py-1 bg-[rgb(59,130,246)] text-white text-[11px] rounded disabled:opacity-50"
                        >
                          Sửa
                        </button>

                        <button
                          disabled={isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc chắn muốn xóa sản phẩm #${p.id}? Toàn bộ Kho Tài khoản thuộc SP này cũng sẽ BỊ XÓA! (Cân nhắc Đổi trạng thái sang Ẩn)`,
                              )
                            ) {
                              startTransition(async () => {
                                const res = await deleteProductAction(p.id);
                                if (res.error) alert(res.error);
                              });
                            }
                          }}
                          className="px-2 py-1 bg-[rgb(220,38,38)] text-white text-[11px] rounded disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                  </React.Fragment>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories */}
      {activeTab === "categories" && (
        <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[rgb(251,191,36)] text-[18px] md:text-[22px] font-bold">
              Danh mục
            </h3>
            <button
              onClick={() => {
                setShowAddCategory(true);
                setEditingCategoryId(null);
                setCategoryForm({
                  name: "",
                  slug: "",
                  description: "",
                  image_url: "",
                  sort_order: 0,
                });
              }}
              className="px-3 md:px-4 py-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[12px] md:text-[14px] rounded-lg transition-colors"
            >
              + Thêm danh mục
            </button>
          </div>

          {showAddCategory && (
            <div ref={categoryFormRef} className="mb-6 p-4 bg-[rgb(31,41,55)] rounded-lg border border-[rgb(75,85,99)]">
              <h4 className="text-white font-bold text-[14px] mb-3">
                {editingCategoryId ? "Sửa danh mục" : "Thêm danh mục mới"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-|-$/g, "");
                      setCategoryForm({ ...categoryForm, name, slug });
                    }}
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        description: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2 border-t border-[rgba(238,238,238,0.1)] pt-3 mt-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Ảnh danh mục
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input
                      type="text"
                      placeholder="URL hoặc tải lên file..."
                      value={categoryForm.image_url}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          image_url: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] w-full"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-[rgb(55,65,81)] hover:bg-[rgb(75,85,99)] text-white text-[14px] rounded-lg border border-[rgb(75,85,99)] font-semibold transition-colors flex items-center justify-center shrink-0 w-full sm:w-auto min-w-[120px]">
                      {isUploadingCategory ? (
                        <span className="flex items-center gap-1">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang tải...
                        </span>
                      ) : (
                        "Tải ảnh lên"
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCategoryImageUpload}
                        disabled={isUploadingCategory}
                      />
                    </label>
                  </div>
                  {categoryForm.image_url && (
                    <div className="mt-2 relative w-24 h-24 border border-[rgb(75,85,99)] rounded-lg overflow-hidden bg-[rgb(17,24,39)]">
                      <img
                        src={categoryForm.image_url}
                        alt="Xem trước danh mục"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        sort_order: Number(e.target.value),
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>

              </div>
              <div className="flex gap-2 mt-3">
                <button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = editingCategoryId
                        ? await updateCategoryAction(
                            editingCategoryId,
                            categoryForm,
                          )
                        : await createCategoryAction(categoryForm);
                      if (res.error) alert(res.error);
                      else {
                        alert(
                          editingCategoryId
                            ? "Sửa thành công!"
                            : "Thêm thành công!",
                        );
                        setShowAddCategory(false);
                      }
                    });
                  }}
                  className="px-4 py-2 bg-[rgb(34,197,94)] hover:bg-[rgb(22,163,74)] text-white font-bold text-[13px] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 bg-[rgb(75,85,99)] hover:bg-[rgb(107,114,128)] text-white font-bold text-[13px] rounded-lg transition-colors disabled:opacity-50"
                  disabled={isPending}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-[12px] md:text-[14px]">
              <thead>
                <tr className="border-b border-[rgb(75,85,99)]">
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    ID
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Tên
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Slug
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] hidden md:table-cell">
                    Mô tả
                  </th>

                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialCategories.map((c) => (
                  <tr key={c.id} className="border-b border-[rgb(55,65,81)]">
                    <td className="py-3 text-white">#{c.id}</td>
                    <td className="py-3 text-[rgb(251,191,36)] font-semibold">
                      {c.name}
                    </td>
                    <td className="py-3 text-[rgba(238,238,238,0.6)]">
                      {c.slug}
                    </td>
                    <td className="py-3 text-white hidden md:table-cell">
                      {c.description}
                    </td>

                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          disabled={isPending}
                          onClick={() => {
                            startTransition(async () => {
                              await toggleCategoryActiveAction(c.id);
                            });
                          }}
                          className={`px-2 py-1 text-[11px] rounded disabled:opacity-50 ${
                            c.is_active
                              ? "bg-[rgb(234,179,8)] text-black"
                              : "bg-[rgb(75,85,99)] text-white"
                          }`}
                        >
                          {c.is_active ? "Hiện" : "Ẩn"}
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => {
                            const cat = initialCategories.find(
                              (x) => x.id === c.id,
                            );
                            if (cat) {
                              setCategoryForm({
                                name: cat.name,
                                slug: cat.slug,
                                description: cat.description,
                                image_url: cat.image_url || "",
                                sort_order: cat.sort_order || 0,
                              });
                              setEditingCategoryId(c.id);
                              setShowAddCategory(true);
                            }
                          }}
                          className="px-2 py-1 bg-[rgb(59,130,246)] text-white text-[11px] rounded disabled:opacity-50"
                        >
                          Sửa
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc chắn muốn xóa danh mục "${c.name}"?`,
                              )
                            ) {
                              startTransition(async () => {
                                const res = await deleteCategoryAction(c.id);
                                if (res.error) alert(res.error);
                              });
                            }
                          }}
                          className="px-2 py-1 bg-[rgb(220,38,38)] text-white text-[11px] rounded disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[rgb(251,191,36)] text-[18px] md:text-[22px] font-bold">
              Thông báo
            </h3>
            <button
              onClick={() => {
                setShowAddNotification(true);
                setEditingNotificationId(null);
                setNotificationForm({
                  title: "",
                  content: "",
                  image_url: "",
                  is_pinned: false,
                  is_active: true,
                });
              }}
              className="px-3 md:px-4 py-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[12px] md:text-[14px] rounded-lg transition-colors"
            >
              + Thêm Thông Báo
            </button>
          </div>

          {showAddNotification && (
            <div ref={notificationFormRef} className="mb-6 p-4 bg-[rgb(31,41,55)] rounded-lg border border-[rgb(75,85,99)] animate-fade-in">
              <h4 className="text-white font-bold text-[14px] mb-3">
                {editingNotificationId ? "Sửa thông báo" : "Thêm thông báo mới"}
              </h4>
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        title: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] w-full"
                  />
                </div>

                <div className="flex flex-col gap-1 border-t border-[rgba(238,238,238,0.1)] pt-3 mt-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Ảnh thông báo
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input
                      type="text"
                      placeholder="URL ảnh hoặc tải lên file..."
                      value={notificationForm.image_url}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          image_url: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] w-full"
                    />
                    <label className="cursor-pointer px-4 py-2 bg-[rgb(55,65,81)] hover:bg-[rgb(75,85,99)] text-white text-[14px] rounded-lg border border-[rgb(75,85,99)] font-semibold transition-colors flex items-center justify-center shrink-0 w-full sm:w-auto min-w-[120px]">
                      {isUploadingNotification ? (
                        <span className="flex items-center gap-1">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Đang tải...
                        </span>
                      ) : (
                        "Tải ảnh lên"
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleNotificationImageUpload}
                        disabled={isUploadingNotification}
                      />
                    </label>
                  </div>
                  {notificationForm.image_url && (
                    <div className="mt-2 relative w-24 h-24 border border-[rgb(75,85,99)] rounded-lg overflow-hidden bg-[rgb(17,24,39)]">
                      <img
                        src={notificationForm.image_url}
                        alt="Xem trước thông báo"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Nội dung (hỗ trợ xuống dòng) *
                  </label>
                  <textarea
                    rows={4}
                    value={notificationForm.content}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        content: e.target.value,
                      })
                    }
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] w-full"
                  />
                </div>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 text-[14px] text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notificationForm.is_pinned}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          is_pinned: e.target.checked,
                        })
                      }
                      className="accent-[rgb(251,191,36)]"
                    />
                    Ghim lên đầu
                  </label>
                  <label className="flex items-center gap-2 text-[14px] text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notificationForm.is_active}
                      onChange={(e) =>
                        setNotificationForm({
                          ...notificationForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="accent-[rgb(251,191,36)]"
                    />
                    Hiển thị (Kích hoạt)
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const res = editingNotificationId
                        ? await updateNotificationAction(
                            editingNotificationId,
                            notificationForm,
                          )
                        : await createNotificationAction(notificationForm);
                      if (res.error) alert(res.error);
                      else {
                        alert(
                          editingNotificationId
                            ? "Sửa thành công!"
                            : "Thêm thành công!",
                        );
                        setShowAddNotification(false);
                      }
                    });
                  }}
                  className="px-4 py-2 bg-[rgb(34,197,94)] hover:bg-[rgb(22,163,74)] text-white font-bold text-[13px] rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => setShowAddNotification(false)}
                  className="px-4 py-2 bg-[rgb(75,85,99)] hover:bg-[rgb(107,114,128)] text-white font-bold text-[13px] rounded-lg transition-colors disabled:opacity-50"
                  disabled={isPending}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-[12px] md:text-[14px]">
              <thead>
                <tr className="border-b border-[rgb(75,85,99)]">
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] w-12">
                    ID
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] w-20">
                    Ảnh
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">
                    Tiêu đề
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] hidden md:table-cell">
                    Nội dung
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] w-20">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 text-[rgba(238,238,238,0.6)] w-32">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {initialNotifications.map((n) => (
                  <tr key={n.id} className="border-b border-[rgb(55,65,81)]">
                    <td className="py-3 text-white">#{n.id}</td>
                    <td className="py-3">
                      {n.image_url ? (
                        <div className="w-12 h-8 border border-[rgb(75,85,99)] rounded overflow-hidden bg-[rgb(17,24,39)]">
                          <img
                            src={n.image_url}
                            alt={n.title || "Hình ảnh thông báo"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-[11px] text-[rgba(238,238,238,0.4)]">
                          Không có
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-[rgb(251,191,36)] font-semibold">
                      {n.is_pinned && (
                        <span className="mr-1 text-[11px] bg-red-600/30 text-red-400 px-1 py-0.5 rounded font-bold">
                          PIN
                        </span>
                      )}
                      {n.title}
                    </td>
                    <td
                      className="py-3 text-white hidden md:table-cell max-w-xs truncate"
                      title={n.content}
                    >
                      {n.content}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-bold ${n.is_active ? "bg-[rgba(34,197,94,0.2)] text-[rgb(34,197,94)]" : "bg-[rgba(220,38,38,0.2)] text-[rgb(220,38,38)]"}`}
                      >
                        {n.is_active ? "Hiện" : "Ẩn"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          disabled={isPending}
                          onClick={() => {
                            const notif = initialNotifications.find(
                              (x) => x.id === n.id,
                            );
                            if (notif) {
                              setNotificationForm({
                                title: notif.title,
                                content: notif.content,
                                image_url: notif.image_url || "",
                                is_pinned: notif.is_pinned,
                                is_active: notif.is_active,
                              });
                              setEditingNotificationId(notif.id);
                              setShowAddNotification(true);
                            }
                          }}
                          className="px-2 py-1 bg-[rgb(59,130,246)] text-white text-[11px] rounded disabled:opacity-50"
                        >
                          Sửa
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc chắn muốn xóa thông báo #${n.id}?`,
                              )
                            ) {
                              startTransition(async () => {
                                const res = await deleteNotificationAction(
                                  n.id,
                                );
                                if (res.error) alert(res.error);
                              });
                            }
                          }}
                          className="px-2 py-1 bg-[rgb(220,38,38)] text-white text-[11px] rounded disabled:opacity-50"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Options */}
      {activeTab === "options" && (
        <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[rgb(251,191,36)] text-[18px] md:text-[22px] font-bold">
              Danh sách Pet Tím / Sàn Đấu / Chưởng
            </h3>
            <button
              onClick={() => {
                setShowAddOption(true);
                setEditingOptionId(null);
                setOptionType("pet_tim");
                setOptionName("");
              }}
              className="px-3 md:px-4 py-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold text-[12px] md:text-[14px] rounded-lg transition-colors"
            >
              + Thêm
            </button>
          </div>

          {showAddOption && (
            <div className="mb-6 p-4 md:p-6 bg-[rgb(31,41,55)] rounded-lg border border-[rgb(75,85,99)]">
              <h4 className="text-[rgb(251,191,36)] font-bold text-[16px] mb-4">
                {editingOptionId ? "Sửa" : "Thêm mới"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Loại
                  </label>
                  <select
                    value={optionType}
                    onChange={(e) =>
                      setOptionType(
                        e.target.value as "pet_tim" | "san_tim" | "chuong",
                      )
                    }
                    disabled={!!editingOptionId}
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] disabled:opacity-50"
                  >
                    <option value="pet_tim">Pet Tím</option>
                    <option value="san_tim">Sàn Đấu</option>
                    <option value="chuong">Chưởng</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] text-[rgba(238,238,238,0.6)]">
                    Tên {editingOptionId ? "mới" : ""}
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Chibi Soraka - Chuối Tí Nị"
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    className="px-3 py-2 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)]"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = editingOptionId
                          ? await updateProductOption(
                              editingOptionId,
                              optionName,
                            )
                          : await createProductOption(optionType, optionName);
                        if (res.error) alert(res.error);
                        else {
                          setShowAddOption(false);
                          setAllOptions(await getAllProductOptions());
                        }
                      });
                    }}
                    className="px-5 py-2 bg-[rgb(34,197,94)] hover:bg-[rgb(22,163,74)] text-white font-bold text-[14px] rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isPending ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    onClick={() => setShowAddOption(false)}
                    className="px-5 py-2 bg-[rgb(75,85,99)] hover:bg-[rgb(107,114,128)] text-white font-bold text-[14px] rounded-lg transition-colors disabled:opacity-50"
                    disabled={isPending}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {(["pet_tim", "san_tim", "chuong"] as const).map((type) => {
            const items = allOptions.filter((o) => o.type === type);
            const typeLabel =
              type === "pet_tim"
                ? "Pet Tím"
                : type === "san_tim"
                  ? "Sàn Đấu"
                  : "Chưởng";
            return (
              <div key={type} className="mb-4">
                <h4 className="text-white font-bold text-[14px] mb-2 border-b border-[rgb(75,85,99)] pb-1">
                  {typeLabel} ({items.length})
                </h4>
                {items.length === 0 ? (
                  <p className="text-[rgba(238,238,238,0.5)] italic text-[13px]">
                    Chưa có dữ liệu
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((o) => (
                      <div
                        key={o.id}
                        className="group flex items-center gap-1 px-2.5 py-1 bg-[rgb(17,24,39)] border border-[rgb(75,85,99)] rounded-lg text-white text-[12px]"
                      >
                        <span>{o.name}</span>
                        <button
                          onClick={() => {
                            setEditingOptionId(o.id);
                            setOptionType(
                              o.type as "pet_tim" | "san_tim" | "chuong",
                            );
                            setOptionName(o.name);
                            setShowAddOption(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[rgb(59,130,246)] hover:text-[rgb(96,165,250)] text-[13px] ml-1 transition-opacity"
                          title="Sửa"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa "${o.name}"?`)) {
                              startTransition(async () => {
                                const res = await deleteProductOption(o.id);
                                if (res.error) alert(res.error);
                                else
                                  setAllOptions(await getAllProductOptions());
                              });
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[rgb(220,38,38)] hover:text-[rgb(248,113,113)] text-[13px] transition-opacity"
                          title="Xóa"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>


    </>
  );
}
