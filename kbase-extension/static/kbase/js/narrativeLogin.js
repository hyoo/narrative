/**
 * Uses the user's login information to initialize the IPython environment.
 * This should be one of the very first functions to be run on the page, as it sets up
 * the login widget, and wires the environment together.
 * @author Bill Riehl wjriehl@lbl.gov
 */

define(['jquery', 
        'narrativeConfig',
        'kbaseLogin', 
        'kbapi',
        'base/js/utils'
], function($, 
            Config,
            kbaseLogin, 
            kbapi, 
            JupyterUtils) {
    "use strict";

    var baseUrl = JupyterUtils.get_body_data('baseUrl');

    /* set the auth token by calling the kernel execute method on a function in
     * the magics module
     */
    var ipythonLogin = function(token) {
        window.kb = new KBCacheClient(token);
        $.ajax({
            url: JupyterUtils.url_join_encode(baseUrl, 'login'),
        }).then(
            function(ret) { 
                // console.log(ret); 
            }
        ).fail(
            function(err) { 
                // console.err(err); 
            }
        );
    };

    var ipythonLogout = function() {
        $.ajax({
            url: JupyterUtils.url_join_encode(baseUrl, 'logout'),
        }).then(
            function(ret) { 
                // console.log(ret); 
            }
        ).fail(
            function(err) { 
                // console.err(err); 
            }
        );
        window.location.href = "/";
    };

    var init = function($elem) {
        /**
         * Initialize the login widget and bind login/logout callbacks
         */
        var loginWidget = $elem.kbaseLogin({
            /* If the notebook kernel's initialized, tell it to set the token.
             * This really only gets called when the user does a login on the Narrative page.
             * And since the user needs to be logged in already to get to the Narrative (in production),
             * This shouldn't get called, pretty much ever.
             * So having it fail if no IPython.notebook is present is okay here.
             */
            login_callback: function(args) {
                ipythonLogin(args.token);
            },

            /* If the notebook is present, tell it to clear the token and environment vars,
             * Then redirect to the root page.
             */
            logout_callback: function(args) {
                ipythonLogout();
            },

            /* This is the main path to starting up. Since the user should be coming in already logged
             * in, this will get invoked. It sets up a single-use event that sets up the environment
             * with KBase necessities once the Kernel itself is activated. It also waits 500ms
             * before doing so, due to some lag in processing (hopefully fixed in a later version
             * of IPython).
             */
            prior_login_callback: function(args) {
                ipythonLogin(args.token);
            },
        });

        if (loginWidget.token() === undefined) {
            // include hiding div.
            loginWidget.openDialog();
        }
    };

    return {
        init: init
    };
});