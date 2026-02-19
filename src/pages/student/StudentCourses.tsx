import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, GraduationCap, TrendingUp, Award } from "lucide-react";
import { db, Course } from "@/lib/db";
import { cn } from "@/lib/utils";

const StudentCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const fetchCourses = () => {
            const allCourses = db.getCourses().filter(c => c.status === "Active");
            setCourses(allCourses);
        };

        fetchCourses();
        const interval = setInterval(fetchCourses, 3000);
        return () => clearInterval(interval);
    }, []);

    const getLevelColor = (level: string) => {
        const colors: Record<string, string> = {
            "A1": "bg-blue-50 text-blue-600 border-blue-200",
            "A2": "bg-green-50 text-green-600 border-green-200",
            "B1": "bg-yellow-50 text-yellow-600 border-yellow-200",
            "B2": "bg-orange-50 text-orange-600 border-orange-200",
            "C1": "bg-purple-50 text-purple-600 border-purple-200",
        };
        return colors[level] || "bg-gray-50 text-gray-600 border-gray-200";
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Available <span className="text-primary">Courses</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium mt-2">
                        Explore our comprehensive language learning programs
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-bold">
                        {courses.length} Active Courses
                    </Badge>
                </div>
            </div>

            {/* Courses Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {courses.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed"
                        >
                            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                            <h3 className="text-xl font-bold text-foreground opacity-30">No courses available</h3>
                            <p className="text-sm text-muted-foreground mt-2 opacity-50">
                                Check back soon for new learning opportunities
                            </p>
                        </motion.div>
                    ) : (
                        courses.map((course, idx) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                                    {/* Course Image */}
                                    <div className="h-48 overflow-hidden relative bg-gradient-to-br from-primary/10 to-primary/5">
                                        <img
                                            src={course.image || `https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000&auto=format&fit=crop`}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Level Badge */}
                                        <div className="absolute top-4 right-4">
                                            <Badge className={cn("border font-bold text-xs px-3 py-1", getLevelColor(course.level))}>
                                                {course.level}
                                            </Badge>
                                        </div>

                                        {/* Title Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                                                {course.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Course Details */}
                                    <CardContent className="p-6 space-y-4">
                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                            {course.description}
                                        </p>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                                    Duration
                                                </div>
                                                <p className="font-bold text-sm">{course.duration} mins</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Users className="h-3.5 w-3.5 text-primary" />
                                                    Enrolled
                                                </div>
                                                <p className="font-bold text-sm">{course.studentsEnrolled.length} students</p>
                                            </div>
                                        </div>

                                        {/* Schedule */}
                                        <div className="pt-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                                                Schedule
                                            </div>
                                            <p className="text-sm font-medium">{course.schedule}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentCourses;
