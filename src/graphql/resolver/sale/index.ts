import { get } from 'lodash';
import { createError } from 'apollo-errors';

import { container } from '../../../di';
import { TYPES } from '../../../di/types';
import IOAuth2 from '../../../service/oauth2';
import IUserService from '../../../service/user';
import IProductService from '../../../service/product';
import ISaleService from '../../../service/sale';

import { Sale } from '../../../entity/sale';

const oAuth2Controller: IOAuth2 = container.get<IOAuth2>(TYPES.OAuth2Controller);
const userController: IUserService = container.get<IUserService>(TYPES.UserController);
const productController: IProductService = container.get<IProductService>(TYPES.ProductController);
const saleController: ISaleService = container.get<ISaleService>(TYPES.SaleController);

const subscriptionTopics = {
  post: 'SALE_POSTED'
};

export default {
  Query: {
    sales: async (parent: any, args: any, context: any, info: any) => {
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        return await saleController.fetch();
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  },
  Mutation: {
    postSale: async (parent: any, args: any, context: any, info: any) => {
      const newSale: Sale = new Sale(get(args, 'sale'));
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        await saleController.create(newSale);
        context.pubsub.publish(subscriptionTopics.post, { salePosted: newSale });
        return newSale;
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  },
  Subscription: {
    salePosted: {
      subscribe: async (parent: any, args: any, context: any, info: any) => {
        try {
          await oAuth2Controller.validateAccessToken(get(args, 'token') || '');
          return context.pubsub.asyncIterator(subscriptionTopics.post);
        } catch (error) {
          throw new (createError(error.statusCode, { message: error.status }))({ data: error });
        }
      }
    }
  },
  Sale: {
    user: async (sale: Sale, args: any, context: any, info: any) => {
      try {
        return await userController.fetchOne(get(sale, 'userEmail'));
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    },
    product: async (sale: Sale, args: any, context: any, info: any) => {
      try {
        return await productController.fetchOne(get(sale, 'productCode'));
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  }
};