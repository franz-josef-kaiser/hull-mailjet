import nock from "nock";
import { Url } from "url";
import _ from "lodash";

import { IApiResponseNocked } from "../../_helpers/types";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope): IApiResponseNocked[] => {
    const apiResponses: IApiResponseNocked[] = [];
    return apiResponses;
};

export default setupApiMockResponses;