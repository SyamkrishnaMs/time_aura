import mongoose from "mongoose";

const landingPageSchema = new mongoose.Schema(
  {
    heroImage: {
      type: String,
      default: "",
    },

    adVideo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const LandingPage =
  mongoose.models.LandingPage ||
  mongoose.model(
    "LandingPage",
    landingPageSchema
  );

export default LandingPage;