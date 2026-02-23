"use client";

import { useState, useEffect } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/lib/firestore";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SimpleModal } from "@/components/ui/SimpleModal";

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    label_vi: "",
    label_en: "",
    order: 0,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      label_vi: "",
      label_en: "",
      order: categories.length,
    });
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      label_vi: cat.label_vi,
      label_en: cat.label_en,
      order: cat.order,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      await updateCategory(editing.id, form);
    } else {
      await addCategory(form);
    }
    setIsModalOpen(false);
    await fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    await fetchCategories();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="typo-h2">Categories ({categories.length})</h2>
        <Button variant="primary" onClick={openCreate} className="gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_80px_80px] gap-4 px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]/50">
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Name (key)
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Label VI
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Label EN
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Order
          </span>
          <span className="typo-caption font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Actions
          </span>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="px-6 py-4 flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_80px_80px] gap-4 items-center hover:bg-[var(--color-bg-alt)]/30 transition-colors"
            >
              <p className="typo-body font-medium">{cat.name}</p>
              <p className="typo-body text-[var(--color-text-secondary)]">
                {cat.label_vi}
              </p>
              <p className="typo-body text-[var(--color-text-secondary)]">
                {cat.label_en}
              </p>
              <p className="typo-caption text-[var(--color-text-secondary)] text-center">
                {cat.order}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-blue-500/10 text-blue-500 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="p-12 text-center typo-body text-[var(--color-text-secondary)]">
              No categories yet. Add one to get started.
            </div>
          )}
        </div>
      </div>

      <SimpleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
        actions={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {editing ? "Update" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Name (key used in Firestore)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="e.g. Chatbot"
            />
          </div>
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Label VI
            </label>
            <input
              type="text"
              value={form.label_vi}
              onChange={(e) => setForm({ ...form, label_vi: e.target.value })}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="e.g. Chatbot"
            />
          </div>
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Label EN
            </label>
            <input
              type="text"
              value={form.label_en}
              onChange={(e) => setForm({ ...form, label_en: e.target.value })}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
              placeholder="e.g. Chatbot"
            />
          </div>
          <div>
            <label className="block typo-caption font-semibold mb-2">
              Order
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 typo-body outline-none"
            />
          </div>
        </div>
      </SimpleModal>
    </div>
  );
}
