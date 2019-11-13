import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { CONCONF_SUBACCOUNT_SLUG, MJ_IDENT1_EMAIL, MJ_IDENT1_ID, HULL_USER_NAME0, HULL_USER_JOBTITLE1, MJ_LISTRECIPS1 } from "../../_helpers/constants";


const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check logged metrics
    // tslint:disable-next-line:no-console
    expect(ctx.metric.increment.mock.calls).toHaveLength(apiResponses.length); // Total number of api calls
    expect(ctx.metric.increment).toBeCalledWith("ship.service_api.call", 1);
    // Check debug logs for API results
    expect((ctx.client.logger.debug as any).mock.calls).toHaveLength(_.filter(apiResponses, { success: true }).length); // Successful API calls only
    for (let index = 0; index < _.filter(apiResponses, { success: true}).length; index++) {
        const element = _.filter(apiResponses, { success: true })[index];
        expect((ctx.client.logger.debug as any).mock.calls[index]).toEqual([
            "outgoing.user.success",
            element
        ]);
    }
    // Check error logs for API results
    expect((ctx.client.logger.error as any).mock.calls).toHaveLength(_.filter(apiResponses, { success: false }).length); // Failed API calls only
    
    for (let index = 0; index < _.filter(apiResponses, { success: false }).length; index++) {
        const element = _.filter(apiResponses, { success: false })[index];
        expect((ctx.client.logger.error as any).mock.calls[index]).toEqual([
            "outgoing.user.error",
            element
        ]);
    }
    // Check traits call
    expect((ctx.client as any).traits.mock.calls).toHaveLength(1); // 1 call to Hull
    const expectedAttribs = {};
    _.set(expectedAttribs, "name", { value: HULL_USER_NAME0, operation: "setIfNull" });
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/name`, HULL_USER_NAME0);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/email`, MJ_IDENT1_EMAIL);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/id`, MJ_IDENT1_ID);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/created_at`, "2019-06-25T10:52:30Z");
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/delivered_count`, 0);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/exclusion_from_campaigns_updated_at`, "");
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/is_excluded_from_campaigns`, false);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/is_opt_in_pending`, false);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/is_spam_complaining`, false);
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/last_activity_at`, "2019-06-25T10:52:30Z");
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/last_update_at`, "2019-06-25T10:52:30Z");
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/unsubscribed_at`, "");
    _.set(expectedAttribs, `mailjet_${CONCONF_SUBACCOUNT_SLUG.toLowerCase()}/unsubscribed_by`, "");

    expect((ctx.client as any).traits.mock.calls[0]).toContainEqual(expectedAttribs);
};

export default setupExpectations;