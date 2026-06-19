import Footer from "./components/home/Footer";
import HeroSection from "./components/home/HeroSection";
import PipelineSection from "./components/home/PipelineSection";

const Home = () => {
  return (
    <div className="bg-background text-foreground min-h-screen antialiased transition-colors duration-300">
      <main className="flex flex-col">
        <HeroSection />
        <PipelineSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
