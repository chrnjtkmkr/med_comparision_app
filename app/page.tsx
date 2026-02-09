"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scanMedicineAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);
      const res = await scanMedicineAction(formData);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Failed to scan image");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 flex items-center justify-center z-50">
        <div className="flex items-center gap-3 glass-morphism px-5 py-2 rounded-full shadow-2xl">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">medication</span>
          </div>
          <h1 className="text-xl font-display font-black tracking-tight text-white">MedScanner AI</h1>
        </div>
      </header>

      <div className="w-full max-w-2xl mt-20 mb-10">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="relative"
            >
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square md:aspect-[16/10] glass-morphism rounded-[2.5rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary/60 transition-all group overflow-hidden"
              >
                <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-5xl text-primary font-bold">add_a_photo</span>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-display font-bold text-white">Upload Medicine Image</h2>
                  <p className="text-slate-400 text-sm px-10">Works on PC (Files) & Mobile (Camera/Photos)</p>
                </div>

                {/* Visual Flair */}
                <div className="absolute -bottom-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -top-10 -left-10 size-40 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-700" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={cn(
                "relative aspect-square md:aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/10",
                isScanning && "scan-animation"
              )}>
                <img src={image} alt="Preview" className="w-full h-full object-cover" />

                {isScanning && (
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/10 glass-morphism px-6 py-3 rounded-full animate-bounce">
                      <p className="text-white font-bold text-sm tracking-widest uppercase">Analyzing Medicine...</p>
                    </div>
                  </div>
                )}

                {!isScanning && !result && (
                  <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                    <Button
                      onClick={startScan}
                      className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                      Identify Medicine
                    </Button>
                    <Button
                      onClick={reset}
                      variant="outline"
                      className="size-14 rounded-2xl glass-morphism border-white/10 text-white hover:bg-red-500/20"
                    >
                      <span className="material-symbols-outlined text-2xl text-red-400">delete</span>
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
                  {error}
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Medicine Header Card */}
                  <div className="glass-morphism p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{result.form}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md">{result.strength}</span>
                        </div>
                        <h1 className="text-4xl font-display font-black text-white leading-tight">{result.medicine_name}</h1>
                        <p className="text-slate-400 leading-relaxed font-medium">{result.short_description}</p>
                      </div>
                      <Button onClick={reset} variant="ghost" className="text-slate-500 hover:text-white shrink-0">
                        Scan Another
                      </Button>
                    </div>

                    {/* Background icon blur */}
                    <div className="absolute -right-10 -bottom-10 size-48 opacity-5 group-hover:scale-110 transition-transform duration-700">
                      <span className="material-symbols-outlined text-[120px] text-white">neurology</span>
                    </div>
                  </div>

                  {/* Grid layout for detailed info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard title="Main Uses" icon="check_circle" items={result.main_uses} color="text-emerald-400" />
                    <InfoCard title="Composition" icon="science" items={result.salts} color="text-blue-400" />
                    <InfoCard title="Benefits" icon="bolt" items={result.pros} color="text-amber-400" />
                    <InfoCard title="Warnings" icon="warning" items={result.warnings} color="text-red-400" />
                  </div>

                  {/* Wide Info Card */}
                  <div className="glass-morphism p-8 rounded-[2.5rem] border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary">info</span>
                      <h3 className="text-xl font-display font-bold text-white">How to take</h3>
                    </div>
                    <p className="text-slate-300 font-medium leading-relaxed">{result.how_to_take}</p>

                    <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                      <p className="text-amber-400 text-xs font-bold leading-relaxed italic text-center">
                        Disclaimer: This information is AI-generated for educational purposes. Always consult a certified physician before using any medication.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <footer className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] py-8 text-center opacity-50">
        Clinical Grade Medicine Analysis · Powered by Gemini Flash
      </footer>
    </main>
  );
}

function InfoCard({ title, icon, items, color }: { title: string, icon: string, items: string[], color: string }) {
  return (
    <div className="glass-morphism p-6 rounded-[2rem] border-white/5 hover:border-white/15 transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("size-10 rounded-xl bg-white/5 flex items-center justify-center", color)}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg font-display font-bold text-white tracking-tight">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className={cn("size-1.5 rounded-full mt-2 shrink-0 bg-current opacity-30", color)} />
            <span className="text-slate-300 text-sm font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
