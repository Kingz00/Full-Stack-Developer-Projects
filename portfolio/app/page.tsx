import Image from "next/image";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects/Projects";
import About from "@/components/About/About";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
      <About />
    </main>
  );
}
