export interface ExampleType {
    id: number;
    name: string;
    description?: string;
}

export type ExampleList = ExampleType[];

export interface ApiResponse<T> {
    data: T;
    message: string;
    status: number;
}