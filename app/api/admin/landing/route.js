
import { NextResponse } from "next/server";
import connectDB from "../../../lib/mongodb";
import LandingPage from "../../../models/landingPage";

// ==========================================
// GET LANDING PAGE
// ==========================================

export async function GET() {
  try {
    await connectDB();

    let landingPage = await LandingPage.findOne();

    // Create document if it does not exist
    if (!landingPage) {
      landingPage = await LandingPage.create({
        heroImage: "",
        adVideo: "",
      });
    }

    return NextResponse.json(
      {
        success: true,
        landingPage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET LANDING PAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ==========================================
// UPDATE LANDING PAGE
// ==========================================

export async function PUT(req) {
  try {
    await connectDB();

    // ======================================
    // GET REQUEST BODY
    // ======================================

    const body = await req.json();

    console.log(
      "LANDING PUT BODY:",
      body
    );

    const {
      heroImage,
      adVideo,
    } = body;

    // ======================================
    // FIND EXISTING LANDING PAGE
    // ======================================

    let landingPage =
      await LandingPage.findOne();

    // ======================================
    // CREATE IF NOT EXISTS
    // ======================================

    if (!landingPage) {
      landingPage =
        new LandingPage({
          heroImage: heroImage || "",
          adVideo: adVideo || "",
        });
    } else {
      // ====================================
      // UPDATE HERO IMAGE
      // ====================================

      if (heroImage !== undefined) {
        landingPage.heroImage =
          heroImage;
      }

      // ====================================
      // UPDATE AD VIDEO
      // ====================================

      if (adVideo !== undefined) {
        landingPage.adVideo =
          adVideo;
      }
    }

    // ======================================
    // SAVE TO MONGODB
    // ======================================

    await landingPage.save();

    // ======================================
    // VERIFY SAVED DATA
    // ======================================

    const savedLandingPage =
      await LandingPage.findById(
        landingPage._id
      );

    console.log(
      "LANDING SAVED TO MONGODB:",
      savedLandingPage
    );

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Landing page updated successfully",
        landingPage: savedLandingPage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "UPDATE LANDING PAGE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
