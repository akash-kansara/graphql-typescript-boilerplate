import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './type';
import resolvers from './resolver';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});

export default schema;