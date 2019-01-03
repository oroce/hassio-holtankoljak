const proxyquire = require('proxyquire');
const sinon = require('sinon');
const fs = require('fs');
const responseStubs = {
  valid: fs.readFileSync('./stubs/haller.html', 'utf8')
};
describe('parser', () => {
  it('should fetch and return the prices', async () => {
    const got = sinon.stub().resolves({
      body: responseStubs.valid
    });
    got['@noCallThru'] = true;

    const parser = proxyquire('./', {
      got
    });

    const results = await parser('shell-budapest-ix-haller-u-56.html');

    got.calledOnce.should.be.true('got should have been called once');
    got.getCall(0).args[0].should.eql('https://holtankoljak.hu/benzinkutak/shell-budapest-ix-haller-u-56.html');

    results.should.eql([
      {
        type: 'benzin',
        price: 341.9
      },
      {
        type: 'gázolaj',
        price: 379.9
      },
      {
        type: 'prémium benzin',
        price: 390.9
      },
      {
        type: 'prémium gázolaj',
        price: 420.9
      },
      {
        type: 'adblue',
        price: null
      }
    ]);
  });

  it('should parse prices', async () => {
    const got = sinon.stub().resolves({
      body: 'we wont use this'
    });
    got['@noCallThru'] = true;
    const $benzinTypeStub = sinon.stub().returns({
      text: () => 'Benzin'
    });
    const $benzinPriceStub = sinon.stub().returns({
      text: () => '331.1 Ft/liter'
    });
    const $gazolajTypeStub = sinon.stub().returns({
      text: () => 'Gázolaj'
    });
    const $gazolajPriceStub = sinon.stub().returns({
      text: () => '371.1 Ft/liter'
    });
    const $premiumBenzinTypeStub = sinon.stub().returns({
      text: () => 'Prémium benzin'
    });
    const $premiumBenzinPriceStub = sinon.stub().returns({
      text: () => '421 Ft/liter'
    });
    const $premiumGazolajTypeStub = sinon.stub().returns({
      text: () => 'Prémium gázolaj'
    });
    const $premiumGazolajPriceStub = sinon.stub().returns({
      text: () => '456.9 Ft/liter'
    });
    const $adBlueTypeStub = sinon.stub().returns({
      text: () => 'Adblue'
    });
    const $adBluePriceStub = sinon.stub().returns({
      text: () => ' -'
    });
    const $tableFindStub = sinon.stub().returns({
      get: () => ['benzin', 'gazolaj', 'premium benzin', 'premium gazolaj', 'adblue']
    });

    const $stub = sinon.stub()
      .onCall(0).returns({
        find: $tableFindStub
      })
      // benzin
      .onCall(1).returns({
        find: $benzinTypeStub
      })
      .onCall(2).returns({
        find: $benzinPriceStub
      })
      // gázolaj
      .onCall(3).returns({
        find: $gazolajTypeStub
      })
      .onCall(4).returns({
        find: $gazolajPriceStub
      })
      // prémium benzin
      .onCall(5).returns({
        find: $premiumBenzinTypeStub
      })
      .onCall(6).returns({
        find: $premiumBenzinPriceStub
      })
      // prémium gázolaj
      .onCall(7).returns({
        find: $premiumGazolajTypeStub
      })
      .onCall(8).returns({
        find: $premiumGazolajPriceStub
      })
      // adblue
      .onCall(9).returns({
        find: $adBlueTypeStub
      })
      .onCall(10).returns({
        find: $adBluePriceStub
      });
    const cheerio = {
      load: () => $stub,
      '@noCallThru': true
    };
    const parser = proxyquire('./', {
      got,
      cheerio
    });

    const results = await parser('wont-matter');

    got.calledOnce.should.be.true('got should have been called once');
    got.getCall(0).args[0].should.eql('https://holtankoljak.hu/benzinkutak/wont-matter');

    $stub.getCall(0).args[0].should.eql('.station-data-left .station-data.data-green');
    $stub.getCall(1).args[0].should.eql('benzin');
    $stub.getCall(2).args[0].should.eql('benzin');

    $stub.getCall(3).args[0].should.eql('gazolaj');
    $stub.getCall(4).args[0].should.eql('gazolaj');

    $stub.getCall(5).args[0].should.eql('premium benzin');
    $stub.getCall(6).args[0].should.eql('premium benzin');

    $stub.getCall(7).args[0].should.eql('premium gazolaj');
    $stub.getCall(8).args[0].should.eql('premium gazolaj');

    $stub.getCall(9).args[0].should.eql('adblue');
    $stub.getCall(10).args[0].should.eql('adblue');

    results.should.eql([
      { type: 'benzin', price: 331.1 },
      { type: 'gázolaj', price: 371.1 },
      { type: 'prémium benzin', price: 421 },
      { type: 'prémium gázolaj', price: 456.9 },
      { type: 'adblue', price: null }
    ]);
  });
});
