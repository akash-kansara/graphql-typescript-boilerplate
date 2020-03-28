import { mergeTypes } from 'merge-graphql-schemas';

import auth from './auth';
import user from './user';
import product from './product';
import sale from './sale';

const typeDefs = [auth, user, product, sale];

export default mergeTypes(typeDefs, { all: true });