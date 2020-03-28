import { get } from 'lodash';
import { createError } from 'apollo-errors';

import { container } from '../../../di';
import { TYPES } from '../../../di/types';
import IOAuth2 from '../../../service/oauth2';
import IProductService from '../../../service/product';

import { Product } from '../../../entity/product';

const oAuth2Controller: IOAuth2 = container.get<IOAuth2>(TYPES.OAuth2Controller);
const productController: IProductService = container.get<IProductService>(TYPES.ProductController);

export default {
  Query: {
    product: async (parent: any, args: any, context: any, info: any) => {
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        return await productController.fetchOne(args.code);
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    },
    products: async (parent: any, args: any, context: any, info: any) => {
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        return await productController.fetch();
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  },
  Mutation: {
    createProduct: async (parent: any, args: any, context: any, info: any) => {
      const newProduct: Product = new Product(get(args, 'product'));
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        await productController.create(newProduct);
        return newProduct;
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    },
    updateProduct: async (parent: any, args: any, context: any, info: any) => {
      const updateProduct: Product = new Product(get(args, 'product'));
      try {
        await oAuth2Controller.validateAccessToken(get(context, 'token') || '');
        await productController.update(updateProduct);
        return updateProduct;
      } catch (error) {
        throw new (createError(error.statusCode, { message: error.status }))({ data: error });
      }
    }
  },
  Product: { }
};