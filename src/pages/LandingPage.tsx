import heroImage from "@/assets/hero-illustration.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Course, db } from "@/lib/db";
import { motion } from "framer-motion";
import {
    Clock,
    GraduationCap,
    Star,
    Video
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        setCourses(db.getCourses().filter(c => c.status === "Active").slice(0, 3));

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAction = () => {
        if (user) {
            if (user.role === 'student') navigate('/student/book');
            else if (user.role === 'trainer') navigate('/trainer');
            else if (user.role === 'admin') navigate('/admin');
            else navigate('/superadmin');
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="min-h-screen bg-white font-body selection:bg-primary/10">
            {/* 1️⃣ HEADER (Compact) */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b py-2' : 'bg-transparent py-3'}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-display text-lg font-black tracking-tighter uppercase italic">
                            École <span className="text-primary">Française</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors italic">Home</Link>
                        <Link to="#courses" className="text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors italic">Courses</Link>
                        <Link to="/login" className="text-xs font-black uppercase tracking-widest text-foreground/60 hover:text-primary transition-colors italic">Login</Link>
                    </nav>

                    <Link to="/signup">
                        <Button className="rounded-full px-6 h-9 text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-primary/20">
                            Register
                        </Button>
                    </Link>
                </div>
            </header>

            {/* 2️⃣ HERO SECTION */}
            <section className="relative pt-24 pb-12 lg:pt-32 lg:pb-20 overflow-hidden bg-slate-50 border-b">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="max-w-xl"
                        >
                            <h1 className="font-display text-4xl lg:text-6xl font-black tracking-tighter text-foreground leading-[0.95] mb-6 italic uppercase">
                                Learn French with <br />
                                <span className="text-primary not-italic">Live Online</span> Classes
                            </h1>
                            <p className="text-base lg:text-lg text-foreground/50 font-medium mb-8 leading-relaxed italic">
                                Structured lessons, flexible scheduling, and expert trainers to help you <span className="text-foreground font-bold">parler français</span> with confidence.
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button onClick={handleAction} size="lg" className="h-14 px-10 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/20 hover:translate-y-[-2px] transition-all">
                                    Book a Class
                                </Button>
                                <Button onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} variant="outline" size="lg" className="h-14 px-10 rounded-2xl font-black italic uppercase tracking-widest text-[11px] border-2">
                                    Explore Courses
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="hidden lg:block relative"
                        >
                            <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-white aspect-video flex items-center justify-center">
                                <img src={heroImage} alt="Platform Preview" className="w-full h-full object-cover grayscale-[0.2]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3️⃣ FEATURES SECTION (ONLY 3) */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-3xl font-black tracking-tighter uppercase italic mb-2">Why Choose Us</h2>
                        <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Video, title: "Live Interactive Classes", desc: "Real-time sessions with experienced trainers." },
                            { icon: Clock, title: "Flexible Scheduling", desc: "Book sessions at your convenient time." },
                            { icon: Star, title: "Personalized Learning", desc: "Solo or group classes based on your level." }
                        ].map((f, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-transparent hover:border-primary/5 hover:bg-white hover:shadow-2xl transition-all text-center">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-black italic uppercase mb-3 tracking-tight">{f.title}</h3>
                                <p className="text-sm text-foreground/50 font-medium leading-relaxed italic">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4️⃣ COURSES SECTION (Dynamic) */}
            <section id="courses" className="py-16 md:py-24 bg-slate-50 border-y">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                        <h2 className="font-display text-3xl lg:text-4xl font-black tracking-tighter italic uppercase">Our Courses</h2>
                        <p className="text-foreground/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">Premium Educational Node</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.id} className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-soft hover:shadow-2xl transition-all">
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-primary/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-primary italic">
                                            Niveau {course.level}
                                        </div>
                                        <Clock className="h-4 w-4 text-foreground/20" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight mb-3 uppercase italic leading-tight">{course.title}</h3>
                                    <p className="text-sm text-foreground/40 font-medium leading-relaxed mb-8 line-clamp-2 italic">
                                        {course.description}
                                    </p>
                                    <Button onClick={handleAction} className="w-full rounded-xl h-12 text-[10px] font-black uppercase tracking-widest italic shadow-lg shadow-primary/10">
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5️⃣ FINAL CTA SECTION */}
            <section className="py-20 lg:py-32 px-6 bg-white">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="font-display text-4xl lg:text-6xl font-black tracking-tighter italic uppercase mb-8 leading-[0.9]">Start Your Learning <br /> Journey Today</h2>
                        <p className="text-lg text-foreground/50 font-medium mb-12 italic max-w-lg mx-auto">“Bienvenue to your future in French.” Access expert guidance and unlock new opportunities.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link to="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-16 px-12 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all">
                                    Create Account
                                </Button>
                            </Link>
                            <Button onClick={handleAction} size="lg" variant="outline" className="w-full sm:w-auto h-16 px-12 rounded-2xl border-2 font-black italic uppercase tracking-widest text-xs hover:bg-slate-50">
                                Book Your First Class
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer Footprint */}
            <footer className="py-12 border-t bg-slate-50">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">© 2026 CLASSE FRANÇAISE. SYSTEM ACTIVE.</p>
                    <div className="flex gap-8">
                        <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors italic">Privacy</Link>
                        <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-colors italic">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
