
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Image as ImageIcon,
  Upload,
  Save,
  Loader2,
  Video,
} from "lucide-react";

export default function LandingPage() {
  // ==========================================
  // STATES
  // ==========================================

  const [heroImage, setHeroImage] = useState("");
  const [heroFile, setHeroFile] = useState(null);

  const [adVideo, setAdVideo] = useState("");
  const [adVideoFile, setAdVideoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // GET LANDING PAGE
  // ==========================================

  useEffect(() => {
    fetchLandingPage();
  }, []);

  const fetchLandingPage = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/admin/landing"
      );

      if (response.data.success) {
        const landingPage =
          response.data.landingPage;

        setHeroImage(
          landingPage.heroImage || ""
        );

        setAdVideo(
          landingPage.adVideo || ""
        );
      }
    } catch (error) {
      console.error(
        "GET LANDING PAGE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load landing page"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // HERO IMAGE SELECT
  // ==========================================

  const handleHeroImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setHeroFile(file);

    // Local preview
    const previewUrl =
      URL.createObjectURL(file);

    setHeroImage(previewUrl);

    setMessage("");
    setError("");
  };

  // ==========================================
  // AD VIDEO SELECT
  // ==========================================

  const handleAdVideoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }

    setAdVideoFile(file);

    // Local preview
    const previewUrl =
      URL.createObjectURL(file);

    setAdVideo(previewUrl);

    setMessage("");
    setError("");
  };

  // ==========================================
  // UPLOAD IMAGE TO CLOUDINARY
  // ==========================================

  const uploadImage = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await axios.post(
      "/api/admin/landing/upload",
      formData,
      {
        withCredentials: true,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Image upload failed"
      );
    }

    return response.data.imageUrl;
  };

  // ==========================================
  // UPLOAD VIDEO TO CLOUDINARY
  // ==========================================

  const uploadVideo = async (file) => {
    const formData = new FormData();

    formData.append("video", file);

    const response = await axios.post(
      "/api/admin/landing/upload-video",
      formData,
      {
        withCredentials: true,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message ||
          "Video upload failed"
      );
    }

    return response.data.videoUrl;
  };

  // ==========================================
  // SAVE LANDING PAGE
  // ==========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      // ======================================
      // HERO IMAGE
      // ======================================

      let finalHeroImage = heroImage;

      if (heroFile) {
        const uploadedHeroImage =
          await uploadImage(heroFile);

        if (!uploadedHeroImage) {
          throw new Error(
            "Hero image upload failed."
          );
        }

        finalHeroImage =
          uploadedHeroImage;

        console.log(
          "UPLOADED HERO IMAGE:",
          finalHeroImage
        );
      }

      // ======================================
      // AD VIDEO
      // ======================================

      let finalAdVideo = adVideo;

      if (adVideoFile) {
        console.log(
          "UPLOADING VIDEO:",
          adVideoFile.name
        );

        const uploadedVideo =
          await uploadVideo(adVideoFile);

        console.log(
          "CLOUDINARY VIDEO URL:",
          uploadedVideo
        );

        if (!uploadedVideo) {
          throw new Error(
            "Video uploaded, but Cloudinary URL was not returned."
          );
        }

        finalAdVideo = uploadedVideo;
      }

      // ======================================
      // SAVE TO MONGODB
      // ======================================

      console.log(
        "FINAL LANDING DATA:",
        {
          heroImage: finalHeroImage,
          adVideo: finalAdVideo,
        }
      );

      const response = await axios.put(
        "/api/admin/landing",
        {
          heroImage: finalHeroImage,
          adVideo: finalAdVideo,
        },
        {
          withCredentials: true,
        }
      );

      console.log(
        "LANDING SAVE RESPONSE:",
        response.data
      );

      // ======================================
      // SUCCESS
      // ======================================

      if (response.data.success) {
        const updated =
          response.data.landingPage;

        setHeroImage(
          updated.heroImage || ""
        );

        setAdVideo(
          updated.adVideo || ""
        );

        setHeroFile(null);
        setAdVideoFile(null);

        setMessage(
          "Landing page updated successfully."
        );
      }
    } catch (error) {
      console.error(
        "SAVE LANDING PAGE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save landing page"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#f8f8f1]">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span className="text-sm">
            Loading landing page...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8f8f1] p-6">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-black p-3 text-white">
            <ImageIcon size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Landing Page
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your Time Aura landing page
            </p>
          </div>

        </div>

      </div>

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ======================================
          HERO IMAGE
      ====================================== */}

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <h2 className="text-lg font-semibold text-gray-900">
            Hero Image
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            This image will appear on the main
            landing page.
          </p>

        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* ====================================
              HERO PREVIEW
          ==================================== */}

          <div className="overflow-hidden rounded-2xl bg-gray-100">

            {heroImage ? (
              <img
                src={heroImage}
                alt="Hero preview"
                className="h-[320px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center text-gray-400">
                No hero image
              </div>
            )}

          </div>

          {/* ====================================
              HERO UPLOAD
          ==================================== */}

          <div className="flex flex-col justify-center">

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center transition hover:border-black hover:bg-gray-100">

              <Upload size={28} />

              <span className="mt-3 text-sm font-medium text-gray-900">
                Upload Hero Image
              </span>

              <span className="mt-1 text-xs text-gray-500">
                JPG, PNG or WEBP
              </span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handleHeroImageChange
                }
              />

            </label>

            {heroFile && (
              <p className="mt-3 truncate text-xs text-gray-500">
                Selected: {heroFile.name}
              </p>
            )}

          </div>

        </div>

      </section>

      {/* ======================================
          SHOP AD VIDEO
      ====================================== */}

      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        <div className="mb-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-black p-3 text-white">
              <Video size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Shop Ad Video
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                This video will appear on the Shop page.
              </p>
            </div>

          </div>

        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

          {/* ====================================
              VIDEO PREVIEW
          ==================================== */}

          <div className="overflow-hidden rounded-2xl bg-black">

            {adVideo ? (
              <video
                src={adVideo}
                controls
                muted
                playsInline
                className="h-[320px] w-full object-cover"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center text-sm text-gray-400">
                No ad video
              </div>
            )}

          </div>

          {/* ====================================
              VIDEO UPLOAD
          ==================================== */}

          <div className="flex flex-col justify-center">

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center transition hover:border-black hover:bg-gray-100">

              <Video size={28} />

              <span className="mt-3 text-sm font-medium text-gray-900">
                Upload Ad Video
              </span>

              <span className="mt-1 text-xs text-gray-500">
                MP4, WEBM or MOV
              </span>

              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={
                  handleAdVideoChange
                }
              />

            </label>

            {adVideoFile && (
              <p className="mt-3 truncate text-xs text-gray-500">
                Selected: {adVideoFile.name}
              </p>
            )}

          </div>

        </div>

      </section>

      {/* ======================================
          SAVE BUTTON
      ====================================== */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >

          {saving ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={18} />

              Save Changes
            </>
          )}

        </button>

      </div>

    </div>
  );
}
