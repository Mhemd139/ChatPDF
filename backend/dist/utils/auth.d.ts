import { User, UserResponse } from '../models/User';
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateToken: (userId: string, email: string) => string;
export declare const verifyToken: (token: string) => {
    userId: string;
    email: string;
} | null;
export declare const sanitizeUser: (user: User) => UserResponse;
//# sourceMappingURL=auth.d.ts.map