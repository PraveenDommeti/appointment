import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Video, Music, Trash2, Upload } from "lucide-react";
import { db, Material } from "@/lib/db";
import { toast } from "sonner";

const TrainerMaterials = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [newTitle, setNewTitle] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newType, setNewType] = useState<"PDF" | "Video" | "Audio">("PDF");

    useEffect(() => {
        setMaterials(db.getMaterials());
    }, []);

    const handleAdd = () => {
        if (!newTitle || !newDesc || !selectedFile) {
            toast.error("Please fill in all fields and select a file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileUrl = e.target?.result as string;

            const material: Material = {
                id: Date.now().toString(),
                title: newTitle,
                description: newDesc,
                type: newType,
                size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
                url: fileUrl,
                date: new Date().toISOString().split('T')[0]
            };

            db.addMaterial(material);
            setMaterials([material, ...materials]);
            resetForm();
            toast.success("Training node published to decentralized registry");
        };
        reader.readAsDataURL(selectedFile);
    };

    const resetForm = () => {
        setNewTitle("");
        setNewDesc("");
        setNewType("PDF");
        setIsAdding(false);
    };

    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex justify-between items-center"
            >
                <div>
                    <h1 className="font-display text-3xl font-bold text-foreground">Course Materials</h1>
                    <p className="text-muted-foreground mt-2">Manage and upload resources for your students.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
                    <Plus className="h-4 w-4" /> {isAdding ? "Cancel" : "Upload Material"}
                </Button>
            </motion.div>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Submit New Material</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="e.g., French Verbs Cheat Sheet"
                                        value={newTitle}
                                        onChange={e => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                        value={newType}
                                        onChange={e => setNewType(e.target.value as any)}
                                    >
                                        <option value="PDF">PDF Document</option>
                                        <option value="Video">Video Lesson</option>
                                        <option value="Audio">Audio Clip</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    placeholder="Explain how students should use this material..."
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Source File</Label>
                                <Input
                                    type="file"
                                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <Button className="w-full gap-2" onClick={handleAdd}>
                                <Upload className="h-4 w-4" /> Publish Material
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    {item.type === 'PDF' ? <FileText className="h-5 w-5" /> :
                                        item.type === 'Video' ? <Video className="h-5 w-5" /> : <Music className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground leading-none">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{item.type} • {item.size}</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                            <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-4">
                                <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                                    <a href={item.url} download={item.title}>Download</a>
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive h-8 px-2">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TrainerMaterials;
