export interface IMappingEntry {
    hull_field_name: string | undefined;
    service_field_name: string | undefined;
}

export interface ISegmentToContactListMappingEntry {
    service_list_id: number | undefined;
    hull_segment_id: string | undefined;
}

export default interface IPrivateSettings {
    api_key?: string;
    api_secret_key?: string;
    subaccount_slug?: string;
    contact_synchronized_segments: ISegmentToContactListMappingEntry[];
    contact_attributes_outbound: IMappingEntry[];
}