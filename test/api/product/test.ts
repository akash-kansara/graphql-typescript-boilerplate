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
    code: 'testcode',
    name: 'name',
    desc: 'description',
    tag: 'tag1',
    price: 50.78
  },
  update: {
    code: 'testcode',
    name: 'name',
    desc: 'desc',
    tag: 'tag1',
    price: 100.87
  },
  badPayload: {
    code: 'bad-code',
    tag: 12345,
    desc: 12465,
    name: 'fgkagfjka',
    price: 'hfkjhkjhkjh'
  }
}

describe('Product', () => {
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
  it('it should add a product', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          createProduct(product: {
            code: "${tests.add.code}"
            name: "${tests.add.name}"
            desc: "${tests.add.desc}"
            tag: "${tests.add.tag}"
            price: ${tests.add.price}
          }) {
            code
            name
            desc
            tag
            price
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.createProduct).to.have.property('code');
        expect(res.body.data.createProduct).to.have.property('name');
        expect(res.body.data.createProduct.code).to.equal(tests.add.code);
        expect(res.body.data.createProduct.name).to.equal(tests.add.name);
        expect(res.body.data.createProduct.desc).to.equal(tests.add.desc);
        expect(res.body.data.createProduct.tag).to.equal(tests.add.tag);
        expect(res.body.data.createProduct.price).to.equal(tests.add.price);
        done();
      });
  });
  it('it should get all the products', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        query {
          products {
            code
            name
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.products).to.be.a('array');
        let product = res.body.data.products.filter(e => e.code === tests.add.code)[0];
        expect(product.code).to.equal(tests.add.code);
        expect(product.name).to.equal(tests.add.name);
        done();
      });
  });
  it('it should update a product', (done) => {
    chai.request(server)
      .post('/graphql')
      .set('content-type', 'application/graphql')
      .set('Bearer', get(authRes, 'accessToken'))
      .send(`
        mutation {
          updateProduct(product: {
            code: "${tests.update.code}"
            name: "${tests.update.name}"
            desc: "${tests.update.desc}"
            tag: "${tests.update.tag}"
            price: ${tests.update.price}
          }) {
            code
            name
            desc
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.updateProduct).to.have.property('code');
        expect(res.body.data.updateProduct).to.have.property('name');
        expect(res.body.data.updateProduct.code).to.equal(tests.update.code);
        expect(res.body.data.updateProduct.desc).to.equal(tests.update.desc);
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
          product(code: "${tests.update.code}") {
            code
            name
            desc
            price
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.data.product.name).to.equal(tests.update.name);
        expect(res.body.data.product.desc).to.equal(tests.update.desc);
        expect(res.body.data.product.price).to.equal(tests.update.price);
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
          createProduct(product: {
            code: "${tests.badPayload.code}"
            name: "${tests.badPayload.name}"
            desc: "${tests.badPayload.desc}"
            tag: "${tests.badPayload.tag}"
            price: ${tests.badPayload.price}
          }) {
            code
            name
          }
        }
      `)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('errors');
        done();
      });
  });
});