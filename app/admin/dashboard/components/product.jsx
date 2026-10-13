"use client";

import { useState } from "react";
import ProductForm from "./productForm";
import ProductList from "./productList";

export default function Product() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleProductAdded = () => {
    setRefreshKey((prev) => prev + 1);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <ProductForm
        editingProduct={editingProduct}
        onProductAdded={handleProductAdded}
        onCancelEdit={handleCancelEdit}
      />

      <ProductList
        refreshKey={refreshKey}
        onEdit={handleEdit}
      />
    </div>
  );
}