export declare class BlogPost {
    id: string;
    title: string;
    slug: string;
    category: string;
    authorName: string;
    summary: string;
    content: string;
    coverImageUrl: string;
    isPublished: boolean;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class BlogCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
