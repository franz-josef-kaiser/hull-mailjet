export type ApiResultObjectMethod = "query" | "insert" | "update" | "delete";

export interface IApiResultGenericBodyWithMessage {
  message: string;
}

export default interface IApiResultObject<T, U> {
    endpoint: string;
    method: ApiResultObjectMethod;
    record: T | U | undefined;
    data: any;
    success: boolean;
    error?: string | string[];
  }