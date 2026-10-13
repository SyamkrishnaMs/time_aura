import cloudinary from "../../../../lib/cloudinary.js";

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("image");

    if (!file) {
      return Response.json(
        {
          success: false,
          message: "Image is required",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "time-aura/landing",
            resource_type: "image",
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
    });

    return Response.json(
      {
        success: true,
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Landing Cloudinary upload error:",
      error
    );

    return Response.json(
      {
        success: false,
        message: "Image upload failed",
      },
      { status: 500 }
    );
  }
}