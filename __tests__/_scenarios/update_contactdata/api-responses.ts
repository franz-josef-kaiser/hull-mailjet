import nock from "nock";
import { Url } from "url";

const setupApiMockResponses = (nockFn: (basePath: string | RegExp | Url, options?: nock.Options | undefined) => nock.Scope) => {
    // TODO: Add nock
};

export default setupApiMockResponses;