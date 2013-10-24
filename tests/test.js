var constructor = function(_, Events) {
    return function(){
        var results = [];
        var container = _.extend({}, new Events);
        if(typeof(window) !== 'undefined') window.container = container;
        
        container.on("*", function(next, event){
            results.push(event);
            next();
        });
        container.on("action", function(next){
            setTimeout(function(){
                results.push(0);
                next();
            }, 50);
        }, {limit: 123});
        
        container.on("action", function(next){
            setTimeout(function(){
                results.push(1);
                next();
            }, 50);
        }, {limit: 1});
        
        container.on("action", function(self, next){
            self.off();
            setTimeout(function(){
                results.push(2);
            }, 100);
        }, {self: true, sync: true});
        
        container.on("action", function(next, number){
            setTimeout(function(){
                results.push(number);
                next();
            }, 50);
        });
        
        container.on("action", function(self, next){
            self.off();
            var _this = this;
            setTimeout(function(){
                results.push(_this.context);
                next();
            }, 50);
        }, {self: true, context: {context: "context"}});
        
        container.trigger("action", [123], function(){
            results.push("again");
            container.trigger("action", function(){
                results.push("done");
            })
        })
        
        setTimeout(function(){
            results.should.eql(['action', 0, 1, 123, 2, "context", 'again', 'action', 0, undefined, 'done']);
            console.log("done")
        }, 500);
    }
}

if (typeof(define) !== 'undefined' && define.amd) {
    define(["../isg-events.js"], function (isgEvents) {
        constructor(_, isgEvents(_, async))();
    });
} else if(typeof(module) !== 'undefined' && module.exports) {
    if(!_ && typeof(require) !== 'undefined') var _ = require('underscore');
    if(!Events && typeof(require) !== 'undefined') var Events = require('../isg-events.js');
    if(typeof(require) !== 'undefined') require('should');
    
    module.exports = constructor(_, Events);
} else {
    constructor(_, isgEvents(_, async))();
}