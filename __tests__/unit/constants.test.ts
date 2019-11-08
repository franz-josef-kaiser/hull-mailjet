import { MJ_ATTRIBUTE_DEFAULT_NAME, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS, SKIP_REASON_NOEMAIL, MJ_ATTRIBUTE_DEFAULT_NAME_VAL, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL } from "../../src/core/constants";

describe("Constants", () => {
    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test('should have constant for Mailjet Default Property Name set to "Name (*)"', () => {
        expect(MJ_ATTRIBUTE_DEFAULT_NAME).toEqual("Name (*)");
    });

    test('should have constant for Mailjet Default Property Name Value set to "Name__d"', () => {
        expect(MJ_ATTRIBUTE_DEFAULT_NAME_VAL).toEqual("Name__d");
    });

    test('should have constant for Mailjet Default Property IsExcludedFromCampaigns set to "Is Excluded From Campaigns"', () => {
        expect(MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS).toEqual("Is Excluded From Campaigns");
    });

    test('should have constant for Mailjet Default Property IsExcludedFromCampaigns Value set to "IsExcludedFromCampaigns__d"', () => {
        expect(MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS_VAL).toEqual("IsExcludedFromCampaigns__d");
    });

    test('should have constant for skip reason no email set to "User doesn\'t have an email address and cannot be synchronized with Mailjet.""', () => {
        expect(SKIP_REASON_NOEMAIL).toEqual("User doesn't have an email address and cannot be synchronized with Mailjet.");
    });
});