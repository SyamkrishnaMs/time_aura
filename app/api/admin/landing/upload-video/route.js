
import cloudinary from "../../../../lib/cloudinary.js";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("video");

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "Video is required",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // CHECK FILE TYPE
    // ==========================================

    if (!file.type?.startsWith("video/")) {
      return Response.json(
        {
          success: false,
          message: "Please upload a valid video file",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // CONVERT FILE TO BUFFER
    // ==========================================

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ==========================================
    // UPLOAD TO CLOUDINARY
    // ==========================================

    const result = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "time-aura/landing",
              resource_type: "video",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          )
          .end(buffer);
      }
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return Response.json(
      {
        success: true,
        message: "Video uploaded successfully",
        videoUrl: result.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Landing Cloudinary video upload error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Video upload failed",
      },
      { status: 500 }
    );
  }
}
