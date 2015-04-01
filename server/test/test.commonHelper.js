'use strict';

/*************************************************************************
 *
 * TOP HAT VOYAGE CONFIDENTIAL
 * __________________
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
var async = require('async'),
    assert = require('chai').assert;

exports.commonHotelData = function() {

    var hotelData = {
        name: 'TAJ',
        zone: '0',
        unit: 'five',
        building: 'cubeTowers',
        street: 'HiTechRoad',
        city: 'NewYork',
        region: 'NewYork',
        country: 'America',
        addressCode: '12345678',
        telephone: '97863443343',
        fax: '97863443343',
        email: 'karnprem@cronj.com',
        category: '5star',
        rooms: ['101'],
        businessValue: 5,
        contractedRooms: [{
            room: '5',
            tabletId: '7',
            tabletStatus: 'ready'
        }],
        dateOfCreation: '2/5/2015',
        isActive: true
    };

    return hotelData;
};

exports.commonhotelManagerData = function() {
    var hotelManagerData = {
        prefix: 'Mr',
        firstname: 'Martine',
        lastname: 'Micky',
        phone: '9176534213',
        email: 'gaurav@cronj.com',
        preferedLanguage: 'Deutch',
        dateOfCreation: '2/5/2015',
        zone: '0',
        hotel: '1',
        isActive: true
    };
    return hotelManagerData;
};

exports.commonhotelUserData = function() {
    var hotelUserData = [{
        prefix: 'Mr',
        firstname: 'Henry',
        lastname: 'Micky',
        phone: '9176534213',
        email: 'anusha@cronj.com',
        title: 'Developer',
        preferedLanguage: 'Deutch',
        dateOfCreation: '2/5/2015',
        zone: '0',
        hotel: '1',
        isActive: true
    }];
    return hotelUserData;
};

exports.commonzoneManagerData = function() {
    var zoneManagerData = {
        prefix: 'Mr',
        firstname: 'Henry',
        lastname: 'Micky',
        phone: '9176534213',
        email: 'mukund@cronj.com',
        preferedLanguage: 'Deutch',
        dateOfCreation: '2/5/2015',
        zone: '0',
        isActive:true
    };
    return zoneManagerData;
};


exports.commonSupplierData = function() {
    var supplierData = {
        supplierType: 'Vendors',
        corporateName: 'THV',
        zones: ['0'],
        legalForm: 'THV Form',
        siret: 'DH0982',
        nDegreeTVAcode: '787292932',
        address: '',
        phone: '1234567890',
        workingTime: [{
            day: [
                'monday'
            ],
            openingTime: '03:18pm',
            closingTime: '09:00pm'
        }],
        dayOff: ['2'],
        exceptionalOpening: [{
            time: '3:00pm',
            date: '2/5/2015'
        }],
        dateOfCreation: '2/23/2015',
        isActive: true
    };
    return supplierData;
};

exports.commonSupplierUserData = function() {
    var supplierUserData = [{
        prefix: 'Mr',
        firstname: 'Henry',
        lastname: 'Micky',
        phone: '9176534213',
        email: 'santhosh.megavath@cronj.com',
        preferedLanguage: 'Deutch',
        dateOfCreation: '2/5/2015',
        supplier: '0',
        isActive: true
    }];
    return supplierUserData;
};

exports.commonSupplierManagerData = function() {
    var supplierManagerData = {
        prefix: 'Mr',
        firstname: 'Henry',
        lastname: 'Micky',
        phone: '9176534213',
        email: 'monu@cronj.com',
        preferedLanguage: 'Deutch',
        dateOfCreation: '2/5/2015',
        supplier: '0',
        isActive: true
    };
    return supplierManagerData;
};

exports.commonCustomerData = function () {
    var customer = {
        prefix: 'Mr',
        firstname: 'John',
        lastname: 'Smith',
        gender: 'Male',
        phone: '987848454',
        email: 'prems1k91@gmail.com',
        dob: '5/10/1972',
        nationality: 'German',
        dateOfCreation: '2/23/2015',
        preferedLanguage: 'English',
        businessValue: 400,
        history: [{
            stayStartDate: '20-dec-14',
            stayEndDate: '5-jan-15',
            zoneId: '0',
            hotelId: '0',
            room: 'five'
        }],
        isActive: true,
        currentStay: {
            stayStartDate: '2/21/2015',
            expectedStayEndDate: '2/23/2015',
            zoneId: '0',
            hotelId: '0',
            room: 'five',
            cart: ['0']
        }

    } ;
    return customer;
};

exports.commonExecutiveManagerData = function () {
    var executiveManager = {
        prefix: 'Mr',
        firstname: 'Henry',
        lastname: 'Micky',
        phone: '9176534213',
        email: 'gaurav_bng@hotmail.com',
        preferedLanguage: 'Deutch',
        dateOfCreation: '2/5/2015',
        isActive: true
    };
    return executiveManager;
};

exports.commonLogisticAgentData = function () {
    var logisticAgent = {
            prefix: 'Mr',  
            firstname: 'Micky',
            lastname: 'Syrus',
            phone: '9176534213',
            email: 'vinitraj91@gmail.com',
            preferedLanguage: 'German',
            zone: '0',
            isActive: true,
            dateOfCreation: '2/5/2015'
    };
    return logisticAgent;
};

exports.commonProductData = function(){
    var productData = {
           productType: 'TShirt',
            section: 'Cloths',
            categories: [{
                category: '0',
                subCategory: '0'
            }],
            name: 'Clothes',
            description: 'TshirtofJohnPlayer',
            zones: ['0'],
            warrantyCondition: '5years',
            dimension: {
                width: 40,
                depth: 30,
                height: 30,
                unit: 'five'
            },
            weight: {
                value: 50,
                unit: 'seven'
            },
            supplierId: '0',
            costPrice: 400,
            vatPercent: 10,
            retailPrice: 100,
            stock: 300,
            isActive: true,
            dateOfCreation: '2/5/2015'
    };

    return productData;
};

exports.commonCategoryData = function(){
    var categoryData = {
        categoryNames: [{
                name: 'BOOKS',
                language: 'HINDI'
            }],
        dateOfCreation: '2/5/2015'
    };

    return categoryData;
};

exports.commonSubCategoryData = function(){
    var subCategoryData = {
        subCategoryName: [{
            name: 'BOOKS',
            language: 'HINDI'
        }],
        category: 'BOOKS'
    };

    return subCategoryData;
};

exports.commonUserData = function(){
    var userData = {
        userId: '0',
        username: 'Monu1@cronj.com',
        password: 'Manipal',
        scope: 'Customer'
    };

    return userData;
};

exports.commonZone = function(){
    var zoneData = {
        zoneName: 'Hyderabad'
    };

    return zoneData;
};

exports.commonAdministrator = function(){
    var adminData = {
        alertEmail: ['gaurav@cronj.com','sushant@cronj.com'],
        alertPhone: ['90191919908','9851110666']
    };

    return adminData;
};

exports.commonAdministratorLogin = function(){
    var adminLoginData = {
        username : 'ptlkaran499@gmail.com',
        password : 'cronj.com',
        alertEmail: ['gaurav@cronj.com','sushant@cronj.com'],
        alertPhone: ['90191919908','9851110666']
    };

    return adminLoginData;
};

exports.timeoutTime = function(){
    return 0;
}

exports.invalidToken = function(){
   var invalidUserToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIwIiwic2NvcGUiOlsiQWRtaW4iXSwidXNlcm5hbWUiOiJhbnVzaGFAY3JvbmouY29tIiwiaWF0IjoxNDI1NTg0MTgwfQ.kb6eIX_P268cilEjETwDGNtq5OoRtIPLO4vkGGr7TAs';
   return invalidUserToken;
};

exports.removeCollections = function(mongoose, call){
    mongoose.connection.db.collectionNames(function(err, collections){
        async.parallel([
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('administrators') != -1) {
                        mongoose.connection.db.dropCollection('administrators', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
                
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('categories') != -1) {
                        mongoose.connection.db.dropCollection('categories', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('customers') != -1) {
                        mongoose.connection.db.dropCollection('customers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('executivemanagers') != -1) {
                        mongoose.connection.db.dropCollection('executivemanagers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('hotels') != -1) {
                        mongoose.connection.db.dropCollection('hotels', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('hotelmanagers') != -1) {
                        mongoose.connection.db.dropCollection('hotelmanagers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('hotelusers') != -1) {
                        mongoose.connection.db.dropCollection('hotelusers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('logisticagents') != -1) {
                        mongoose.connection.db.dropCollection('logisticagents', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('products') != -1) {
                        mongoose.connection.db.dropCollection('products', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('subcategories') != -1) {
                        mongoose.connection.db.dropCollection('subcategories', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('suppliers') != -1) {
                        mongoose.connection.db.dropCollection('suppliers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('suppliermanagers') != -1) {
                        mongoose.connection.db.dropCollection('suppliermanagers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('supplierusers') != -1) {
                        mongoose.connection.db.dropCollection('supplierusers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('users') != -1) {
                        mongoose.connection.db.dropCollection('users', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('zones') != -1) {
                        mongoose.connection.db.dropCollection('zones', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            },
            function(callback){
                if(collections.map(function(e) { return e.name; }).indexOf('zonemanagers') != -1) {
                        mongoose.connection.db.dropCollection('zonemanagers', function(err) {
                        callback(err);
                    });
                }
                else{
                    callback();
                }
            }
        ],
        // optional callback
        function(err){
            call(err);
        });

    });
};

var MockEmailService = function (managerDataScope){
    this.managerDataScope = managerDataScope;
    this.index = 0;
};

MockEmailService.prototype.sentMail = function(user, email, config){
    var em = this.managerDataScope[this.index].manager.email||this.managerDataScope[this.index].manager.username;
    assert.equal(user.username, em, 'username is not what is expected');
    assert.equal(user.scope, this.managerDataScope[this.index].scope, 'scope is not what is expected');
    assert.equal(email, em, 'email is not what is expected');
    this.index ++;
};
MockEmailService.prototype.hasBeenCalled = function() {
    return this.index === this.managerDataScope.length;
};

exports.MockEmailService = MockEmailService;