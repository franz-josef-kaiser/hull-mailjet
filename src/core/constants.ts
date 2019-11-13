export const MJ_ATTRIBUTE_DEFAULT_NAME = "Name (*)";
export const MJ_ATTRIBUTE_DEFAULT_NAME_VAL = "Name__d";
export const MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS = "Is Excluded From Campaigns";
export const MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL = "IsExcludedFromCampaigns__d";

export const MJ_EVENT_MAPPING = {
    open: "Email Opened",
    click: "Email Link Clicked",
    bounce: "Email Bounced",
    spam: "Email Marked as Spam",
    blocked: "Blocked",
    unsub: "List Unsubscribed",
    sent: "Email Sent"
};

export const SKIP_REASON_NOEMAIL = "User doesn't have an email address and cannot be synchronized with Mailjet.";
export const SKIP_REASON_BATCH = "Batch is not supported at the moment.";

export const STATUS_NOPRIVATESETTINGS = "Unable to load settings to determine connector status. Please contact support if that error persists.";
export const STATUS_NOAUTHN_APIKEY = "Missing credentials: The field 'API Key' in Settings is empty.";
export const STATUS_NOAUTHN_APISECRETKEY = "Missing credentials: The field 'API Secret Key' in Settings is empty.";

export const ERROR_INCOMING_EVENT_UNKNOWN = "Unknown event. The event received is not supported by the connector.";