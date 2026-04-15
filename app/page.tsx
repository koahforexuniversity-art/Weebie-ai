import { ForgeNav } from "@/components/forge/ForgeNav";
import { Hero } from "@/components/forge/Hero";
import {
  CollabSection,
  DeploySection,
  Footer,
  SwarmSection,
  VideoSection,
} from "@/components/forge/FeatureSections";

export default function LandingPage() {
  return (
    <>
      <ForgeNav />
      <main className="relative">
        <Hero />
        <VideoSection />
        <CollabSection />
        <SwarmSection />
        <DeploySection />
      </main>
      <Footer />
    </>
  );
}
