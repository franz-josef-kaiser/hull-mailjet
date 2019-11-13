import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { SKIP_REASON_BATCH } from "../../../src/core/constants";


const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check logged metrics
    // tslint:disable-next-line:no-console
    expect(ctx.metric.increment.mock.calls).toHaveLength(apiResponses.length); // Total number of api calls

    // Check no traits call
    expect((ctx.client as any).traits.mock.calls).toHaveLength(0); // 0 calls to Hull
    
    // Verify skip debug log with appropriate reason
    expect((ctx.client.logger.debug as any).mock.calls).toHaveLength(0);
};

export default setupExpectations;