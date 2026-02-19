import { motion } from "framer-motion";
import { FileText, Video, Download, PlayCircle, Music, FolderOpen, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { db, Material } from "@/lib/db";
import { toast } from "sonner";

const StudentMaterials = () => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setMaterials(db.getMaterials());
    }, []);

    const handleDownload = (item: Material) => {
        const element = document.createElement("a");
        const file = new Blob([`Content for ${item.title}\n\n${item.description}`], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${item.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success(`Downloading ${item.title}...`);
    };

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const documents = filteredMaterials.filter(m => m.type === 'PDF');
    const multimedia = filteredMaterials.filter(m => m.type !== 'PDF');

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-muted/20 mx-auto w-full max-w-2xl mt-8">
            <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">{message}</h3>
            <p className="text-sm text-muted-foreground/70 max-w-sm mt-2">
                Your trainer hasn't shared any materials in this category just yet.
            </p>
        </div>
    );

    return (
        <div className="space-y-8 container mx-auto max-w-7xl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6"
            >
                <div>
                    <h1 className="font-display text-4xl font-bold text-foreground">Course Materials</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Download resources shared by your trainer.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </motion.div>

            <Tabs defaultValue="documents" className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="multimedia">Audio & Video</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="documents" className="mt-0">
                    {documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card className="hover:border-primary/50 hover:shadow-md transition-all group h-full flex flex-col">
                                        <CardContent className="p-6 flex flex-col gap-4 flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">{item.size}</span>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg line-clamp-2" title={item.title}>{item.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2" title={item.description}>{item.description}</p>
                                            </div>

                                            <div className="pt-4 mt-auto border-t flex justify-between items-center text-sm text-muted-foreground">
                                                <span>{item.date}</span>
                                                <Button size="sm" variant="outline" className="gap-2 hover:bg-primary hover:text-white" onClick={() => handleDownload(item)}>
                                                    <Download className="h-4 w-4" /> Download
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message={searchTerm ? "No matching documents found" : "No documents available"} />
                    )}
                </TabsContent>

                <TabsContent value="multimedia" className="mt-0">
                    {multimedia.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {multimedia.map((media, index) => (
                                <motion.div
                                    key={media.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full flex flex-col border-muted">
                                        <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                                            {media.type === 'Video' ? (
                                                <Video className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/70 transition-colors" />
                                            ) : (
                                                <Music className="h-16 w-16 text-muted-foreground/30 group-hover:text-primary/70 transition-colors" />
                                            )}

                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" className="rounded-full h-12 w-12 p-0 shadow-xl scale-90 group-hover:scale-100 transition-transform" onClick={() => handleDownload(media)}>
                                                    <Download className="h-6 w-6" />
                                                </Button>
                                            </div>

                                            <div className="absolute top-2 right-2">
                                                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                                    {media.type}
                                                </span>
                                            </div>
                                        </div>
                                        <CardHeader className="p-4 flex-1">
                                            <CardTitle className="text-base line-clamp-1" title={media.title}>{media.title}</CardTitle>
                                            <CardDescription className="line-clamp-2 mt-1" title={media.description}>{media.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message={searchTerm ? "No matching media found" : "No media files available"} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default StudentMaterials;
