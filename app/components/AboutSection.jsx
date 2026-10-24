import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section id="about" className="bg-[#0a0b0e] px-6 py-20 text-white md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

        {/* Video Container */}
        <div className="relative h-[450px] overflow-hidden rounded-[28px] border border-amber-400/30 bg-black shadow-2xl md:h-[550px]">
          <video
            src="/16639006_1920_1080_25fps.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover transition duration-700 hover:scale-105"
          />
        </div>

        {/* Content */}
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-amber-400">
            About Time Aura
          </p>

          <h2 className="font-serif max-w-xl text-4xl font-bold leading-tight md:text-5xl text-white">
            Time is more than
            <span className="block text-gray-400 font-light mt-1">
              just a moment.
            </span>
          </h2>

          <p className="mt-7 max-w-xl text-sm md:text-base leading-relaxed text-gray-400 font-light">
            At Time Aura, we believe a watch is more than an accessory.
            It is a reflection of your personality, your journey, and
            the moments that matter most.
          </p>

          <p className="mt-5 max-w-xl text-sm md:text-base leading-relaxed text-gray-400 font-light">
            Our collection brings together timeless design, modern
            craftsmanship, and refined details to create watches that
            are made to stay with you through every moment.
          </p>

          {/* Button */}
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-8 py-3.5 text-xs font-extrabold uppercase tracking-widest text-black shadow-lg shadow-amber-500/20 transition duration-300 hover:from-amber-400 hover:to-yellow-500 active:scale-95"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </section>
  );
}