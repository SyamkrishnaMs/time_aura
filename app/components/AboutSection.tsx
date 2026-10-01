import Image from "next/image";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="bg-black px-6 py-20 text-white md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

       <div className="relative h-[450px] overflow-hidden md:h-[550px]">
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
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-gray-400">
            About Time Aura
          </p>

          <h2 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
            Time is more than
            <span className="block text-gray-400">
              just a moment.
            </span>
          </h2>

          <p className="mt-7 max-w-xl text-base leading-7 text-gray-400">
            At Time Aura, we believe a watch is more than an accessory.
            It is a reflection of your personality, your journey, and
            the moments that matter most.
          </p>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-400">
            Our collection brings together timeless design, modern
            craftsmanship, and refined details to create watches that
            are made to stay with you through every moment.
          </p>

          {/* Button */}
          <Link
            href="/shop"
            className="mt-8 inline-flex border border-white px-7 py-3 text-sm font-medium transition duration-300 hover:bg-white hover:text-black"
          >
            Explore Collection
          </Link>
        </div>
      </div>
    </section>
  );
}