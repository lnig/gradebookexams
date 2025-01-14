import { UserType } from "../enums/userTypes";

export default interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userId: string;
    role: UserType;
}