import './env';
import './di';

import { GraphQLServer, PubSub, Options } from 'graphql-yoga';
import { formatError } from 'apollo-errors';
import { get } from 'lodash';

import { container } from './di';
import { TYPES } from './di/types';
import IRepository from './core/repository/definition';

import eventHandler from './event';
import securityMiddleware from './middleware/security';
import coreMiddleware from './middleware';
import errorHandlerMiddleware from './error-handler';
import schema from './graphql';

const pubsub = new PubSub();
const repository: IRepository = container.get<IRepository>(TYPES.IRepository);

const options: Options = {
  port: process.env['NODE_PORT'] || process.env['APP.PORT'],
  endpoint: '/graphql',
  subscriptions: '/subscriptions',
  playground: '/playground',
  formatError,
  defaultPlaygroundQuery: 'query { users { firstname lastname fullname email dob } }'
};

const server = new GraphQLServer({
  schema,
  context: async ({ request, response }) => {
    const token = get(request, 'headers.bearer') || '';
    return { token, request, response, pubsub };
  }
});

server.express.use(securityMiddleware);
server.express.use(coreMiddleware);
server.express.use(errorHandlerMiddleware);

server.start(options, ({ port }) => {
  eventHandler.emit('sys-info', `GraphQL server started at ${port}.`);
});

const closeApp = async () => {
  try { await repository.disconnect(); } catch (err) { }
  eventHandler.emit('sys-info', 'Shutting down app.');
  process.exit(0);
};

process.on('SIGINT', () => { closeApp(); });
process.on('SIGTERM', () => { closeApp(); });

export default server.express;