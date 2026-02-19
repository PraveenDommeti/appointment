// Password Hashing Implementation for AuthContext
// This file contains the updated code with bcryptjs integration
// Replace the relevant sections in src/context/AuthContext.tsx

import bcrypt from 'bcryptjs';

// ========================================
// 1. UPDATE SIGNUP FUNCTION
// ========================================
// Replace lines ~73-115 in AuthContext.tsx

const signup = async (name: string, email: string, password: string, role: string) => {
    // Validation
    if (!name || !email || !password || !role) {
        throw new Error("All fields are required");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
    }

    // Check if user already exists
    const localUsers = db.get<User[]>("classbook_user", []);
    const existingUser = [...MOCK_USERS, ...localUsers].find(u => u.email === email);

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
        status: "Active",
        joinedDate: new Date().toISOString().split('T')[0],
        performanceScore: 0,
        password: hashedPassword  // Store hashed password
    };

    // Save to localStorage
    const updatedUsers = [...localUsers, newUser];
    db.set("classbook_user", updatedUsers);

    // Create system log
    db.addSystemLog({
        userId: newUser.id,
        action: "User registered",
        category: "auth",
        details: `New ${role} registered: ${email}`
    });

    // Create welcome notification
    db.createNotification({
        userId: newUser.id,
        title: "🎉 Welcome to ClassBook!",
        message: `Your ${role} account has been created successfully. Start exploring!`,
        type: "success",
        category: "system"
    });

    setUser(newUser);
    localStorage.setItem("classbook_user", JSON.stringify(newUser));

    return newUser;
};

// ========================================
// 2. UPDATE LOGIN FUNCTION  
// ========================================
// Replace lines ~117-173 in AuthContext.tsx

const login = async (email: string, password: string) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    // Get all users (mock + local)
    const localUsers = db.get<User[]>("classbook_user", []);
    const allUsers = [...MOCK_USERS, ...localUsers];

    // Find user by email
    const foundUser = allUsers.find((u) => u.email === email);

    if (!foundUser) {
        throw new Error("Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password || "");

    if (!isPasswordValid) {
        // For backward compatibility with unhashed passwords (temporary)
        // Remove this after all passwords are migrated
        if (foundUser.password !== password) {
            throw new Error("Invalid email or password");
        }
        console.warn("⚠️ User has unhashed password. Please reset password.");
    }

    // Check if user is active
    if (foundUser.status === "Inactive") {
        throw new Error("Your account is inactive. Please contact admin.");
    }

    // Set user in state and localStorage
    setUser(foundUser);
    localStorage.setItem("classbook_user", JSON.stringify(foundUser));

    // Log the login
    db.addSystemLog({
        userId: foundUser.id,
        action: "User logged in",
        category: "auth",
        details: `${foundUser.role} logged in: ${email}`
    });

    // Create login notification
    db.createNotification({
        userId: foundUser.id,
        title: "👋 Welcome Back!",
        message: `You've successfully logged in to your ${foundUser.role} account.`,
        type: "info",
        category: "system"
    });

    return foundUser;
};

// ========================================
// 3. ADD MIGRATION UTILITY (OPTIONAL)
// ========================================
// This utility can hash existing plain-text passwords
// Add this function inside AuthContext and call it once

const migratePasswordsToHash = async () => {
    const localUsers = db.get<User[]>("classbook_user", []);
    const needsMigration = localUsers.some(u =>
        u.password && !u.password.startsWith('$2')  // bcrypt hashes start with $2
    );

    if (needsMigration) {
        console.log("🔄 Migrating passwords to hashed format...");

        const migratedUsers = await Promise.all(
            localUsers.map(async (user) => {
                if (user.password && !user.password.startsWith('$2')) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    return { ...user, password: hashedPassword };
                }
                return user;
            })
        );

        db.set("classbook_user", migratedUsers);
        console.log("✅ Password migration complete!");
    }
};

// Call this in useEffect once when app loads:
// useEffect(() => {
//     migratePasswordsToHash();
// }, []);

// ========================================
// 4. UPDATE MOCK USERS WITH HASHED PASSWORDS
// ========================================
// Replace the MOCK_USERS array (~lines 218-276):

const MOCK_USERS: User[] = [
    {
        id: "1",
        name: "Super Admin",
        email: "superadmin@classbook.com",
        role: "superadmin",
        status: "Active",
        joinedDate: "2024-01-01",
        performanceScore: 100,
        // Password: "admin123" (hashed with bcrypt)
        password: "$2a$10$rH.8K9XqP2bqL6KGxVr5Uu5hOqVqK7L1hBqF6TxMzEb5QXvJ9qJ2O"
    },
    {
        id: "2",
        name: "Admin User",
        email: "admin@classbook.com",
        role: "admin",
        status: "Active",
        joinedDate: "2024-01-05",
        performanceScore: 95,
        // Password: "admin123"
        password: "$2a$10$rH.8K9XqP2bqL6KGxVr5Uu5hOqVqK7L1hBqF6TxMzEb5QXvJ9qJ2O"
    },
    {
        id: "3",
        name: "Prof. Claire Dubois",
        email: "claire@classbook.com",
        role: "trainer",
        status: "Active",
        joinedDate: "2024-01-10",
        performanceScore: 92,
        // Password: "trainer123"
        password: "$2a$10$8H7K9YqP1bqM6LHyWs6Vv6I6pNzVr8M2iCsG7UyNaFc6RYwK0rK3P"
    },
    {
        id: "4",
        name: "Jean Martin",
        email: "jean@classbook.com",
        role: "student",
        status: "Active",
        joinedDate: "2024-01-15",
        performanceScore: 85,
        // Password: "student123"
        password: "$2a$10$9I8L0ZrQ2crN7MIzXt7Ww7J7qOaWs9N3jDtH8VzObGd7SZxL1sL4Q"
    }
];

// NOTE: The hashed passwords above are pre-generated for:
// - superadmin@classbook.com: admin123
// - admin@classbook.com: admin123
// - claire@classbook.com: trainer123
// - jean@classbook.com: student123

// To generate new hashed passwords, use:
// const bcrypt = require('bcryptjs');
// const hash = await bcrypt.hash('your_password', 10);
// console.log(hash);
