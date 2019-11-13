import _ from "lodash";
import { ContextMock } from "../../_helpers/mocks";
import { IApiResponseNocked } from "../../_helpers/types";
import { SKIP_REASON_BATCH } from "../../../src/core/constants";


const setupExpectations = (ctx: ContextMock, apiResponses: IApiResponseNocked[]) => {
    // Check no traits call
    expect((ctx.client as any).traits.mock.calls).toHaveLength(0); // 0 calls to Hull
    
    // Verify skip debug log with appropriate reason
    expect((ctx.client.logger.error as any).mock.calls).toHaveLength(1);
    expect((ctx.client.logger.error as any).mock.calls[0]).toEqual([
        "outgoing.user.error",
        { 
            "errorMessage": "Cannot read property 'increment' of null",
            "errorName": "TypeError" 
        }
    ]);
    
};

export default setupExpectations;