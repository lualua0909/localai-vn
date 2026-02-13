"use client";

import { useState } from "react";
import { AppDetail } from "@/lib/app-data";
import { useProducts, ProductFormData } from "@/hooks/useProducts";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { Button } from "@/components/ui/Button";

interface ProductManagerProps {
  userEmail: string | undefined | null;
  roleOverride?: number;
}

export function ProductManager({
  userEmail,
  roleOverride
}: ProductManagerProps) {
  const {
    products,
    myProducts,
    isAdmin,
    addProduct,
    updateProduct: updateInternalProduct,
    deleteProduct: deleteInternalProduct
  } = useProducts(userEmail, roleOverride);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(
    null
  );

  // Local state for product status since appData doesn't persist it
  const [productStatuses, setProductStatuses] = useState<
    Record<string, "published" | "pending" | "rejected" | "draft">
  >({});

  const handleEdit = (product: AppDetail) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteInternalProduct(id);
    }
  };

  const handleApprove = (id: string) => {
    setProductStatuses((prev) => ({ ...prev, [id]: "published" }));
  };

  const handleReject = (id: string) => {
    setProductStatuses((prev) => ({ ...prev, [id]: "rejected" }));
  };

  const handleSave = (data: ProductFormData) => {
    if (editingProduct?.id) {
      updateInternalProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const displayedProducts = isAdmin ? products : myProducts;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="typo-h2">
          {isAdmin ? "All Products (Admin)" : "My Products"}
        </h2>
        <Button
          variant="primary"
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="gap-2"
        >
          <Plus size={16} />
          Publish New Product
        </Button>
      </div>

      {/* Product List */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {displayedProducts.length === 0 ? (
          <div className="p-12 text-center typo-body text-[var(--color-text-secondary)]">
            No products found. Start by creating one!
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {displayedProducts.map((p) => {
              const status =
                productStatuses[p.id] || (isAdmin ? "published" : "pending");

              return (
                <div
                  key={p.id}
                  className="px-6 py-5 flex items-center justify-between gap-4 group hover:bg-[var(--color-bg-alt)]/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={p.icon || "https://placehold.co/48x48?text=App"}
                      alt={p.name}
                      className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="typo-body font-semibold text-[var(--color-text)] truncate">
                        {p.name}
                      </h3>
                      <p className="typo-caption text-[var(--color-text-secondary)] truncate w-full max-w-[200px] sm:max-w-md mt-0.5">
                        {p.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="typo-caption uppercase tracking-wider text-[var(--color-text-secondary)]">
                          {p.category}
                        </span>
                        <StatusBadge status={status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* View Button */}
                    <Button
                      href={`/app/${p.slug}`}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full border-none hover:bg-[var(--color-bg-alt)] text-[var(--color-text-secondary)]"
                    >
                      <Eye size={16} />
                    </Button>

                    {/* Edit Button (Owner or Admin) */}
                    {(isAdmin || p.author === "VietAI Team") && (
                      <button
                        onClick={() => handleEdit(p)}
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-500/10 text-blue-500 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}

                    {/* Delete Button (Admin only or Owner if Draft) */}
                    {(isAdmin || status === "draft") && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && status === "pending" && (
                      <>
                        <div className="w-px h-4 bg-[var(--color-border)] mx-1" />
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: "bg-green-500/10 text-green-600 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-600 border-red-500/20",
    draft: "bg-gray-500/10 text-gray-600 border-gray-500/20"
  };

  return (
    <span
      className={`typo-caption px-2 py-0.5 rounded-full border ${styles[status as keyof typeof styles] || styles.draft}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProductFormData | null;
  onSave: (data: ProductFormData) => void;
}

function ProductFormModal({
  isOpen,
  onClose,
  initialData,
  onSave
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    tagline: "",
    description: "",
    category: "",
    author: "VietAI Team",
    icon: "",
    screenshots: [],
    features: [],
    pricing: [],
    ...initialData
  });

  // Reset form when opening
  if (!isOpen && initialData && formData.id !== initialData.id) {
    setFormData({ ...initialData });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Product" : "Publish New Product"}
      actions={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Product
          </Button>
        </>
      }
    >
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="block typo-caption font-semibold mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                placeholder="e.g. VietGPT"
              />
            </div>

            <div>
              <label className="block typo-caption font-semibold mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                placeholder="Short catchy description"
              />
            </div>

            <div>
              <label className="block typo-caption font-semibold mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
              >
                <option value="">Select Category</option>
                <option value="Productivity">Productivity</option>
                <option value="Chatbot">Chatbot</option>
                <option value="Creative">Creative</option>
                <option value="Utility">Utility</option>
              </select>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block typo-caption font-semibold mb-2">Icon URL</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
                placeholder="https://..."
              />
              {formData.icon && (
                <img
                  src={formData.icon}
                  alt="Preview"
                  className="w-10 h-10 mt-2 rounded-xl bg-gray-100 object-cover"
                />
              )}
            </div>

            <div>
              <label className="block typo-caption font-semibold mb-2">
                Description (HTML supported)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full h-32 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body focus:ring-2 focus:ring-[var(--color-accent)] outline-none resize-none"
                placeholder="<p>Detailed description...</p>"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl typo-caption text-amber-700">
          Detailed Feature & Pricing editor would go here. For demo, we use
          basic fields.
        </div>
      </form>
    </SimpleModal>
  );
}
