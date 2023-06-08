export interface User {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePic?: string;
    status?: string;
    language?: string;
    accessToken?: string;
    isTFAEnable?: boolean;
}

export interface UpdatePassword {
    oldPassword: string;
    newPassword: string;
}

export interface HTMLInputEvent extends Event {
    target: HTMLInputElement & EventTarget;
}
