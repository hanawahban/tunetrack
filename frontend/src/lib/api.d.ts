export declare const auth: {
    getToken: () => string | null;
    setToken: (token: string) => void;
    clearToken: () => void;
};
export declare class ApiError extends Error {
    status: number;
    constructor(message: string, status: number);
}
export type Role = "ADMIN" | "CURATOR" | "LISTENER";
export type User = {
    id: number;
    email: string;
    role: Role;
    createdAt: string;
};
export type Artist = {
    id: number;
    name: string;
    createdAt: string;
};
export type Album = {
    id: number;
    title: string;
    releaseYear: number | null;
    artistId: number;
    createdAt: string;
    artist?: Artist;
};
export declare const api: {
    register: (email: string, password: string) => Promise<User>;
    login: (email: string, password: string) => Promise<{
        access_token: string;
    }>;
    artists: () => Promise<Artist[]>;
    albums: () => Promise<Album[]>;
};
