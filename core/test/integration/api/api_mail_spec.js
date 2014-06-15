/*globals describe, before, beforeEach, afterEach, it */
var _               = require('lodash'),
    testUtils       = require('../../utils'),
    should          = require('should'),
    sinon           = require('sinon'),
    when            = require('when'),
    rewire          = require('rewire'),

    // Stuff we are testing
    mailer          = rewire('../../../server/mail'),
    MailAPI         = require('../../../server/api/mail'),
    SettingsAPI     = require('../../../server/api/settings');


describe('Mail API', function () {
    var mailData = {
            mail: [{
                message: {
                    to: 'gabor@javorszky.co.uk',
                    subject: 'testemail',
                    html: '<p>This</p>'
                },
                options: {}
            }]
        },
        stubTransport = {
            transport: 'stub',
            options: {
                error: "Sending Failed"
            }
        },
        mailgun = {
            transport: 'SMTP',
            options: {
                service: 'Mailgun',
                auth: {
                    user: 'postmaster@javorszky.mailgun.org',
                    pass: '7xfw2z-6x681'
                }
            }
        },
        fakeEmail = { settings:
            [
                {
                    key: 'email',
                    value: 'gabor@javorszky.co.uk'
                }
            ]
        },
        configStub,
        sandbox,
        emailStub;

    before(function (done) {
        testUtils.clearData()
            .then(function () {
                return testUtils.initData();
            })
            .then(function () {
                return testUtils.insertDefaultFixtures();
            })
            .then(function () {
                sandbox = sinon.sandbox.create();

                configStub = sandbox.stub().returns({
                    mail: mailgun
                });

                // emailStub = sandbox.stub(SettingsAPI, 'read', function () {
                //     return when(fakeEmail);
                // });

                done();
            }).catch(done);
    });


    afterEach(function (done) {
        testUtils.clearData().then(function () {
            done();
        }).catch(done);
    });

    after(function (done) {
        testUtils.clearData().then(function () {
            sandbox.restore();
            done();
        }).catch(done);
    })


    it('return correct failure message', function (done) {
        var config;

        config = mailer.__get__('config');
        _.extend(configStub, config);
        mailer.__set__('config', configStub);

        mailer.init().then(function () {
            console.log('this is transport in API: ', mailer.transport);
            MailAPI.send(mailData).then(function (response) {
                console.log('this is the function', response);
                done();
            }).catch(function (error) {
                console.log('this is the error', error);
                error.type.should.eql('EmailError');
                done();
            });
        });
    });
});