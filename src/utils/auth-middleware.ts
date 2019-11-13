import _ from "lodash";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import Hull from "hull";
import * as basicAuth from 'express-basic-auth'

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const orgId = _.get(req, "query.org", undefined);
    const authHandler:RequestHandler<ParamsDictionary> = basicAuth.default({
        authorizeAsync: true,
        authorizer: (user: string, password: string, authorize: (err: Error | null, authenticated: boolean) => void) => {
          if (user.length > 0 && password.length > 0 && orgId !== undefined) {
            try {
                // @ts-ignore
                const hull: any = new Hull({ 
                    id: user,
                    secret: password,
                    organization: orgId
                });
                hull.get("app")
                    .then((res2: any) => {
                        (req as any).hull = {
                            client: hull,
                            config: res2,
                            connector: res2,
                            ship: res2
                        };
                        authorize(null, true);
                    })  
                    .catch((_err: Error) => {;
                        authorize(null, false);
                    });  
            } catch {
                authorize(null, false);
            }
          } else {
            authorize(null, false);
          }
        }
    });
    authHandler(req, res, next);
};

export default authMiddleware;