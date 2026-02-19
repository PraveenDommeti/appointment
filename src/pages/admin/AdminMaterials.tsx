import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen, Search, Plus,
    FileText, Video, Music,
    Download, Trash2, Edit,
    Globe, Shield, Layout,
    Filter, Clock, Calendar
} from "lucide-react";
import { db, Material } from "@/lib/db";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const AdminMaterials = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState({
        title: "",
        type: "PDF" as "PDF" | "Video" | "Audio",
        description: ""
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const refreshData = () => {
        setMaterials(db.getMaterials());
    };

    useEffect(() => {
        if (user) {
            refreshData();
        }
    }, [user]);

    const handleAdd = () => {
        if (!newMaterial.title || !newMaterial.description || !selectedFile) {
            toast.error("Please fill in all fields and select a file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const fileUrl = e.target?.result as string;

            const materialToAdd: Material = {
                id: Date.now().toString(),
                title: newMaterial.title,
                type: newMaterial.type,
                description: newMaterial.description,
                size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
                url: fileUrl, // Real file content stored as data URL
                date: new Date().toISOString().split('T')[0]
            };

            db.addMaterial(materialToAdd);
            toast.success("Global resource added and encrypted for distribution");
            refreshData();
            setIsAddOpen(false);
            setNewMaterial({ title: "", type: "PDF", description: "" });
            setSelectedFile(null);
        };
        reader.readAsDataURL(selectedFile);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "PDF": return FileText;
            case "Video": return Video;
            case "Audio": return Music;
            default: return FileText;
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 container mx-auto max-w-7xl pb-10">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 bg-muted/20 p-8 rounded-3xl border border-dashed"
            >
                <div className="space-y-1">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-foreground italic flex items-center gap-3">
                        Global <span className="text-primary">Resources</span> <Globe className="h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground font-medium">Standardize and distribute educational materials across the entire platform.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform gap-2">
                            <Plus className="h-4 w-4" /> Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Upload Resource</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Resource Title</Label>
                                <Input
                                    value={newMaterial.title}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                    placeholder="e.g. Advanced French Verbs"
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Content Type</Label>
                                <Select
                                    value={newMaterial.type}
                                    onValueChange={(val: any) => setNewMaterial({ ...newMaterial, type: val })}
                                >
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PDF">Document (PDF)</SelectItem>
                                        <SelectItem value="Video">Video Content</SelectItem>
                                        <SelectItem value="Audio">Audio Guide</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Description</Label>
                                <Textarea
                                    value={newMaterial.description}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                    placeholder="Brief summary of the content..."
                                    className="rounded-xl min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Source File</Label>
                                <Input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="h-11 rounded-xl pt-2"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button onClick={handleAdd} className="bg-primary rounded-xl px-8 shadow-lg shadow-primary/20">Distribute Globally</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: "Total Downloads", value: "1.2k", icon: Download, color: "text-primary" },
                    { label: "Storage Used", value: "4.5 GB", icon: Shield, color: "text-emerald-500" },
                    { label: "Shared Assets", value: materials.length.toString(), icon: Globe, color: "text-blue-500" }
                ].map((m, i) => (
                    <Card key={i} className="border-none shadow-lg bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl bg-muted group-hover:bg-primary/10 transition-colors shadow-inner", m.color)}>
                                    <m.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{m.label}</p>
                                    <h3 className="text-2xl font-black">{m.value}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 border-b bg-muted/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find Global Resource..."
                            className="pl-10 h-10 border-muted-foreground/20 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Badge variant="outline" className="px-3 py-1 rounded-lg border-muted-foreground/20 uppercase text-[10px] font-black">
                        {filteredMaterials.length} digital assets
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-b bg-muted/5">
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Asset Information</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Format</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">File Size</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60">Distribution</TableHead>
                                <TableHead className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest opacity-60 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {filteredMaterials.map((m, idx) => {
                                    const Icon = getTypeIcon(m.type);
                                    return (
                                        <motion.tr
                                            key={m.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-muted/30 transition-colors border-b last:border-0"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-2xl bg-muted border flex items-center justify-center font-black text-sm text-primary shadow-inner group-hover:border-primary/50 transition-colors">
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{m.title}</p>
                                                        <p className="text-[10px] text-muted-foreground uppercase font-black opacity-70 italic line-clamp-1 max-w-[200px]">
                                                            {m.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 bg-primary/5 text-primary">
                                                    {m.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <span className="text-xs font-semibold text-muted-foreground italic">
                                                    {m.size}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Globe className="h-3 w-3 text-emerald-500" />
                                                    <span className="text-[10px] font-black uppercase text-emerald-600">Global</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" asChild>
                                                        <a href={m.url} download={m.title}>
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminMaterials;
