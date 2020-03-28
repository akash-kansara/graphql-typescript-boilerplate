import { mergeResolvers } from 'merge-graphql-schemas';

import auth from './auth';
import user from './user';
import product from './product';
import sale from './sale';

const resolvers = [auth, user, product, sale];

export default mergeResolvers(resolvers);