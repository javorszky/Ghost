var cp         = require('child_process'),
    url        = require('url'),
    _          = require('underscore'),
    when       = require('when'),
    nodefn     = require('when/node/function'),
    nodemailer = require('nodemailer');

function GhostMailer(opts) {
    opts = opts || {};
    this.transport = opts.transport || null;
}

// ## E-mail transport setup
// *This promise should always resolve to avoid halting Ghost::init*.
GhostMailer.prototype.init = function (ghost, configModule) {
    this.ghost = ghost;
    // TODO: fix circular reference ghost -> mail -> api -> ghost, remove this late require
    this.api = require('./api');
    // We currently pass in the config module to avoid
    // circular references, similar to above.
    this.config = configModule;

    var self = this,
        config = this.config();

    if (config.mail && config.mail.transport && config.mail.options) {
        this.createTransport(config);
        return when.resolve();
    }

    // if the mail isn't configured, fall back to direct transport
    // Needs nodemailer 0.5.8
    self.transport = nodemailer.createTransport('direct');
    self.usingDirect();

    return when.resolve();
};

GhostMailer.prototype.isWindows = function () {
    return process.platform === 'win32';
};

GhostMailer.prototype.usingDirect = function () {
    this.api.notifications.add({
        type: 'info',
        message: [
            "Ghost is attempting to use nodemail's direct transport to send e-mail.",
            "Keep in mind, because of this, the emails will probably land in your",
            "spam folder. It is recommended that you explicitly configure an e-mail",
            "service to avoid that.",
            "<br>See <a href=\"http://docs.ghost.org/mail\">http://docs.ghost.org/mail</a> for instructions"
        ].join(' '),
        status: 'persistent',
        id: 'ghost-mail-fallback'
    });
};

GhostMailer.prototype.createTransport = function (config) {
    this.transport = nodemailer.createTransport(config.mail.transport, _.clone(config.mail.options));
};

GhostMailer.prototype.emailDisabled = function () {
    this.api.notifications.add({
        type: 'warn',
        message: [
            "Ghost is currently unable to send e-mail.",
            "See <a href=\"http://docs.ghost.org/mail\">http://docs.ghost.org/mail</a> for instructions"
        ].join(' '),
        status: 'persistent',
        id: 'ghost-mail-disabled'
    });
    this.transport = null;
};

// Sends an e-mail message enforcing `to` (blog owner) and `from` fields
GhostMailer.prototype.send = function (message) {
    if (!this.transport) {
        return when.reject(new Error('Email Error: No e-mail transport configured.'));
    }
    if (!(message && message.subject && message.html)) {
        return when.reject(new Error('Email Error: Incomplete message data.'));
    }

    var from = (this.config().mail && this.config().mail.fromaddress) || 'ghost@' + this.config().server.host,
        to = message.to || this.ghost.settings('email'),
        sendMail = nodefn.lift(this.transport.sendMail.bind(this.transport));

    message = _.extend(message, {
        from: from,
        to: to,
        generateTextFromHTML: true
    });

    return sendMail(message).otherwise(function (error) {
        // Proxy the error message so we can add 'Email Error:' to the beginning to make it clearer.
        error =  _.isString(error) ? 'Email Error:' + error : (_.isObject(error) ? 'Email Error: ' + error.message : 'Email Error: Unknown Email Error');
        return when.reject(new Error(error));
    });
};

module.exports = new GhostMailer();
