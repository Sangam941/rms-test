import React, { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
import type { MenuItem } from "../../types/menu";
import { useMenuStore } from "../../store/useMenuStore";

type EditMenuItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
};

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store updateMenuItem
  const {updateMenuItem} = useMenuStore();
  // Obtain categories from store (and filter for name uniqueness)
  const categories = useMenuStore((state) => state.categories);

  // A single flat list of category names (strings)
  const categoryNames = Array.from(
    new Set(categories.map((cat: any) => cat.categoryName))
  );

  // State for all fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categoryNames[0] || "");
  const [price, setPrice] = useState<number | "">("");
  const [isVeg, setIsVeg] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSpecial, setIsSpecial] = useState(false);

  /** Load existing item values */
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setPrice(item.price);
      setIsVeg(item.isVeg ?? true);
      setPreview(item.image ?? null);
      setIsAvailable(item.isAvailable);
      setIsSpecial(item.isSpecial);
      setImageFile(null);
    } else if (categoryNames.length > 0) {
      setCategory(categoryNames[0]);
    }
    // eslint-disable-next-line
  }, [item, categoryNames.join(",")]);

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

  const handleUpdate = async () => {
    // if (!name || !category || price === "" || (preview === null && !imageFile)) {
    //   alert("Please fill all fields");
    //   return;
    // }

    // Construct FormData for updating in the store
    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", String(price));
    formData.append("isVeg", isVeg ? "true" : "false");
    formData.append("isAvailable", isAvailable ? "true" : "false");
    formData.append("isSpecial", isSpecial ? "true" : "false");

    // Only append new file (if changed)
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Update in store: store expects (id, formData)
    await updateMenuItem(item.id, formData);

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
            {categoryNames.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            {
              // Fallback: if item's current category is not in the list, show it at the top
              category && !categoryNames.includes(category) ? (
                <option key={category} value={category}>
                  {category}
                </option>
              ) : null
            }
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

          {/* Special */}
          <div className="flex items-center gap-2">
            <label className="font-medium">Special</label>
            <input
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
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
