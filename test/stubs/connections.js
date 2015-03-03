module.exports = {
    test: {
        adapter: 'waterline-soap',
        wsdl: '/Users/rsnyder/platform/chameleon/test/fixtures/default.wsdl.xml',
        wsSecurity: {
          username: 'e39e34c98def1db64229f0554306133b53fd057661b271409090934',
          password: '217eb8c9c92b91c52f25c9354cc773e2',
          passwordType: 'PasswordText',
          useTimestamps: false
        }
    }
};