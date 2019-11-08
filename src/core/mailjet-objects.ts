import IHullUserUpdateMessage from "../types/user-update-message";
import IHullAccountUpdateMessage from "../types/account-update-message";

export type MailJetDatatype = "str" | "int" | "float" | "bool" | "datetime";
export type MailJetContactListActionType = "addforce" | "addnoforce" | "remove" | "unsub";

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

export interface IMailjetContactDataUpdate {
    Data: IMailjetContactDataEntry[];
}

export interface IMailjetContactData extends IMailjetContactDataUpdate{
    ContactID: number;
    ID: number;
}

export interface IMailjetContactListMembership {
    IsActive: boolean;
    IsUnsub: boolean;
    ListID: number;
    SubscribedAt: string;
}

export interface IMailjetContactListAction {
    ListID: number;
    Action: MailJetContactListActionType;
}

export interface IMailjetContactListCrud {
    ContactsLists: IMailjetContactListAction[];
}

export interface IMailjetListRecipient {
    IsUnsubscribed: boolean;
    ContactID: number;
    ID: number;
    ListID: number;
    ListName: string;
    SubscribedAt: string;
    UnsubscribedAt: string;
}

export interface IOperationEnvelope {
    msg: IHullUserUpdateMessage | IHullAccountUpdateMessage;
    serviceContactCreate?: IMailjetContactCreate;
    serviceContact?: IMailjetContact;
    serviceContactData?: IMailjetContactDataUpdate;
    serviceContactListActions?: IMailjetContactListCrud;
    serviceContactRecipients?: IMailjetListRecipient[];
    operation: "insert" | "update" | "skip";
    reason?: string;
}