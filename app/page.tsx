import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection"
import FeaturedWatches from "@/app/components/FeaturedWatches"
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";


export default function Home() {
  return (
    <main className="min-h-screen bg-black">
   <Navbar/>
      
        <section id="home">
          <HeroSection />
        </section>

        <section id="feature">
          <FeaturedWatches />
        </section>


        <section id="about">
          <AboutSection />
        </section>

        <section id="contact">
          <ContactSection/>
        </section>

        <Footer/>
      </main>

    
  );
}