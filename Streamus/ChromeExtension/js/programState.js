﻿//  A singleton which is used for configuration/debugging purposes currently.
define(function () {
    'use strict';
    var ProgramState = Backbone.Model.extend({
        defaults: {
            isLocal: true
        },
        //  Make sure to update the URL in manifest.json, too.
        getBaseUrl: function() {
            var baseUrl;
            if (this.get('isLocal')) {
                baseUrl = 'http://localhost:61975/';
            } else {
                baseUrl = 'http://ec2-54-234-89-248.compute-1.amazonaws.com/Streamus/';
            }

            return baseUrl;
        }
    });
    
    return new ProgramState();
});