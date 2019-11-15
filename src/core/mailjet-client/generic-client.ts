import _ from "lodash";
import axios, { AxiosRequestConfig, AxiosBasicCredentials, AxiosError } from "axios";
import IApiResultObject, { ApiResultObjectMethod } from "../../types/api-result";

export class GenericClient {
    private _authCredentials: AxiosBasicCredentials;

    constructor(authCredentials: AxiosBasicCredentials) {
        this._authCredentials = authCredentials;
    }

    public async executeQuery<T, U>(url: string): Promise<IApiResultObject<T, U>> {
        const method: ApiResultObjectMethod = "query";
        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.get(url, axiosConfig);
        
            const apiResult: IApiResultObject<T, U> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record: undefined,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<T, U> = 
                this.createApiErrorResult<T, U>(url, method, axiosError);

            return apiResult;
        }
    }

    public async executeInsert<T, U>(url: string, record: U): Promise<IApiResultObject<T, U>> {
        const method: ApiResultObjectMethod = "insert";
        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.post(url, record, axiosConfig);
        
            const apiResult: IApiResultObject<T, U> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<T, U> = 
                this.createApiErrorResult<T, U>(url, method, axiosError);

            return apiResult;
        }
    }

    public async executeUpdate<T, U>(url: string, record: U): Promise<IApiResultObject<T, U>> {
        const method: ApiResultObjectMethod = "update";
        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.put(url, record, axiosConfig);
        
            const apiResult: IApiResultObject<T, U> = {
                data: axiosResponse.data,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<T, U> = 
                this.createApiErrorResult<T, U>(url, method, axiosError);

            return apiResult;
        }
    }

    public async executeDelete<T, U>(url: string, record: U, dataOnSuccess: T): Promise<IApiResultObject<T, U>> {
        const method: ApiResultObjectMethod = "delete";
        const axiosConfig: AxiosRequestConfig = this.createAxiosRequestConfig();

        try {
            const axiosResponse = await axios.delete(url, axiosConfig);
        
            const apiResult: IApiResultObject<T, U> = {
                data: dataOnSuccess,
                endpoint: url,
                error: undefined,
                method,
                record,
                success: axiosResponse.status < 400
            };

            return apiResult;
        } catch (error) {
            const axiosError = error as AxiosError;

            const apiResult: IApiResultObject<T, U> = 
                this.createApiErrorResult<T, U>(url, method, axiosError);

            return apiResult;
        }

    }

    private createApiErrorResult<T, U>(url: string, method: ApiResultObjectMethod, error: AxiosError, record?: T): IApiResultObject<T, U> {
        const axiosResponse = error.response;

        const apiResult: IApiResultObject<T, U> = {
            data: undefined,
            endpoint: url,
            error: error.message,
            method,
            record,
            success: false
        };

        if (axiosResponse !== undefined) {
            apiResult.data = axiosResponse.data;
            apiResult.error = _.filter([ 
                error.message, 
                axiosResponse.statusText,
                _.get(axiosResponse, "data.ErrorMessage", undefined) 
            ], (val) => { 
                return !_.isNil(val);
            });
        }

        return apiResult;
    }

    private createAxiosRequestConfig(): AxiosRequestConfig {
        return {
            auth: this._authCredentials,
            responseType: "json"
        };
    }

}

export default GenericClient;