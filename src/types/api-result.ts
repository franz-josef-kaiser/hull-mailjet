export default interface IApiResultObject<T, U> {
    endpoint: string;
    method: "query" | "insert" | "update" | "delete";
    record: T | U | undefined;
    data: any;
    success: boolean;
    error?: string | string[];
  }