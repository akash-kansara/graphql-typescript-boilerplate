import { get } from 'lodash';
import { createError } from 'apollo-errors';

import { container } from '../../../di';
import { TYPES } from '../../../di/types';
import IBasicAuth from '../../../service/basic-auth';
import IOAuth2 from '../../../service/oauth2';

import { UserCredential } from '../../../entity/basic-auth';

const basicAuthController: IBasicAuth = container.get<IBasicAuth>(TYPES.BasicAuthController);
const oAuth2Controller: IOAuth2 = container.get<IOAuth2>(TYPES.OAuth2Controller);

export default {
  Mutation: {
    authenticate: async (parent: any, args: any, context: any, info: any) => {
      const cred: UserCredential = new UserCredential(get(args, 'credential.username'), get(args, 'credential.password'));
      try {
        // console.log(get(context, 'request.user'))
        await basicAuthController.authenticate(cred);
        const userObj = { username: get(args, 'credential.username') };
        return await oAuth2Controller.generate(userObj);
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    },
    refreshToken: async (parent: any, args: any, context: any, info: any) => {
      try {
        const refreshToken = get(args, 'refreshToken');
        return await oAuth2Controller.refresh(refreshToken);
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  }
}