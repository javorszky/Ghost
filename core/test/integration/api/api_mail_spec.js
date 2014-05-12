/*globals describe, before, beforeEach, afterEach, it */
var testUtils       = require('../../utils'),
    should          = require('should'),
    defaultConfig   = require('../../../../config'),
    sinon           = require('sinon'),
    sandbox         = sinon.sandbox.create(),
    _               = require("lodash"),
    rewire          = require("rewire"),
    mailer          = rewire('../../../server/mail'),

    // Stuff we are testing
    MailAPI         = require('../../../server/api/mail'),
    fakeConfig,
    config;


describe('Mail API', function () {
    var overrideConfig = function (newConfig) {
            mailer.__set__('config',  sandbox.stub().returns(
                _.extend({}, defaultConfig, newConfig)
            ));
        },
        mailData = {
            mail: [{
                message: {
                    to: 'joe@example.com',
                    subject: 'testemail',
                    html: '<p>This</p>'
                },
                options: {}
            }]
        },
        stubMailSetting = {
            transport: 'stub',
        };




    before(function (done) {

        fakeConfig = _.extend({}, defaultConfig);
        config = sinon.stub().returns(fakeConfig);


        testUtils.clearData()
            .then(function () {
                return testUtils.initData();
            })
            .then(function () {
                return testUtils.insertDefaultFixtures();
            })
            .then(function () {
                done();
            }).catch(done);
    });



    afterEach(function (done) {
        sandbox.restore();

        testUtils.clearData().then(function () {
            done();
        }).catch(done);
    });



    it('return correct failure message', function (done) {

        MailAPI.send(mailData).then(function (response) {
            // this should not be called
            done();
        }).catch(function (error) {
            error.type.should.eql('EmailError');
            done();
        });

    });

    it('return correct success message', function (done) {
        overrideConfig({mail: stubMailSetting});
        console.log('starting the return correct settings');
        MailAPI.send(mailData).then(function (response) {

            should.exist(response);
            should.exist(response.mail);
            response.mail.should.have.lengthOf(1);
            should.exist(response.mail[0].status);
            response.mail[0].status.message.should
                .be('NotFound');
            done();
        }).catch(function(error) {
            console.log(error);
        });
    });
});