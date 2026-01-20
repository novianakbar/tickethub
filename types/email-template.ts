export interface EmailTemplate {
    id: string;
    name: string;
    alias: string;
    subject: string;
    content: string;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateEmailTemplateRequest {
    name: string;
    alias: string;
    subject: string;
    content: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateEmailTemplateRequest {
    name?: string;
    alias?: string;
    subject?: string;
    content?: string;
    description?: string;
    isActive?: boolean;
}
