import Image from "next/image";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects/Projects";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <About />
      <Contact />
    </main>
  );
}
