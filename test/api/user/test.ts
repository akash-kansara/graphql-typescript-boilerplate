import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import { get } from 'lodash';
chai.use(chaiHttp);

import server from '../../../src';

// Uncomment below line(s) to run this test file individually
// after((done) => { done(); process.exit(0); });

let tests = {
  add: {
    firstname: 'First',
    lastname: 'Last',
    email: 'first.last@example.com',
    dob: '1990-01-01'
  },
  update: {
    firstname: 'First',
    lastname: 'Lastname',
    email: 'first.last@example.com',
    dob: '1990-01-01'
  },
  badPayload: {
    firstname: 'First',
    lastname: 12345,
    email: 'dhghf',
    dob: 'dhkfjdk'
  }
}

describe('User', () => {
  let authRes;
  before((done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .send(`mutation{authenticate(credential:{username:"root" password:"root"}){accessToken refreshToken}}`)
      .end((err, res) => {
        authRes = res.body.data.authenticate;
        done();
      });
  });
  it('it should add a user', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          createUser(user: {
            firstname: "${tests.add.firstname}"
            lastname: "${tests.add.lastname}"
            email: "${tests.add.email}"
            dob: "${tests.add.dob}"
          }) {
            firstname
            email
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.createUser).to.have.property('email');
        expect(res.body.data.createUser).to.have.property('firstname');
        expect(res.body.data.createUser.email).to.equal(tests.add.email);
        expect(res.body.data.createUser.firstname).to.equal(tests.add.firstname);
        done();
      });
  });
  it('it should get all the users', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        query {
          users {
            email
            firstname
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.users).to.be.a('array');
        let user = res.body.data.users.filter(e => e.email === tests.add.email)[0];
        expect(user.email).to.equal(tests.add.email);
        expect(user.firstname).to.equal(tests.add.firstname);
        done();
      });
  });
  it('it should update a user', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          updateUser(user: {
            firstname: "${tests.update.firstname}"
            lastname: "${tests.update.lastname}"
            email: "${tests.update.email}"
            dob: "${tests.update.dob}"
          }) {
            firstname
            lastname
            email
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.updateUser).to.have.property('email');
        expect(res.body.data.updateUser).to.have.property('lastname');
        expect(res.body.data.updateUser.email).to.equal(tests.update.email);
        expect(res.body.data.updateUser.lastname).to.equal(tests.update.lastname);
        done();
      });
  });
  it('it should confirm updated details', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        query {
          user(email: "${tests.update.email}") {
            email
            lastname
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.user.lastname).to.equal(tests.update.lastname);
        done();
      });
  });
  it('it should respond with bad payload', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          createUser(user: {
            firstname: "${tests.badPayload.firstname}"
            lastname: "${tests.badPayload.lastname}"
            email: "${tests.badPayload.email}"
            dob: "${tests.badPayload.dob}"
          }) {
            email
            firstname
          }
        }
      `)
      .end((err, res) => {
        expect(res.body).to.have.property('errors');
        done();
      });
  });
});