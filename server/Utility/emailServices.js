'use strict';

/*************************************************************************
 *
 * TOP HAT VOYAGE CONFIDENTIAL
 * 
 *
 *  [2014] - [2015] Top Hat Voyage SAS - Alfred by THV
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Top Hat Voyage SAS and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Top Hat Voyage SAS
 * and its suppliers and may be covered by French and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Top Hat Voyage SAS.
 */
var nodemailer = require('nodemailer'),
    crypto = require('./thvcryptolib');


exports.sentMail = function(user, email, config) {
    var from = 'THV Team<' + config.email.username + '>';
    var mailbody = 'Congratulation! your THV ' + user.scope + ' Account has been created. Your username: ' + user.username + ' and password: ' + crypto.decrypt(user.password, config);
    mail(config, from, email, 'Account Credential', mailbody);
};

exports.sentProductMail = function(product, email, config) {
    if (!product){
        throw(new Error('SendProductMail requires product argument'));
    }
    if (!email){
        throw(new Error('SendProductMail requires email argument'));
    }
    if (!config){
        throw(new Error('SendProductMail requires config argument'));
    }
    var from = 'THV Team<' + config.email.username + '>';
    var mailbody = 'New Product has been added by supplier Id: ' + product.supplierId + ' Product Type: ' + product.productType + ' Product Name: ' + product.name + ' . Cost Price: ' + product.costPrice + ' , Retail Price ' + product.retailPrice;
    mail(config, from, email, 'Account Credential', mailbody);
};

exports.sentPasswordMail = function(email, password, config) {
    var from = 'THV Account Password Recovery<' + config.email.username + '>';
    var mailbody = 'Your username: ' + email + ' and password: ' + crypto.decrypt(password, config);
    mail(config, from, email, 'Account Credential', mailbody);
};

exports.sentCostPriceMail = function(request, email, config) {
    var from = 'THV Cost Price Notification<' + config.email.username + '>';
    var mailbody = 'Cost Price of Product' + request.name + 'is' + request.costPrice + ' and selling price: ' + request.retailPrice;
    mail(config, from, email, 'Cost Price', mailbody);
};

exports.sendResetPasswordEmail = function(email, password, config) {
    var from = 'Reset Password<' + config.email.username + '>';
    var mailbody = 'Your password has been sucessfully changed. Your username: ' + email + ' and new password: ' + password;
    mail(config, from, email, 'Password Reset', mailbody);
};

function smtpTransport(config) {
    return (nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: config.email.username,
            pass: config.email.password
        }
    }));
}

function mail(config, from, email, subject, mailbody) {
    var mailOptions = {
         from: from, // sender address
         to: email, // list of receivers
         subject: subject, // Subject line
         //text: result.price, // plaintext body
         html: '<b>' + mailbody + '</b>' // html body
    };

    smtpTransport(config).sendMail(mailOptions, function(error) {
         if (error) {
             console.log(error);
         }
         smtpTransport(config).close(); // shut down the connection pool, no more messages
    });
}

