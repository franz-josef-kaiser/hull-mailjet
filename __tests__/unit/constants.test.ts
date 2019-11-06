import { MJ_ATTRIBUTE_DEFAULT_NAME, MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS } from "../../src/core/constants";

describe("Constants", () => {
    test('should pass smoke test', () => {
        expect(true).toBeTruthy();
    });

    test('should have constant for Mailjet Default Property Name set to "Name (*)"', () => {
        expect(MJ_ATTRIBUTE_DEFAULT_NAME).toEqual("Name (*)");
    });

    test('should have constant for Mailjet Default Property IsExcludedFromCampaigns set to "Is Excluded From Campaigns"', () => {
        expect(MJ_ATTRIBUTE_DEFAULT_ISEXCLUDEDFROMCAMPAIGNS).toEqual("Is Excluded From Campaigns");
    });
});