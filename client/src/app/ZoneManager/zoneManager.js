'use strict';


angular.module('zoneManager', ['cons'])
    .config(['$stateProvider', '$urlRouterProvider', 'USER_ROLES', function ($stateProvider, $urlRouterProvider, USER_ROLES) {

        $stateProvider
            .state('app.zmhotelacc_list', {
                    url: '/hotel_acclist',
                    templateUrl: 'app/ZoneManager/Zmaccount/zm-hotel-acc-create.html',
                    controller: 'hotelDetailCtrl',
                    data: {
                    authorizedRoles: [USER_ROLES.zmanager]
                    }
                })

            .state('app.ZMProfile', {
                    url: '/zmProfile',
                    templateUrl: 'app/ZoneManager/accountVisualization/zoneMgraccVis.html',
                    controller: 'zoneMgraccvisCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
                .state('app.hotelacc_creation', {
                    url: '/hotelacc_creation',
                    templateUrl: 'app/ZoneManager/AccountCreation/hotel-account_creation.html',
                    controller: 'zoneMgrAccCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
    
            .state('app.hotelservice-supp-acc', {
                    url: '/hotelservice-supp-acc-creation',
                    templateUrl: 'app/ZoneManager/AccountCreation/service-supplier-account-creation.html',
                    controller: 'zoneMgrAccCtrl',
                    data: {
                    authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
    
    
    
    
            // modal html
    
    
            .state('app.hotel_createacc', {
                    url: '/hotel_createacc',
                    templateUrl: 'app/ZoneManager/modal/modal.zm-acc-create.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.zmhmacc_creation', {
                    url: '/zmhmacc_creation',
                    templateUrl: 'app/ZoneManager/AccountCreation/hotel-mgr-acccreation.html',
                    controller: 'zoneMgrAccCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.zmscacc_creation', {
                    url: '/zmscacc_creation',
                    templateUrl: 'app/ZoneManager/AccountCreation/service-supplier-account-creation',
                    controller: 'zoneMgrAccCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
    
            .state('app.zmhotel_det', {
                    url: '/hotel_accdet',
                    templateUrl: 'app/ZoneManager/Zmaccount/zm-hotel-acc-details.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.zmhotelacc_modify', {
                    url: '/hotel_accmodify',
                    templateUrl: 'app/ZoneManager/Zmaccount/zm-hotel-acc-modify.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.zmhotelacc_tablet', {
                    url: '/hotel_acctablet',
                    templateUrl: 'app/ZoneManager/Zmaccount/zm-hotel-acc-list.html',
                    controller:'hotelDetailCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.edit_products', {
                    url: '/edit_product',
                    templateUrl: 'app/ZoneManager/ZMProduct/THVZMedit-products.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.new_products', {
                    url: '/new_products',
                    templateUrl: 'app/ZoneManager/ZMProduct/THVZMNewProduct.html',
                    controller:'zoneProductCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.product_details', {
                    url: '/product_details',
                    templateUrl: 'app/ZoneManager/ZMProduct/THVZMProductDetails.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.supplier_product', {
                    url: '/supplier_product',
                    templateUrl: 'app/ZoneManager/ZMProduct/THVZMSupplierProduct.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.suppl_acct', {
                    url: '/suppl_acct',
                    templateUrl: 'app/ZoneManager/ZMsupplier/zm-supplier-account-list.html',
                    controller:'supplierCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.suppl_prod', {
                    url: '/suppl_prod',
                    templateUrl: 'app/ZoneManager/ZMsupplier/zm-supplier-products.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.manager_tablet', {
                    url: '/manager_tablet',
                    templateUrl: 'app/ZoneManager/ZMtabletstatus/zm-tablet-status.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.transaction_complete', {
                    url: '/transaction_complete',
                    templateUrl: 'app/ZoneManager/THVZMtransaction/zm-transaction-completed.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.transaction_pending', {
                    url: '/transaction_pending',
                    templateUrl: 'app/ZoneManager/THVZMtransaction/zm-transaction-pending.html',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })

            .state('zmLogin', {
                    url: '/zm-login',
                    templateUrl: 'app/ZoneManager/login/login.html',
                    controller: 'zmloginCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })

            //lists
            .state('app.supplierList', {
                    url: '/supplier_list',
                    templateUrl: 'app/ZoneManager/lists/service_suppliers_list.html',
                    controller: 'zmListCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.hotelManagerList', {
                    url: '/hotel_manager_list',
                    templateUrl: 'app/ZoneManager/lists/hotel_managers_list.html',
                    controller: 'zmListCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
            .state('app.logisticAgentList', {
                    url: '/logistic_agent_list',
                    templateUrl: 'app/ZoneManager/lists/logistic_agents_list.html',
                    controller: 'zmListCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })

            .state('app.zoneCatalog', {
                    url: '/zone_catalog',
                    templateUrl: 'app/ZoneManager/catalog/zone.html',
                    controller: 'zmCatalogCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })

            .state('app.japaneseCatalog', {
                    url: '/japanese_catalog',
                    templateUrl: 'app/ZoneManager/catalog/logistic_agents_list.html',
                    controller: 'zmCatalogCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })

            .state('app.businessCatalog', {
                    url: '/business_catalog',
                    templateUrl: 'app/ZoneManager/catalog/logistic_agents_list.html',
                    controller: 'zmCatalogCtrl',
                    data: {
                        authorizedRoles: [USER_ROLES.zmanager]
                    }
            })
    }]);