import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { STATUS_NOAUTHN_APISECRETKEY } from "../../../src/core/constants";


const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check logged metrics
    // tslint:disable-next-line:no-console
    expect(ctx.metric.increment.mock.calls).toHaveLength(apiResponses.length); // Total number of api calls

    // Check no traits call
    expect((ctx.client as any).traits.mock.calls).toHaveLength(0); // 0 calls to Hull
    
    // Verify that put is called
    expect((ctx.client as any).put.mock.calls).toHaveLength(1);
    expect((ctx.client as any).put.mock.calls[0]).toEqual([
        `${ctx.connector.id}/status`,
        { status: "setupRequired", messages: [
            STATUS_NOAUTHN_APISECRETKEY
        ]}
    ]);
};

export default setupExpectations;