"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ImageUpload from "./imageUpload";

const initialFormData = {
  name: "",
  brand: "",
  size: ["Medium"],
  colors: [""],
  price: "",
  offerPrice: "",
  gender: "Men",
  category: "Luxury",
  images: [],
  stock: "",
  description: "",
};

export default function ProductForm({
  editingProduct,
  onProductAdded,
  onCancelEdit,
}) {
  const [formData, setFormData] = useState(
    initialFormData
  );

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD PRODUCT FOR EDIT
  // =========================
  useEffect(() => {
    if (!editingProduct) {
      setFormData(initialFormData);
      setMessage("");
      return;
    }

    setFormData({
      name: editingProduct.name || "",

      brand: editingProduct.brand || "",

      size:
        Array.isArray(editingProduct.size) &&
        editingProduct.size.length > 0
          ? editingProduct.size
          : ["Medium"],

      colors:
        Array.isArray(editingProduct.colors) &&
        editingProduct.colors.length > 0
          ? editingProduct.colors
          : [""],

      price: editingProduct.price ?? "",

      offerPrice:
        editingProduct.offerPrice ?? "",

      gender:
        editingProduct.gender || "Men",

      category:
        editingProduct.category || "Luxury",

      images:
        Array.isArray(editingProduct.images)
          ? editingProduct.images
          : editingProduct.image
          ? [editingProduct.image]
          : [],

      stock: editingProduct.stock ?? "",

      description:
        editingProduct.description || "",
    });

    setMessage("");
  }, [editingProduct]);

  // =========================
  // NORMAL INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SIZE
  // =========================
  const handleSizeChange = (size) => {
    setFormData((prev) => {
      const exists = prev.size.includes(size);

      return {
        ...prev,

        size: exists
          ? prev.size.filter(
              (item) => item !== size
            )
          : [...prev.size, size],
      };
    });
  };

  // =========================
  // COLOR
  // =========================
  const handleColorChange = (
    index,
    value
  ) => {
    setFormData((prev) => {
      const colors = [...prev.colors];

      colors[index] = value;

      return {
        ...prev,
        colors,
      };
    });
  };

  const addColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        "",
      ],
    }));
  };

  const removeColor = (index) => {
    setFormData((prev) => ({
      ...prev,

      colors: prev.colors.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =========================
  // IMAGE UPLOAD
  // =========================
  const handleImageUpload = (
    uploadedImages
  ) => {
    setFormData((prev) => ({
      ...prev,

      // Existing + New Images
      images: [
        ...prev.images,
        ...uploadedImages,
      ],
    }));

    setMessage(
      `${uploadedImages.length} image(s) uploaded successfully`
    );
  };

  // =========================
  // REMOVE EXISTING IMAGE
  // =========================
  const handleRemoveExistingImage = (
    index
  ) => {
    setFormData((prev) => ({
      ...prev,

      images: prev.images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    }));

    setMessage("Image removed");
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData(initialFormData);
    setMessage("");

    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // =========================
    // VALIDATION
    // =========================

    if (!formData.name.trim()) {
      setMessage(
        "Product name is required"
      );
      return;
    }

    if (!formData.brand.trim()) {
      setMessage("Brand is required");
      return;
    }

    if (formData.size.length === 0) {
      setMessage(
        "Please select at least one size"
      );
      return;
    }

    const validColors =
      formData.colors
        .map((color) =>
          color.trim()
        )
        .filter(Boolean);

    if (validColors.length === 0) {
      setMessage(
        "Please add at least one color"
      );
      return;
    }

    if (formData.images.length === 0) {
      setMessage(
        "Please upload at least one image"
      );
      return;
    }

    const price = Number(
      formData.price
    );

    const offerPrice = Number(
      formData.offerPrice
    );

    const stock = Number(
      formData.stock
    );

    if (price <= 0) {
      setMessage(
        "Price must be greater than 0"
      );
      return;
    }

    if (offerPrice <= 0) {
      setMessage(
        "Offer price must be greater than 0"
      );
      return;
    }

    if (offerPrice > price) {
      setMessage(
        "Offer price cannot be greater than price"
      );
      return;
    }

    if (stock < 0) {
      setMessage(
        "Stock cannot be negative"
      );
      return;
    }

    try {
      setSaving(true);

      // =========================
      // PRODUCT DATA
      // =========================
      const productData = {
        name: formData.name.trim(),

        brand: formData.brand.trim(),

        size: formData.size,

        colors: validColors,

        images: formData.images,

        price,

        offerPrice,

        gender: formData.gender,

        category: formData.category,

        stock,

        description:
          formData.description.trim(),
      };

      // =========================
      // EDIT PRODUCT
      // =========================
      if (editingProduct) {
        const response =
          await axios.put(
            "/api/admin",
            {
              id: editingProduct._id,
              ...productData,
            }
          );

        setMessage(
          response.data.message ||
            "Product updated successfully"
        );

        // Refresh product list
        if (onProductAdded) {
          onProductAdded(
            response.data.product
          );
        }

        return;
      }

      // =========================
      // ADD PRODUCT
      // =========================
      const response =
        await axios.post(
          "/api/admin",
          productData
        );

      setMessage(
        response.data.message ||
          "Product added successfully"
      );

      // Refresh product list
      if (onProductAdded) {
        onProductAdded(
          response.data.product
        );
      }

      // Reset after adding
      setFormData(initialFormData);

    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      setMessage(
        error.response?.data
          ?.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6"
    >

      {/* =========================
          HEADER
      ========================= */}
      <h2 className="text-xl font-semibold text-black">
        {editingProduct
          ? "Edit Product"
          : "Add Product"}
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        {editingProduct
          ? "Update watch product details"
          : "Add a new watch to your collection"}
      </p>

      {/* =========================
          NAME + BRAND
      ========================= */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Product Name
          </label>

          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Brand
          </label>

          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Enter brand"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

      </div>

      {/* =========================
          GENDER + CATEGORY
      ========================= */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Gender
          </label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="Men">
              Men
            </option>

            <option value="Women">
              Women
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          >
            <option value="Luxury">
              Luxury
            </option>

            <option value="Classic">
              Classic
            </option>

            <option value="Sport">
              Sport
            </option>

            <option value="Smart">
              Smart
            </option>
          </select>
        </div>

      </div>

      {/* =========================
          SIZE
      ========================= */}
      <div className="mt-5">

        <label className="mb-2 block text-sm font-medium">
          Size
        </label>

        <div className="flex flex-wrap gap-3">

          {[
            "Small",
            "Medium",
            "Large",
          ].map((size) => (

            <button
              key={size}
              type="button"
              onClick={() =>
                handleSizeChange(size)
              }
              className={`rounded-lg border px-5 py-2 ${
                formData.size.includes(
                  size
                )
                  ? "border-black bg-black text-white"
                  : "border-gray-300 bg-white text-black"
              }`}
            >
              {size}
            </button>

          ))}

        </div>

      </div>

      {/* =========================
          COLORS
      ========================= */}
      <div className="mt-5">

        <label className="mb-2 block text-sm font-medium">
          Colors
        </label>

        {formData.colors.map(
          (color, index) => (

            <div
              key={index}
              className="mb-2 flex gap-2"
            >

              <input
                type="text"
                value={color}
                onChange={(e) =>
                  handleColorChange(
                    index,
                    e.target.value
                  )
                }
                placeholder="Enter color"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
              />

              {formData.colors
                .length > 1 && (

                <button
                  type="button"
                  onClick={() =>
                    removeColor(index)
                  }
                  className="rounded-lg border border-gray-300 px-4 text-sm"
                >
                  Remove
                </button>

              )}

            </div>

          )
        )}

        <button
          type="button"
          onClick={addColor}
          className="mt-1 text-sm font-medium underline"
        >
          + Add Color
        </button>

      </div>

      {/* =========================
          PRICE + OFFER + STOCK
      ========================= */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">

        <div>
          <label className="mb-2 block text-sm font-medium">
            Original Price
          </label>

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="₹"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Offer Price
          </label>

          <input
            type="number"
            name="offerPrice"
            value={formData.offerPrice}
            onChange={handleChange}
            placeholder="₹"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Stock
          </label>

          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Stock"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />
        </div>

      </div>

      {/* =========================
          DESCRIPTION
      ========================= */}
      <div className="mt-5">

        <label className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          placeholder="Enter product description"
          className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none"
        />

      </div>

      {/* =========================
          IMAGE UPLOAD
      ========================= */}
      <div className="mt-5">

        <ImageUpload
          existingImages={
            formData.images
          }
          onUpload={
            handleImageUpload
          }
          onRemoveExisting={
            handleRemoveExistingImage
          }
        />

      </div>

      {/* =========================
          MESSAGE
      ========================= */}
      {message && (
        <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
          {message}
        </p>
      )}

      {/* =========================
          BUTTONS
      ========================= */}
      <div className="mt-5 flex gap-3">

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? editingProduct
              ? "Updating Product..."
              : "Adding Product..."
            : editingProduct
            ? "Update Product"
            : "Add Product"}
        </button>

        {editingProduct && (
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-black hover:bg-gray-100"
          >
            Cancel
          </button>
        )}

      </div>

    </form>
  );
}