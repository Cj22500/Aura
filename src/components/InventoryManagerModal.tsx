import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Save, 
  SlidersHorizontal,
  PackagePlus,
  Loader2
} from 'lucide-react';
import { Product, ProductCategory, ProductImageType, ValidationError } from '../types';
import { api, validateProductData } from '../services/api';
import { ProductArtwork } from './ProductArtwork';

interface InventoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductCreated: (prod: Product) => void;
  onProductUpdated: (prod: Product) => void;
  onProductDeleted: (id: string) => void;
  onResetDatabase: () => void;
}

export const InventoryManagerModal: React.FC<InventoryManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onResetDatabase,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Acoustics');
  const [formPrice, setFormPrice] = useState<number | string>(350);
  const [formStock, setFormStock] = useState<number | string>(10);
  const [formDesc, setFormDesc] = useState('');
  const [formImageType, setFormImageType] = useState<ProductImageType>('speaker');
  const [formDimensions, setFormDimensions] = useState('200mm × 140mm × 120mm');
  const [formMaterials, setFormMaterials] = useState('European Walnut, Brushed Brass');
  const [formFeatures, setFormFeatures] = useState('Studio Grade Performance\nHandcrafted solid wood frame');

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormName('');
    setFormCategory('Acoustics');
    setFormPrice(350);
    setFormStock(10);
    setFormDesc('');
    setFormImageType('speaker');
    setFormDimensions('200mm × 140mm × 120mm');
    setFormMaterials('European Walnut, Brushed Brass');
    setFormFeatures('Studio Grade Performance\nHandcrafted solid wood frame');
    setFormErrors({});
    setEditingProduct(null);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price);
    setFormStock(prod.stock);
    setFormDesc(prod.description);
    setFormImageType(prod.imageType);
    setFormDimensions(prod.dimensions);
    setFormMaterials(prod.materials);
    setFormFeatures(prod.features.join('\n'));
    setFormErrors({});
    setActiveTab('create');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const numericPrice = typeof formPrice === 'string' ? parseFloat(formPrice) : formPrice;
    const numericStock = typeof formStock === 'string' ? parseInt(formStock, 10) : formStock;

    const payload = {
      name: formName,
      category: formCategory,
      price: numericPrice,
      stock: numericStock,
      description: formDesc,
      imageType: formImageType,
      dimensions: formDimensions,
      materials: formMaterials,
      features: formFeatures.split('\n').filter((f) => f.trim().length > 0),
      accentColor: '#B45309',
    };

    const errors = validateProductData(payload);
    if (errors.length > 0) {
      const errMap: Record<string, string> = {};
      errors.forEach((e) => {
        errMap[e.field] = e.message;
      });
      setFormErrors(errMap);
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingProduct) {
        // UPDATE (PUT)
        const updated = await api.updateProduct(editingProduct.id, payload);
        onProductUpdated(updated);
        setActionSuccessMsg(`Product '${updated.name}' updated successfully.`);
      } else {
        // CREATE (POST)
        const created = await api.createProduct(payload);
        onProductCreated(created);
        setActionSuccessMsg(`Product '${created.name}' created and added to catalog.`);
      }

      setTimeout(() => setActionSuccessMsg(null), 3000);
      resetForm();
      setActiveTab('list');
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Operation failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete '${name}'? This triggers DELETE /api/products/:id.`)) {
      return;
    }

    try {
      await api.deleteProduct(id);
      onProductDeleted(id);
      setActionSuccessMsg(`Product '${name}' removed from inventory.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-stone-700" />
              <h2 className="font-display text-base font-bold text-stone-900">
                Catalog & Inventory Operations (Admin CRUD)
              </h2>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Full REST CRUD operations with schema validation, optimistic updates, and persistent state.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action success toast message */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Segmented Subnav */}
        <div className="px-6 pt-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('list');
                resetForm();
              }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'list'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Inventory Registry ({products.length})
            </button>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>{editingProduct ? 'Edit Product' : 'Add New Product (POST)'}</span>
            </button>
          </div>

          <button
            onClick={onResetDatabase}
            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer pb-2"
            title="Reset database to default seed items"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Seed Catalog</span>
          </button>
        </div>

        {/* Tab 1: Product List (READ, UPDATE, DELETE) */}
        {activeTab === 'list' && (
          <div className="flex-1 overflow-y-auto p-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Piece</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock Units</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-stone-100 shrink-0">
                        <ProductArtwork type={p.imageType} aspectRatio="1:1" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 line-clamp-1">{p.name}</p>
                        <p className="font-mono text-[10px] text-stone-400">{p.sku}</p>
                      </div>
                    </td>
                    <td className="py-3 text-stone-600">{p.category}</td>
                    <td className="py-3 font-mono font-medium text-stone-900 tabular-nums">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`font-mono tabular-nums font-semibold ${
                          p.stock === 0
                            ? 'text-red-600'
                            : p.stock <= 5
                            ? 'text-amber-700'
                            : 'text-stone-800'
                        }`}
                      >
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => handleStartEdit(p)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded transition-colors cursor-pointer"
                        title="Edit product data"
                      >
                        <Pencil className="w-3 h-3 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-red-50 hover:bg-red-100 text-red-700 rounded transition-colors cursor-pointer"
                        title="Delete product (DELETE /api/products/:id)"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Create / Edit Product Form (CREATE / UPDATE) */}
        {activeTab === 'create' && (
          <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
            {formErrors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.submit}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Nordic Wool Studio Monitor"
                  className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                    formErrors.name ? 'border-red-400' : 'border-stone-300 focus:border-stone-700'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e: any) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-md outline-none focus:border-stone-700 focus:bg-white cursor-pointer"
                >
                  <option value="Acoustics">Acoustics</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Seating">Seating</option>
                  <option value="Tableware">Tableware</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                    formErrors.price ? 'border-red-400' : 'border-stone-300 focus:border-stone-700'
                  }`}
                />
                {formErrors.price && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Inventory Units in Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-mono bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                    formErrors.stock ? 'border-red-400' : 'border-stone-300 focus:border-stone-700'
                  }`}
                />
                {formErrors.stock && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.stock}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Visual Specimen Style</label>
                <select
                  value={formImageType}
                  onChange={(e: any) => setFormImageType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-md outline-none focus:border-stone-700 focus:bg-white cursor-pointer"
                >
                  <option value="speaker">Acoustic Speaker Cabinet</option>
                  <option value="lamp">Fluted Glass Pendant Lamp</option>
                  <option value="chair">Oak & Bouclé Armchair</option>
                  <option value="carafe">Sandstone Ceramic Carafe</option>
                  <option value="headphones">Walnut Open-Back Headphones</option>
                  <option value="desk">Anodized Metal Desk Tray</option>
                  <option value="vase">Fluted Earthenware Vase</option>
                  <option value="clock">Spun Brass Wall Clock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dimensions</label>
                <input
                  type="text"
                  value={formDimensions}
                  onChange={(e) => setFormDimensions(e.target.value)}
                  placeholder="e.g. 220mm × 140mm × 160mm"
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-md outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Materials</label>
              <input
                type="text"
                value={formMaterials}
                onChange={(e) => setFormMaterials(e.target.value)}
                placeholder="e.g. Solid White Oak, Brushed Satin Brass, Kvadrat Wool"
                className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-md outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Product Description</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Detailed craft narrative and acoustic engineering details..."
                className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                  formErrors.description ? 'border-red-400' : 'border-stone-300 focus:border-stone-700'
                }`}
              />
              {formErrors.description && (
                <p className="text-[10px] text-red-600 mt-0.5">{formErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Key Features (one per line)
              </label>
              <textarea
                rows={3}
                value={formFeatures}
                onChange={(e) => setFormFeatures(e.target.value)}
                placeholder="One specification point per line..."
                className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-md outline-none focus:bg-white"
              />
            </div>

            {/* Form Action Controls */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transacting REST API...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingProduct ? 'Commit Updates (PUT)' : 'Save to Catalog (POST)'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
