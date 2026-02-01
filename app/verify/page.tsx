"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, Upload, CheckCircle, AlertTriangle, Loader2, ScanLine, ShieldCheck, Info } from "lucide-react";
import { verifyMedicineAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function VerifyPage() {
    const [oldImage, setOldImage] = useState<string | null>(null);
    const [newImage, setNewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "old" | "new") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                const base64Data = result.split(",")[1];
                if (type === "old") setOldImage(base64Data);
                else setNewImage(base64Data);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerify = async () => {
        if (!oldImage || !newImage) return;
        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("oldStrip", oldImage);
        formData.append("newStrip", newImage);

        try {
            const response = await verifyMedicineAction(formData);
            if (response.success) {
                setResult(response.data);
                if (response.data.match_status === "SAFE MATCH") {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#22c55e', '#10b981', '#ffffff']
                    });
                }
            } else {
                alert(response.error);
            }
        } catch (error) {
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-20 font-sans">
            <header className="mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-700">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Scanner Auditor
                </h1>
            </header>

            <div className="grid gap-8 md:grid-cols-2 max-w-6xl mx-auto">
                {/* Upload Section */}
                <div className="space-y-6">
                    <Card className="hover:shadow-2xl transition-shadow duration-300 border-none shadow-lg overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
                            <CardTitle>Upload Medicine Strips</CardTitle>
                            <CardDescription>Upload clear images of both strips to compare.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            {/* Old Strip */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative border-2 border-dashed border-blue-200 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleFileChange(e, "old")}
                                    accept="image/*"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                                        oldImage ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {oldImage ? <CheckCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        {oldImage ? "Old Strip Selected" : "Upload Old Strip"}
                                    </span>
                                </div>
                            </motion.div>

                            {/* New Strip */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-indigo-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => handleFileChange(e, "new")}
                                    accept="image/*"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300",
                                        newImage ? "bg-green-100 text-green-600" : "bg-indigo-100 text-indigo-600"
                                    )}>
                                        {newImage ? <CheckCircle className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                                    </div>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                                        {newImage ? "New Strip Selected" : "Upload New Strip"}
                                    </span>
                                </div>
                            </motion.div>

                            <Button
                                onClick={handleVerify}
                                disabled={!oldImage || !newImage || loading}
                                className={cn(
                                    "w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all transform",
                                    loading ? "opacity-90" : "hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600"
                                )}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" /> Analyzing Composition...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <ScanLine className="w-5 h-5" /> Compare Salts
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm rounded-xl border border-white/20"
                            >
                                <div className="relative w-full max-w-sm h-64 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border-2 border-dashed border-slate-300">
                                    <motion.div
                                        className="absolute top-0 left-0 w-full h-2 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10"
                                        animate={{ top: ["0%", "100%", "0%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-sm font-medium animate-pulse text-muted-foreground">AI is scanning ingredients...</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, staggerChildren: 0.1 }}
                                className="space-y-6"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <Card className={cn(
                                        "border-l-8 shadow-xl overflow-hidden",
                                        result.match_status === "SAFE MATCH" ? "border-l-green-500" : "border-l-red-500"
                                    )}>
                                        <div className={cn(
                                            "absolute top-0 right-0 p-4 opacity-10",
                                            result.match_status === "SAFE MATCH" ? "text-green-500" : "text-red-500"
                                        )}>
                                            <ShieldCheck className="w-24 h-24" />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className={cn("text-3xl font-black tracking-tight", result.match_status === "SAFE MATCH" ? "text-green-600" : "text-red-600")}>
                                                {result.match_status}
                                            </CardTitle>
                                            <CardDescription className="text-base font-medium text-slate-700 dark:text-slate-300 mt-2">
                                                {result.reason}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>

                                    {/* Warnings */}
                                    {result.warnings && result.warnings.length > 0 && (
                                        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                            <div className="flex">
                                                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-red-800">Critical Warnings</h3>
                                                    <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                                                        {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Enhanced Comparison Table */}
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                    <Card>
                                        <CardHeader><CardTitle className="text-lg">Detailed Comparison</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-xs">
                                                        <tr>
                                                            <th className="px-4 py-3 rounded-l-lg">Feature</th>
                                                            <th className="px-4 py-3 text-blue-600">Old Medicine</th>
                                                            <th className="px-4 py-3 rounded-r-lg text-green-600">New Medicine</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {result.comparison_table?.map((row: any, i: number) => (
                                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <td className="px-4 py-3 font-medium">{row.feature}</td>
                                                                <td className="px-4 py-3">{row.old}</td>
                                                                <td className="px-4 py-3 font-bold">{row.new}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Generic Suggestion */}
                                {result.generic_suggestion && (
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                                        <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
                                            <CardHeader className="flex flex-row items-center gap-4">
                                                <div className="bg-teal-100 p-2 rounded-full"><Info className="w-6 h-6 text-teal-600" /></div>
                                                <div>
                                                    <CardTitle className="text-teal-800 text-lg">Suggestion: {result.generic_suggestion.name}</CardTitle>
                                                    <CardDescription className="text-teal-600">{result.generic_suggestion.benefit}</CardDescription>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Old Medicine */}
                                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                                        <Card className="h-full border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-shadow bg-blue-50/10">
                                            <CardHeader className="bg-blue-100/20 pb-2">
                                                <CardTitle className="text-lg text-blue-700 font-bold">Old Medicine</CardTitle>
                                                <p className="text-sm text-blue-600/80 font-mono">{result.old_medicine?.name || "Unknown"}</p>
                                            </CardHeader>
                                            <CardContent className="space-y-3 pt-4 text-sm">
                                                <DetailRow label="Uses" value={result.old_medicine?.details?.uses} />
                                                <DetailRow label="Pros" value={result.old_medicine?.details?.pros} />
                                                <DetailRow label="Cons" value={result.old_medicine?.details?.cons} />
                                                <div className="bg-yellow-100/50 p-3 rounded-lg border border-yellow-200/50 mt-4">
                                                    <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-1">
                                                        <AlertTriangle className="w-4 h-4" /> Precautions
                                                    </h4>
                                                    <p className="text-yellow-900/90">{result.old_medicine?.details?.precautions}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* New Medicine */}
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                        <Card className="h-full border-t-4 border-t-green-500 shadow-lg hover:shadow-xl transition-shadow bg-green-50/10">
                                            <CardHeader className="bg-green-100/20 pb-2">
                                                <CardTitle className="text-lg text-green-700 font-bold">New Medicine</CardTitle>
                                                <p className="text-sm text-green-600/80 font-mono">{result.new_medicine?.name || "Unknown"}</p>
                                            </CardHeader>
                                            <CardContent className="space-y-3 pt-4 text-sm">
                                                <DetailRow label="Uses" value={result.new_medicine?.details?.uses} />
                                                <DetailRow label="Pros" value={result.new_medicine?.details?.pros} />
                                                <DetailRow label="Cons" value={result.new_medicine?.details?.cons} />
                                                <div className="bg-yellow-100/50 p-3 rounded-lg border border-yellow-200/50 mt-4">
                                                    <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-1">
                                                        <AlertTriangle className="w-4 h-4" /> Precautions
                                                    </h4>
                                                    <p className="text-yellow-900/90">{result.new_medicine?.details?.precautions}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {!result && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl min-h-[300px] p-8"
                            >
                                <ShieldCheck className="w-24 h-24 mb-4 text-slate-200 dark:text-slate-800" />
                                <p className="text-xl font-medium text-slate-400">Ready to Audit</p>
                                <p className="text-sm text-slate-400/80">Upload strips to see detailed comparison</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value?: string }) {
    if (!value) return null;
    return (
        <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider mb-1">{label}</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{value}</p>
        </div>
    );
}
