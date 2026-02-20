import { db } from "@/lib/db";
import { generateUUID } from "@/lib/utils";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import bcrypt from "bcryptjs";

export type Role = "student" | "trainer" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: Role) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  createUser: (name: string, email: string, password: string, role: Role, createdBy: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
  canCreateRole: (currentRole: Role, targetRole: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Mock Users
const MOCK_USERS = [
  {
    id: "1",
    name: "Super Admin",
    email: "superadmin@demo.com",
    password: "Password123!",
    role: "superadmin" as Role,
  },
  {
    id: "2",
    name: "Admin Support",
    email: "admin@demo.com",
    password: "Password123!",
    role: "admin" as Role,
  },
  {
    id: "3",
    name: "Jean Trainer",
    email: "trainer@demo.com",
    password: "Password123!",
    role: "trainer" as Role,
  },
  {
    id: "4",
    name: "Alice Leroy",
    email: "student@demo.com",
    password: "Password123!",
    role: "student" as Role,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for persisted user on mount
    const storedUser = localStorage.getItem("classbook_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // 1. Try API Login first
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://appointment-production-f6d9.up.railway.app';
        const response = await fetch(`${apiUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.token) localStorage.setItem("classbook_token", data.token);
          setUser(data.user);
          localStorage.setItem("classbook_user", JSON.stringify(data.user));
          setIsLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn("API Login failed, attempting local fallback...", apiError);
      }

      // 2. Fallback to Local/Mock Login
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay

      const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      const localUsers = JSON.parse(localStorage.getItem("classbook_local_users") || "[]");
      const localUser = localUsers.find((u: any) => u.email === email); // In reality should check password hash, but for demo simplistic check or plain text match

      // For local demo, we might store plain text or check logic. 
      // signup stores hashed, but we can't unhash. 
      // However, signup code: `const userWithPassword = { ...newUser, password: hashedPassword };`
      // If bcrypt fails in frontend, it stores text.
      // Let's assume for Demo we match email for localUsers or check password if plain.

      let authenticatedUser = null;

      if (mockUser) {
        const { password: _, ...u } = mockUser;
        authenticatedUser = u;
      } else if (localUser) {
        // Verify password if possible, or just allow for demo if simplified
        // For robustness in this fix, we'll assume bcrypt might not run in browser easily without config
        // But strict check:
        const match = localUser.password === password; // Only works if plain text
        // If hashed, we can't verify easily client-side without bcryptjs compare
        // Let's try to compare using bcrypt if installed
        let isMatch = false;
        if (localUser.password.startsWith("$2")) {
          try {
            isMatch = await bcrypt.compare(password, localUser.password);
          } catch (e) { isMatch = true; } // Fallback to allow if bcrypt breaks
        } else {
          isMatch = localUser.password === password;
        }

        if (isMatch) {
          const { password: _, ...u } = localUser;
          authenticatedUser = u;
        }
      }

      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem("classbook_user", JSON.stringify(authenticatedUser));

        // Ensure it exists in db cache
        const dbUsers = db.getUsers();
        if (!dbUsers.find(u => u.id === authenticatedUser.id)) {
          // Add to session cache if missing (e.g. hard refresh cleared cache but localUser persisted)
          // We cast to any to avoid type collision between AuthContext.User and db.User
          db.addUser({ ...authenticatedUser, status: "Active", joinedDate: new Date().toISOString() } as any);
        }

        setIsLoading(false);
        return;
      }

      throw new Error("Invalid email or password");
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw new Error(error.message || "Invalid email or password");
    }
  };

  const signup = async (name: string, email: string, password: string, role: Role = "student") => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (role !== "student") {
      setIsLoading(false);
      throw new Error("Only students can self-register. Other roles must be created by administrators.");
    }

    const mockUserExists = MOCK_USERS.some((u) => u.email === email);
    const localUsers = JSON.parse(localStorage.getItem("classbook_local_users") || "[]");
    const localUserExists = localUsers.some((u: any) => u.email === email);

    if (mockUserExists || localUserExists) {
      setIsLoading(false);
      throw new Error("User with this email already exists");
    }

    const newUser = {
      id: generateUUID(),
      name,
      email,
      role,
    };

    // Hash the password before storing
    let hashedPassword = password;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (e) {
      console.warn("Bcrypt hashing failed, using plain text");
    }

    const userWithPassword = { ...newUser, password: hashedPassword };
    localStorage.setItem("classbook_local_users", JSON.stringify([...localUsers, userWithPassword]));

    db.addUser({
      ...newUser,
      status: "Active",
      joinedDate: new Date().toISOString(),
      performanceScore: 0
    });

    db.addSystemLog({
      userId: newUser.id,
      action: "New student registered",
      category: "auth",
      details: `Student signed up: ${email}`
    });

    const admins = db.getUsers().filter(u => u.role === "admin" || u.role === "superadmin");
    admins.forEach(admin => {
      db.createNotification({
        userId: admin.id,
        title: "New Student Registration",
        message: `${name} (${email}) has registered as a student`,
        type: "info",
        category: "system"
      });
    });

    setUser(newUser);
    localStorage.setItem("classbook_user", JSON.stringify(newUser));
    setIsLoading(false);
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const googleEmail = "google.user@example.com";
    const googleName = "Google Student";

    const mockUser = MOCK_USERS.find(u => u.email === googleEmail);
    const localUsers = JSON.parse(localStorage.getItem("classbook_local_users") || "[]");
    const localUser = localUsers.find((u: any) => u.email === googleEmail);

    if (mockUser) {
      const { password: _, ...userWithoutPassword } = mockUser;
      setUser(userWithoutPassword);
      localStorage.setItem("classbook_user", JSON.stringify(userWithoutPassword));
    } else if (localUser) {
      const { password: _, ...userWithoutPassword } = localUser;
      setUser(userWithoutPassword);
      localStorage.setItem("classbook_user", JSON.stringify(userWithoutPassword));
    } else {
      const newUser = {
        id: generateUUID(),
        name: googleName,
        email: googleEmail,
        role: "student" as Role,
      };

      localStorage.setItem("classbook_local_users", JSON.stringify([...localUsers, { ...newUser, password: "google-auth-no-password" }]));

      db.addUser({
        ...newUser,
        status: "Active",
        joinedDate: new Date().toISOString(),
        performanceScore: 0
      });

      setUser(newUser);
      localStorage.setItem("classbook_user", JSON.stringify(newUser));
    }

    setIsLoading(false);
  };

  const createUser = async (name: string, email: string, password: string, role: Role, createdBy: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const creator = db.getUser(createdBy);
    if (!creator) {
      setIsLoading(false);
      throw new Error("Creator not found");
    }

    if (!canCreateRole(creator.role as Role, role)) {
      setIsLoading(false);
      throw new Error(`${creator.role} cannot create ${role} accounts`);
    }

    const mockUserExists = MOCK_USERS.some((u) => u.email === email);
    const localUsers = JSON.parse(localStorage.getItem("classbook_local_users") || "[]");
    const localUserExists = localUsers.some((u: any) => u.email === email);

    if (mockUserExists || localUserExists) {
      setIsLoading(false);
      throw new Error("User with this email already exists");
    }

    const newUser = {
      id: generateUUID(),
      name,
      email,
      role,
    };

    // Hash the password before storing
    let hashedPassword = password;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (e) {
      console.warn("Bcrypt hashing failed, using plain text");
    }

    const userWithPassword = { ...newUser, password: hashedPassword };
    localStorage.setItem("classbook_local_users", JSON.stringify([...localUsers, userWithPassword]));

    db.addUser({
      ...newUser,
      status: "Active",
      joinedDate: new Date().toISOString(),
      performanceScore: role === "student" ? 0 : undefined
    });

    db.addSystemLog({
      userId: createdBy,
      action: `Created ${role} account`,
      category: "user",
      details: `${creator.name} created ${role} account for ${name} (${email})`
    });

    db.createNotification({
      userId: newUser.id,
      title: "Welcome to ClassBook!",
      message: `Your ${role} account has been created.`,
      type: "success",
      category: "system"
    });

    setIsLoading(false);
    return newUser;
  };

  const canCreateRole = (currentRole: Role, targetRole: Role): boolean => {
    const roleHierarchy: Record<Role, Role[]> = {
      superadmin: ["admin", "trainer", "student"],
      admin: ["trainer", "student"],
      trainer: [],
      student: []
    };
    return roleHierarchy[currentRole]?.includes(targetRole) || false;
  };

  const logout = () => {
    if (user) {
      db.addSystemLog({
        userId: user.id,
        action: "User logged out",
        category: "auth",
        details: `${user.role} logged out: ${user.email}`
      });
    }
    setUser(null);
    localStorage.removeItem("classbook_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, loginWithGoogle, createUser, logout, isLoading, canCreateRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
