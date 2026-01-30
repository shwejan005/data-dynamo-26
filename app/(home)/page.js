
import { Header } from "@/components/ui/Header";
import { CTA } from "./_components/cta";
import { Features } from "./_components/features";
import { Hero } from "./_components/Hero";
import Videos from "./_components/videos";
import { Workflow } from "./_components/workflow";

export default function Home() {
  return (
    <main className="bg-black text-white overflow-hidden">
      <Header />
      <Hero />
      <Videos />
      <Features />
      <Workflow />
      <CTA />
    </main>
  )
};