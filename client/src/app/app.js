'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('app', [
        'ngAnimate',
        'ngCookies',
        'ngStorage',
        'ui.router',
        'ui.bootstrap',
        'ui.load',
        'ui.jq',
        'ui.validate',
        'pascalprecht.translate',
        'app.filters',
        'app.services',
        'app.directives',
        'adminRoutes',
        'LogisticRoutes',
        'ServiceRoutes',
        'hotelRoutes',
        'mainLogin',
        'zoneManager',
        'execRoutes',
        'thvfactory',
        'xeditable',
        'angular-growl',
        'customerRoutes',
        'supplierUserRoutes',
        'cons',
        'errorroutes',
        'hotelUserRoutes',
        'imageupload',
        'angularFileUpload',
        'base64',
        'multipleDatePicker'
        // 'gm.datepickerMultiSelect'
    ])
    .run(
        ['$rootScope', '$state', '$stateParams',
            function($rootScope, $state, $stateParams) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
        ]
    )


.config(
    ['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', 'USER_ROLES', '$httpProvider', 'growlProvider',
        function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, USER_ROLES, $httpProvider, growlProvider) {
            app.directive = $compileProvider.directive;
            app.filter = $filterProvider.register;
            app.service = $provide.service;
            app.constant = $provide.constant;
            app.value = $provide.value;

            growlProvider.globalTimeToLive(7000);

            $urlRouterProvider
                .otherwise('/login');
            $stateProvider
                .state('app', {
                    url: '/app',
                    templateUrl: 'app/tpl/app.html',
                    data: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
                // .state('apps', {
                //     url: '/apps',
                //     templateUrl: 'app/main/main.html'
                // })
                .state('app.ui', {
                    url: '/ui',
                    template: '<div ui-view class="fade-in-up"></div>',
                    data: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
            $httpProvider.interceptors.push('authInterceptor');
        }
    ]
)

// .config(function ($stateProvider, $urlRouterProvider, $locationProvider,$httpProvider) {
//    // $urlRouterProvider.otherwise('/admin-login');
//    $httpProvider.interceptors.push('authInterceptor');

// })


.factory('authInterceptor', function($rootScope, $q, $cookieStore, $location, AuthServ) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            return config;
        },
        responseError: function(response) {
            if (response.status === 401) {
                AuthServ.removeUser();
                $location.path('/login');
                return $q.reject(response);
            } else {
                return $q.reject(response);
            }
        }
    };
})


.run(function($rootScope, $location, AuthServ, $cookieStore, AUTH_EVENTS, $state) {
    $rootScope.$on('$stateChangeStart', function(event, next) {
        var authorizedRoles = next.data ? next.data.authorizedRoles : null;
        if (!AuthServ.isAuthorized(authorizedRoles)) {
            if (AuthServ.isLoggedInAsync()) {
                $location.path('/app/error');
            } else {
                $location.path('/login');
                // $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
        } else if (AuthServ.isAuthorized(authorizedRoles)) {
            if (!AuthServ.isLoggedInAsync()) {
                if (next.name == 'forgot_password') {
                    $state.go('forgot_password');
                }
                //$location.url('/admin-login');
                else {
                    $state.go('adminlogin',null, {notify:false});
                   
                }

            } else if ($location.path() == '/app/error') {
                $location.path('/app/error');
            } else {
                if ($location.path() != '/app') {

                } else {
                    var url = '/app';
                    $location.path(url);
                }

            }
        }
    });
})



.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})




.config(['$translateProvider', function($translateProvider) {

    // Register a loader for the static files
    // So, the module will search missing translation tables under the specified urls.
    // Those urls are [prefix][langKey][suffix].
    $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
    });

    // Tell the module what language to use by default
    $translateProvider.preferredLanguage('en');

    // Tell the module to store the language in the local storage
    $translateProvider.useLocalStorage();

}])

/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
.constant('JQ_CONFIG', {
    easyPieChart: ['js/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
    sparkline: ['js/jquery/charts/sparkline/jquery.sparkline.min.js'],
    plot: ['js/jquery/charts/flot/jquery.flot.min.js',
        'js/jquery/charts/flot/jquery.flot.resize.js',
        'js/jquery/charts/flot/jquery.flot.tooltip.min.js',
        'js/jquery/charts/flot/jquery.flot.spline.js',
        'js/jquery/charts/flot/jquery.flot.orderBars.js',
        'js/jquery/charts/flot/jquery.flot.pie.min.js'
    ],
    slimScroll: ['js/jquery/slimscroll/jquery.slimscroll.min.js'],
    sortable: ['js/jquery/sortable/jquery.sortable.js'],
    nestable: ['js/jquery/nestable/jquery.nestable.js',
        'js/jquery/nestable/nestable.css'
    ],
    filestyle: ['js/jquery/file/bootstrap-filestyle.min.js'],
    slider: ['js/jquery/slider/bootstrap-slider.js',
        'js/jquery/slider/slider.css'
    ],
    chosen: ['js/jquery/chosen/chosen.jquery.min.js',
        'js/jquery/chosen/chosen.css'
    ],
    TouchSpin: ['js/jquery/spinner/jquery.bootstrap-touchspin.min.js',
        'js/jquery/spinner/jquery.bootstrap-touchspin.css'
    ],
    wysiwyg: ['js/jquery/wysiwyg/bootstrap-wysiwyg.js',
        'js/jquery/wysiwyg/jquery.hotkeys.js'
    ],
    dataTable: ['js/jquery/datatables/jquery.dataTables.min.js',
        'js/jquery/datatables/dataTables.bootstrap.js',
        'js/jquery/datatables/dataTables.bootstrap.css'
    ],
    vectorMap: ['js/jquery/jvectormap/jquery-jvectormap.min.js',
        'js/jquery/jvectormap/jquery-jvectormap-world-mill-en.js',
        'js/jquery/jvectormap/jquery-jvectormap-us-aea-en.js',
        'js/jquery/jvectormap/jquery-jvectormap.css'
    ],
    footable: ['js/jquery/footable/footable.all.min.js',
        'js/jquery/footable/footable.core.css'
    ]
})


.constant('MODULE_CONFIG', {
    select2: ['js/jquery/select2/select2.css',
        'js/jquery/select2/select2-bootstrap.css',
        'js/jquery/select2/select2.min.js',
        'js/modules/ui-select2.js'
    ]
});

angular.module('cons', [])
    .constant('USER_ROLES', {
        all: '*',
        admin: 'Admin',
        emanager: 'ExecutiveManager',
        zmanager: 'ZoneManager',
        hmanager: 'HotelManager',
        supplier: 'SupplierManager',
        agent: 'LogisticAgent',
        customer: 'Customer',
        hoteluser: 'HotelUser',
        supplieruser:'SupplierUser'
    })