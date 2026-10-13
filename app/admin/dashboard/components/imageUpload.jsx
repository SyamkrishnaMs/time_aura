"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ImageUpload({
  existingImages = [],
  onUpload,
  onRemoveExisting,
}) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // FILE SELECT
  // =========================
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    setFiles(selectedFiles);
    setMessage("");

    const previewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
  };

  // =========================
  // CLEAN PREVIEW URLS
  // =========================
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  // =========================
  // UPLOAD NEW IMAGES
  // =========================
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select at least one image");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const uploadedImages = [];

      for (const file of files) {
        const formData = new FormData();

        formData.append("image", file);

        const response = await axios.post(
          "/api/admin/upload",
          formData
        );

        uploadedImages.push(
          response.data.imageUrl
        );
      }

      // Send uploaded image URLs to ProductForm
      onUpload(uploadedImages);

      setMessage(
        `${uploadedImages.length} image(s) uploaded successfully`
      );

      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setMessage(
        error.response?.data?.message ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-[#fafaf7] p-5">

      <h3 className="text-sm font-semibold text-black">
        Product Images
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Manage existing images or add new images
      </p>

      {/* =========================
          EXISTING IMAGES
      ========================= */}
      {existingImages.length > 0 && (
        <div className="mt-4">

          <p className="mb-3 text-xs font-semibold text-gray-700">
            Existing Images
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

            {existingImages.map(
              (image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                >

                  <img
                    src={image}
                    alt={`Existing product image ${
                      index + 1
                    }`}
                    className="h-24 w-full object-cover"
                  />

                  {/* REMOVE EXISTING IMAGE */}
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveExisting(index)
                    }
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white"
                  >
                    ×
                  </button>

                  <p className="px-2 py-1 text-center text-xs text-gray-500">
                    Image {index + 1}
                  </p>

                </div>
              )
            )}

          </div>
        </div>
      )}

      {/* =========================
          SELECT NEW IMAGES
      ========================= */}
      <div className="mt-5">

        <p className="mb-2 text-xs font-semibold text-gray-700">
          Add New Images
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm"
        />

      </div>

      {/* SELECTED COUNT */}
      {files.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">
          {files.length} new image(s) selected
        </p>
      )}

      {/* =========================
          NEW IMAGE PREVIEWS
      ========================= */}
      {previews.length > 0 && (
        <div className="mt-4">

          <p className="mb-3 text-xs font-semibold text-gray-700">
            New Images
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

            {previews.map(
              (preview, index) => (
                <div
                  key={preview}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white"
                >

                  <img
                    src={preview}
                    alt={`New product image ${
                      index + 1
                    }`}
                    className="h-24 w-full object-cover"
                  />

                  <p className="px-2 py-1 text-center text-xs text-gray-500">
                    New Image {index + 1}
                  </p>

                </div>
              )
            )}

          </div>
        </div>
      )}

      {/* =========================
          UPLOAD BUTTON
      ========================= */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={
          uploading ||
          files.length === 0
        }
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading
          ? `Uploading ${files.length} image(s)...`
          : "Upload New Images"}
      </button>

      {/* MESSAGE */}
      {message && (
        <p className="mt-3 text-sm text-gray-600">
          {message}
        </p>
      )}

    </div>
  );
}