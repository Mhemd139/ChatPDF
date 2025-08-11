export interface GoogleUserInfo {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    email_verified: boolean;
}
export declare class GoogleAuthService {
    static verifyIdToken(idToken: string): Promise<GoogleUserInfo>;
    static authenticateWithGoogle(idToken: string): Promise<{
        user: any;
        token: string;
        isNewUser: boolean;
    }>;
    static getUserByToken(token: string): Promise<any>;
}
//# sourceMappingURL=googleAuthService.d.ts.map