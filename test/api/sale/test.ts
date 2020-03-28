import chai from 'chai';
import chaiHttp from 'chai-http';
import { expect } from 'chai';
import { get } from 'lodash';
chai.use(chaiHttp);

import server from '../../../src';

// Uncomment below line(s) to run this test file individually
// after((done) => { done(); process.exit(0); });

let username = 'root', password = 'root';

let tests = {
  user: {
    firstname: 'Sales',
    lastname: 'Tester',
    email: 'sales.tester@example.com',
    dob: '1995-09-09'
  },
  product: {
    code: 'product.code',
    name: 'Product Name',
    desc: 'description',
    tag: 'tag1',
    price: 90
  },
  add: {
    productCode: 'product.code',
    userEmail: 'sales.tester@example.com',
    quantity: 50
  },
  badPayload: {
    productCode: 'product.code',
    userEmail: 'sales.tester@example.com',
    quantity: 50.78
  },
  logicFailOne: {
    productCode: 'dfgdfghgdhfgdf',
    userEmail: 'sales.tester@example.com',
    quantity: 50
  },
  logicFailTwo: {
    productCode: 'product.code',
    userEmail: 'djashkjdhkjsakdhskajd@example.com',
    quantity: 50
  }
}

describe('Sale', () => {
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
  before((done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          createUser(user: {
            firstname: "${tests.user.firstname}"
            lastname: "${tests.user.lastname}"
            email: "${tests.user.email}"
            dob: "${tests.user.dob}"
          }) {
            firstname
            email
          }
        }
      `)
      .end((err, res) => {
        done();
      });
  });
  before((done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          createProduct(product: {
            code: "${tests.product.code}"
            name: "${tests.product.name}"
            desc: "${tests.product.desc}"
            tag: "${tests.product.tag}"
            price: ${tests.product.price}
          }) {
            code
            name
          }
        }
      `)
      .end((err, res) => {
        done();
      });
  });
  it('it should post a sale transaction', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          postSale(sale: {
            productCode: "${tests.add.productCode}"
            userEmail: "${tests.add.userEmail}"
            quantity: ${tests.add.quantity}
          }) {
            productCode
            userEmail
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.postSale).to.have.property('productCode');
        expect(res.body.data.postSale).to.have.property('userEmail');
        expect(res.body.data.postSale.productCode).to.equal(tests.add.productCode);
        expect(res.body.data.postSale.userEmail).to.equal(tests.add.userEmail);
        done();
      });
  });
  it('it should get all the sales', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        query {
          sales {
            productCode
            userEmail
            user {
              firstname
            }
            product {
              price
            }
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.sales).to.be.a('array');
        let sale = res.body.data.sales.filter((e) => {
          return e.productCode === tests.add.productCode && e.userEmail === tests.add.userEmail
        })[0];
        expect(sale.productCode).to.equal(tests.add.productCode);
        expect(sale.user.firstname).to.equal(tests.user.firstname);
        expect(sale.product.price).to.equal(tests.product.price);
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
          postSale(sale: {
            productCode: "${tests.badPayload.productCode}"
            userEmail: "${tests.badPayload.userEmail}"
            quantity: ${tests.badPayload.quantity}
          }) {
            productCode
            userEmail
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('errors');
        done();
      });
  });
  it('it should respond with controller failure', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          postSale(sale: {
            productCode: "${tests.logicFailOne.productCode}"
            userEmail: "${tests.logicFailOne.userEmail}"
            quantity: ${tests.logicFailOne.quantity}
          }) {
            productCode
            userEmail
          }
        }
      `)
      .end((err, res) => {
        expect(res.body).to.have.property('errors');
        expect(res.body.errors[0].data.statusCode).to.equal('S_CTRL_F');
        done();
      });
  });
  it('it should respond with controller failure', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          postSale(sale: {
            productCode: "${tests.logicFailTwo.productCode}"
            userEmail: "${tests.logicFailTwo.userEmail}"
            quantity: ${tests.logicFailTwo.quantity}
          }) {
            productCode
            userEmail
          }
        }
      `)
      .end((err, res) => {
        expect(res.body).to.have.property('errors');
        expect(res.body.errors[0].data.statusCode).to.equal('S_CTRL_F');
        done();
      });
  });
});