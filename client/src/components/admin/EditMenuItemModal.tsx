import React, { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import type { MenuItem } from "../../types/menu";

const CATEGORY_OPTIONS = ["Starters", "Main Course", "Desserts", "Beverages", "Veg", "Non-Veg"];

type EditMenuItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onUpdateItem: (item: MenuItem) => void;
};

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdateItem,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [price, setPrice] = useState<number | "">("");
  const [isVeg, setIsVeg] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  /** Load existing item values */
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setPrice(item.price);
      setIsVeg(item.isVeg);
      setPreview(item.image);
      setIsAvailable(item.isAvailable);
      setImageFile(null);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpdate = () => {
    if (!name || !category || !price || !preview) {
      alert("Please fill all fields");
      return;
    }

    onUpdateItem({
      ...item,
      name,
      category,
      price: Number(price),
      isVeg,
      image: preview,
      isAvailable,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4">Edit Menu Item</h2>

        <div className="flex flex-col gap-3">
          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Price */}
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
          />

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium">Item Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {preview ? (
              <img
                src={preview}
                alt="Preview"
                onClick={handleImageClick}
                className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                title="Click to change image"
              />
            ) : (
              <div
                onClick={handleImageClick}
                className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded-lg border cursor-pointer"
              >
                <Upload className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>

          {/* Veg */}
          <div className="flex items-center gap-2">
            <label className="font-medium">Veg</label>
            <input
              type="checkbox"
              checked={isVeg}
              onChange={(e) => setIsVeg(e.target.checked)}
              className="w-5 h-5 accent-orange-600"
            />
          </div>

          {/* Available */}
          <div className="flex items-center gap-2">
            <label className="font-medium">Available</label>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-5 h-5 accent-orange-600"
            />
          </div>

          {/* Update */}
          <button
            onClick={handleUpdate}
            className="mt-4 w-full py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
          >
            Update Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditMenuItemModal;
