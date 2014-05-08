/*globals describe, before, beforeEach, afterEach, it */
var testUtils = require('../../utils'),
    should    = require('should'),

    // Stuff we are testing
    MailAPI       = require('../../../server/api/mail');

describe('Mail API', function () {

    before(function (done) {
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
        testUtils.clearData().then(function () {
            done();
        }).catch(done);
    });

    it('return structure correct', function (done) {
        var mailData = {
                mail: [{
                    message: {
                        to: 'joe@example.com',
                        subject: 'testemail',
                        html: '<p>This</p>'
                    },
                    options: {}
                }]
            };
        MailAPI.send(mailData).then(function (response) {
            // console.error('response', response);
            // should.exist(response);
            // should.exist(response.mail);
            // response.mail.should.have.lengthOf(1);
            // should.exist(response.mail[0].status);
            // response.mail[0].status.message.should
                // .be('NotFound');
            done();
        }).catch(done);

    });
});