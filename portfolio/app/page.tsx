import Image from "next/image";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects/Projects";

export default function Home() {
  return (
    <main>
      <Hero />
      <Projects />
    </main>
  );
}
