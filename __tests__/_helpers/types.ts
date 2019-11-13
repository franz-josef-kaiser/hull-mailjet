export interface IApiResponseNocked {
    data: any;
    endpoint: string;
    method: "query" | "insert" | "update" | "delete";
    record: any;
    success: boolean;
    error?: string | string[];
}