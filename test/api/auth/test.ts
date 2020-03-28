import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
chai.use(chaiHttp);

import server from '../../../src';

// Uncomment below line(s) to run this test file individually
// after((done) => { done(); process.exit(0); });

let tests = {
  correctCred: {
    username: 'root',
    password: 'root'
  },
  incorrectCred: {
    username: 'admin',
    password: 'root'
  }
}

let authRes;

describe('Authenticate and Authorize', () => {
  describe('Basic Auth', () => {
    it('it should authenticate successfuly', (done) => {
      chai.request(server)
        .post('/graphql')
        .set('content-type', 'application/graphql')
        .send(`
          mutation {
            authenticate(credential: {
              username: "${tests.correctCred.username}"
              password: "${tests.correctCred.password}"
            }) {
              accessToken
              refreshToken
            }
          }
        `)
        .end((err, res) => {
          authRes = res.body.data.authenticate;
          expect(res).to.have.status(200);
          expect(res.body.data.authenticate).to.have.property('accessToken');
          expect(res.body.data.authenticate).to.have.property('refreshToken');
          done();
        });
    });
    it('it should not authenticate', (done) => {
      chai.request(server)
        .post('/graphql')
        .set('content-type', 'application/graphql')
        .send(`
          mutation {
            authenticate(credential: {
              username: "${tests.incorrectCred.username}"
              password: "${tests.incorrectCred.password}"
            }) {
              accessToken
              refreshToken
            }
          }
        `)
        .end((err, res) => {
          expect(res.body.errors[0]).to.have.property('name');
          expect(res.body.errors[0]).to.have.property('message');
          expect(res.body.errors[0].data).to.have.property('statusCode');
          expect(res.body.errors[0].data.statusCode).to.equal('AUTH_F');
          done();
        });
    });
  });
  describe('Refresh Token', () => {
    it('it should refresh tokens', (done) => {
      chai.request(server)
        .post('/graphql')
        .set('content-type', 'application/graphql')
        .send(`
          mutation {
            refreshToken(refreshToken: "${authRes.refreshToken}") {
              accessToken
              refreshToken
            }
          }
        `)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.data.refreshToken).to.have.property('accessToken');
          expect(res.body.data.refreshToken).to.have.property('refreshToken');
          expect(res.body.data.refreshToken.accessToken).to.be.a('string');
          expect(res.body.data.refreshToken.refreshToken).to.be.a('string');
          done();
        });
    });
  });
});