export type MailJetDatatype = "str" | "int" | "float" | "bool" | "datetime";

export interface IMailjetPagedResult<T> {
    Count: number;
    Data: T[];
    Total: number;
}

export interface IMailjetContactProperty {
    Datatype: MailJetDatatype;
    ID: number;
    Name: string;
    NameSpace: string;
}

export interface IMailjetContactList {
    IsDeleted: boolean;
    Name: string;
    Address?: string;
    CreatedAt?: string;
    ID: number;
    SubscriberCount: number;
}

export interface IMailjetContact {
    IsExcludedFromCampaigns: boolean;
    Name: string;
    CreatedAt: string;
    DeliveredCount: number;
    Email: string;
    ExclusionFromCampaignsUpdatedAt: string;
    ID: number;
    IsOptInPending: boolean;
    IsSpamComplaining: boolean;
    LastActivityAt: string;
    LastUpdateAt: string;
}
export interface IMailjetContactUpdate {
    IsExcludedFromCampaigns: boolean;
    Name: string;
}

export interface IMailjetContactCreate extends IMailjetContactUpdate {
    Email: string;
}



export interface IMailjetContactDataEntry {
    Name: string;
    Value: string | number | boolean;
}

export interface IMailjetContactData {
    ContactID: number;
    ID: number;
    Data: IMailjetContactDataEntry[];
}