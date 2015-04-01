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
// Load modules
var User = require('./controller/user'),
    Administrator = require('./controller/administrator'),
    ExecutiveManager = require('./controller/executiveManager'),
    Zone = require('./controller/zone'),
    Category = require('./controller/category'),
    SubCategory = require('./controller/subCategory'),
    LogisticAgent = require('./controller/logisticAgent'),
    Tablet = require('./controller/tablet'),
    Customer = require('./controller/customer'),
    HotelManager = require('./controller/hotelManager'),
    HotelUser = require('./controller/hotelUser'),
    Hotel = require('./controller/hotel'),
    Supplier = require('./controller/supplier'),
    SupplierManager = require('./controller/supplierManager'),
    SupplierUser = require('./controller/supplierUser'),
    Product = require('./controller/product'),
    ZoneManager = require('./controller/ZoneManager'),
    CommonList = require('./Utility/helper'),
    Login = require('./controller/login'),
    Static = require('./static'),
    EmailService = require('./utility/EmailServices');

// API Server Endpoints
exports.endpoints = function(database, config){
    return [

    {
        method: 'GET',
        path: '/{somethingss*}',
        config: Static.get
    },

    // Common Routes
    {
        method: 'GET',
        path: '/getCountryList',
        config:{
            auth: {
                strategy: 'token',
                scope: ['Admin', 'Customer', 'SupplierManager', 'SupplierUser', 'LogisticAgent', 'ZoneManager', 'HotelManager', 'HotelUser', 'ExecutiveManager']
            },
            handler:CommonList.getCountryList()
        }
    }, {
        method: 'GET',
        path: '/getLanguageList',
        config:{
            auth: {
                strategy: 'token',
                scope: ['Admin', 'Customer', 'SupplierManager', 'SupplierUser', 'LogisticAgent', 'ZoneManager', 'HotelManager', 'HotelUser', 'ExecutiveManager']
            },
            handler:CommonList.getLanguageList()
        }
    },

    // User Login and Password Change
    {
        method: 'POST',
        path: '/login',
        config: {
            handler: Login.login(database,config)//db,config)
        }
    }, {
        method: 'PUT',
        path: '/changePassword',
        config: {
            handler: User.update(database,config)
        }
    }, {
        method: 'POST',
        path: '/forgetPassword',
        config: {
            handler: User.resendPassword(database,config, EmailService)
        }
    },

    // Admin User Routes
    {
        method: 'POST',
        path: '/createadmin',
        config: {
            handler: Administrator.createAdmin(database,config, EmailService)
        }
    }, {
        method: 'GET',
        path: '/getAdmin',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Admin']
            },
            handler: Administrator.getAdmin(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateAdmin',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Admin']
            },
            handler: Administrator.updateAdmin(database,config)
        }
    },


    // Executive Manager User Routes
    {
        method: 'GET',
        path: '/getExecutiveManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: ExecutiveManager.getExecutiveManager(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateExecutiveManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: ExecutiveManager.updateExecutiveManager(database,config)
        }
    }, {
        method: 'GET',
        path: '/getExecutiveManagerList',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Admin']
            },
            handler: ExecutiveManager.getExecutiveManagerList(database)
        }
    }, {
        method: 'POST',
        path: '/createExecutiveManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Admin']
            },
            handler: ExecutiveManager.createExecutiveManager(database,config, EmailService)
        }
    },

    // Zone Routes    
    {
        method: 'POST',
        path: '/createZone',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: Zone.createZone(database)
        }
    },

    //Category Routes
    {
        method: 'POST',
        path: '/createCategory',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Category.createCategory(database)
        }
    }, {
        method: 'GET',
        path: '/getAllCategory',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Category.getAllCategory(database,config)
        }
    },


    //Subcategory Routes
    {
        method: 'POST',
        path: '/createSubCategory',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: SubCategory.createSubCategory(database)
        }
    }, {
        method: 'GET',
        path: '/getSubCategorybyId/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: SubCategory.getSubCategorybyId(database,config)
        }
    }, {
        method: 'GET',
        path: '/getAllSubCategorybyCategoryId/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: SubCategory.getAllSubCategorybyCategoryId(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateSubCategorybyId/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: SubCategory.updateSubCategorybyId(database,config)
        }
    },

    // Zone Manager User Routes
    {
        method: 'POST',
        path: '/createZoneManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: ZoneManager.createZoneManager(database,config, EmailService)
        }
    }, {
        method: 'PUT',
        path: '/updateZoneManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'ExecutiveManager']
            },
            handler: ZoneManager.updateZoneManager(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateZoneManager/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'ExecutiveManager']
            },
            handler: ZoneManager.updateZoneManager(database,config)
        }
    },

    // Common Routes
    {
        method: 'GET',
        path: '/getAllLogisticAgentZoneManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: ExecutiveManager.getAllLogisticAgentZoneManager(database)
        }
    }, {
        method: 'GET',
        path: '/getAllHotel/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Hotel.getAllHotel(database,config)
        }
    },

    // Logistic Agent User Routes
    {
        method: 'POST',
        path: '/createLogisticAgent',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: LogisticAgent.createLogisticAgent(database,config, EmailService)
        }
    },

    // Hotel Routes
    {
        method: 'POST',
        path: '/createHotel',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Hotel.createHotel(database,config, EmailService)
        }
    }, {
        method: 'GET',
        path: '/getHotelsByZone',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Hotel.getHotelsByZone(database,config)
        }
    },{
        method: 'GET',
        path: '/getHotelsById/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Hotel.getHotelsById(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateHotel/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Hotel.updateHotel(database,config)
        }
    },


    // Hotel Manager Routes
    {
        method: 'GET',
        path: '/getHotelManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelManager']
            },
            handler: HotelManager.getHotelManager(database,config)
        }
    }, {
        method: 'GET',
        path: '/getHotelManagerList',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: HotelManager.getHotelManagerList(database,config)
        }
    }, {
        method: 'GET',
        path: '/getHotelManagerList/{zone}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: HotelManager.getHotelManagerList(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateHotelManager/{hotel}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelManager', 'ZoneManager']
            },
            handler: HotelManager.updateHotelManager(database,config)
        }
    },

    //Hotel User Routes
    {
        method: 'GET',
        path: '/getHotelUserList',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'ExecutiveManager']
            },
            handler: HotelUser.getHotelUserList(database,config)
        }
    }, {
        method: 'GET',
        path: '/getHotelUserList/{zone}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'ExecutiveManager']
            },
            handler: HotelUser.getHotelUserList(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateHotelUser',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelUser', 'ZoneManager']
            },
            handler: HotelUser.updateHotelUser(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateHotelUser/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelUser', 'ZoneManager']
            },
            handler: HotelUser.updateHotelUser(database,config)
        }
    },


    // Customer Routes 
    {
        method: 'POST',
        path: '/createCustomer',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelManager', 'HotelUser']
            },
            handler: Customer.createCustomer(database,config, EmailService)
        }
    }, {
        method: 'GET',
        path: '/getCustomer',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Customer']
            },
            handler: Customer.getCustomer(database,config)
        }
    }, {
        method: 'GET',
        path: '/getAllCustomer',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelManager', 'HotelUser']
            },
            handler: Customer.getAllCustomer(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateCustomer',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Customer', 'HotelManager', 'HotelUser']
            },
            handler: Customer.updateCustomer(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateCustomer/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Customer', 'HotelManager', 'HotelUser']
            },
            handler: Customer.updateCustomer(database,config)
        }
    },

    // Supplier Routes
    {
        method: 'POST',
        path: '/createSupplier',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Supplier.createSupplier(database,config, EmailService)
        }
    },
    //{ method: 'PUT', path: '/updateSupplier', config: User.updateSupplier },

    // Supplier Manager Routes
    {
        method: 'GET',
        path: '/getSupplierManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['SupplierManager', 'ZoneManager']
            },
            handler: SupplierManager.getSupplierManager(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateSupplierManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['SupplierManager', 'ZoneManager']
            },
            handler: SupplierManager.updateSupplierManager(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateSupplierManager/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['SupplierManager', 'ZoneManager']
            },
            handler: SupplierManager.updateSupplierManager(database,config)
        }
    },


    // Supplier User Routes
    {
        method: 'GET',
        path: '/getSupplierUser',
        config: {
            auth: {
                strategy: 'token',
                scope: ['SupplierUser', 'ZoneManager']
            },
            handler: SupplierUser.getSupplierUser(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateSupplierUser/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['SupplierUser', 'ZoneManager']
            },
            handler: SupplierUser.updateSupplierUser(database,config)
        }
    },{
        method: 'PUT',
        path: '/updateSupplierUser',
        config: {
            auth: {
                strategy: 'token',
                scope: ['SupplierUser', 'ZoneManager']
            },
            handler: SupplierUser.updateSupplierUser(database,config)
        }
    },



    // Logistic Agent Routes
    {
        method: 'GET',
        path: '/getLogisticAgent',
        config: {
            auth: {
                strategy: 'token',
                scope: ['LogisticAgent']
            },
            handler: LogisticAgent.getLogisticAgent(database,config)
        }
    }, {
        method: 'GET',
        path: '/getLogisticAgentByZone',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: LogisticAgent.getLogisticAgentByZone(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateLogisticAgent',
        config: {
            auth: {
                strategy: 'token',
                scope: ['LogisticAgent', 'ExecutiveManager']
            },
            handler: LogisticAgent.updateLogisticAgent(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateLogisticAgent/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['LogisticAgent', 'ExecutiveManager']
            },
            handler: LogisticAgent.updateLogisticAgent(database,config)
        }
    },


    {
        method: 'GET',
        path: '/getZoneManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: ZoneManager.getZoneManager(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateZoneName',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Zone.updateZoneName(database,config)
        }
    }, {
        method: 'GET',
        path: '/getZoneList',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager', 'ZoneManager']
            },
            handler: Zone.getZoneList(database)
        }
    }, 


    //


    {
        method: 'GET',
        path: '/getAllSupplier',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Supplier.getAllSupplier(database,config)
        }
    }, {
        method: 'GET',
        path: '/getSupplier/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Supplier.getSupplier(database,config)
        }
    },{
        method: 'GET',
        path: '/getSupplierbyId/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Supplier.getSupplierById(database,config)
        }
    },{
        method: 'PUT',
        path: '/updateSupplier/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'SupplierManager']
            },
            handler: Supplier.updateSupplier(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateSupplier',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'SupplierManager']
            },
            handler: Supplier.updateSupplier(database,config)
        }
    },

    {
        method: 'PUT',
        path: '/updateHotelManager',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'HotelManager']
            },
            handler: HotelManager.updateHotelManager(database,config)
        }
    }, {
        method: 'PUT',
        path: '/updateHotelManager/{hotel}/{zone}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'HotelManager']
            },
            handler: HotelManager.updateHotelManagerByZoneHotel(database,config)
        }
    }, {
        method: 'POST',
        path: '/checkinCustomer',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelManager']
            },
            handler: Customer.checkinCustomer(database,config)
        }
    }, {
        method: 'POST',
        path: '/checkoutCustomer',
        config: {
            auth: {
                strategy: 'token',
                scope: ['HotelManager']
            },
            handler: Customer.checkoutCustomer(database,config)
        }
    },

    {
        method: 'GET',
        path: '/getHotelUser',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager', 'HotelUser']
            },
            handler: HotelUser.getHotelUser(database,config)
        }
    },
    // { method: 'PUT', path: '/updateHotelUser', config: HotelUser.updateHotelUser },




    {
        method: 'GET',
        path: '/getProduct/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Product.getProduct(database,config)
        }
    }, {
        method: 'POST',
        path: '/createProduct',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Product.createProduct(database,config, EmailService)
        }
    }, {
        method: 'PUT',
        path: '/updateProduct/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Product.updateProduct(database,config, EmailService)
        }
    }, {
        method: 'DELETE',
        path: '/removeProduct/{id}',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Product.removeProduct(database)
        }
    }, {
        method: 'GET',
        path: '/getProductList',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ZoneManager']
            },
            handler: Product.getProductList(database)
        }
    },{
        method: 'POST',
        path: '/createTablet',
        config: {
            auth: {
                strategy: 'token',
                scope: ['Admin']
            },
            handler: Tablet.createTablet(database,config,EmailService)
        }
    },{
        method: 'GET',
        path: '/getTabletList',
        config: {
            auth: {
                strategy: 'token',
                scope: ['ExecutiveManager']
            },
            handler: Tablet.getTabletList(database,config)
        }
    }
 ];
};