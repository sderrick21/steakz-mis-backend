import { Request, Response } from 'express';
export declare const getAllUsers: (req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
export declare const adminCreateUser: (req: Request, res: Response) => Promise<void>;
export declare const adminUpdateUser: (req: Request, res: Response) => Promise<void>;
export declare const adminDeleteUser: (req: Request, res: Response) => Promise<void>;
