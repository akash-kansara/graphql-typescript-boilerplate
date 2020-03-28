import { get } from 'lodash';
import { createError } from 'apollo-errors';

import { container } from '../../../di';
import { TYPES } from '../../../di/types';
import IOAuth2 from '../../../service/oauth2';
import IUserService from '../../../service/user';

import { User } from '../../../entity/user';

const oAuth2Controller: IOAuth2 = container.get<IOAuth2>(TYPES.OAuth2Controller);
const userController: IUserService = container.get<IUserService>(TYPES.UserController);

export default {
  Query: {
    user: async (parent: any, args: any, context: any, info: any) => {
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        return await userController.fetchOne(get(args, 'email'));
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    },
    users: async (parent: any, args: any, context: any, info: any) => {
      // context.response.statusCode = 500;
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        return await userController.fetch();
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  },
  Mutation: {
    createUser: async (parent: any, args: any, context: any, info: any) => {
      const newUser: User = new User(get(args, 'user'));
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        await userController.create(newUser);
        return newUser;
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    },
    updateUser: async (parent: any, args: any, context: any, info: any) => {
      const updateUser: User = new User(get(args, 'user'));
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        await userController.update(updateUser);
        return updateUser;
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  },
  User: {
    fullname: (user: any, args: any, context: any, info: any) => {
      return `${get(user, 'firstname')} ${get(user, 'lastname')}`;
    }
  }
}