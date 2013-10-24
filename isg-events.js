// isg-events
// 0.0.10

(function(factory){
    
    // Require
    if(typeof(require) !== "undefined") {
        if(typeof(_) == "undefined") _ = require('underscore');
        if(typeof(async) == "undefined") async = require('async');
    }
    
    factory(_, async);
    
}.call(this, function(_, async){

    // Events base by names
    // Use a doubly linked list.
    /* { eventName: {
        last: eventHandler,
        prev: undefined,
        next: {
            prev: eventHandler,
            next: eventHandler
        }
    } } */
    
    // Default variables
    var syncDefault = false;
    var selfDefault = false;
    var limitDefault = null;
    var allEventKey = "*";
    
    // Global index all handlers
    var index = 0;
    
    // Public settings
    
    // Prototyping
    var Events = function(){
        this._eventsSync = syncDefault;
        this._eventsSelf = selfDefault;
        this._eventsAllEventKey = allEventKey;
        this._events = {};
    };
    
    Events.prototype.on = function(name, callback, custom){
        if(!_.isObject(custom)) custom = {};
        var options = {
            context: custom.context? custom.context : this,
            sync: _.isBoolean(custom.sync)? custom.sync : _.isBoolean(this._eventsSync)? this._eventsSync : syncDefault,
            self: _.isBoolean(custom.self)? custom.self : _.isBoolean(this._eventsSelf)? this._eventsSelf : selfDefault,
            limit: _.isNumber(custom.limit) || _.isNull(custom.limi)? custom.limit : limitDefault
        };
        var event = {
            index: index++,
            callback: callback,
            context: options.context,
            sync: options.sync,
            self: options.self,
            limit: options.limit,
            prev: undefined,
            next: undefined
        };
        if(this._events[name]) { // If list 
            event.prev = this._events[name].last;
            this._events[name].last.next = event;
            this._events[name].last = event;
        } else {;
            event.last = event;
            this._events[name] = event;
        } 
        return this;
    };
    
    Events.prototype.once = function(name, callback, options){
        return this.on(name, callback, (options? _.extend(options, {limit: 1}) : {limit: 1}) );
    };
    
    var off = function(self, name, handler){
        if(!handler.prev) { // first
            if(!handler.next) { // last
                delete self._events[name];
            } else { // not last
                self._events[name] = handler.next;
                handler.next.prev = undefined;
                handler.next.last = handler.last;
                handler.next = undefined;
            }
        } else { // not first
            if(!handler.next) { // last
                self._events[name].last = handler.prev;
                handler.prev.next = undefined;
                handler.prev = undefined;
            } else { // not last
                handler.prev.next = handler.next;
                handler.next.prev = handler.prev;
            }
        }
    };
    
    Events.prototype.off = function(query, callback){
        var self = this;
        
        var options = {
            name: _.isString(query.name)? query.name : undefined,
            context: !_.isUndefined(query.context)? query.context : undefined,
            callback: _.isFunction(query.callback)? query.callback : undefined,
            sync: _.isBoolean(query.sync)? query.sync : undefined,
            self: _.isBoolean(query.self)? custom.self : undefined,
            limit: _.isNull(query.limit) || _.isNumber(query.limit)? query.limit : undefined,
        };
        
        var offHandler = function(name, handler){
            if(!_.isUndefined(options.callback) && handler.callback !== options.callback) return;
            if(!_.isUndefined(options.context) && handler.context !== options.context) return;
            if(!_.isUndefined(options.sync) && handler.sync !== options.sync) return;
            if(!_.isUndefined(options.self) && handler.self !== options.sync) return;
            if(!_.isUndefined(options.limit) && handler.limit !== options.limit) return;
            
            off(self, name, handler);
        };
        var offEvent = function(name){
            if(self._events[name]) {
                offHandler(name, self._events[name]);
            }
        };
        var offEvents = function(){
            for(var name in self._events) {
                offEvent(name);
            }
        };
        
        if(_.isUndefined(options.name)) {
            if(_.isUndefined(options.context) && _.isUndefined(options.callback) && _.isUndefined(options.sync) && _.isUndefined(options.limit)) self._events = {};
            else offEvent(options.name);
        } else {
            if(self._events[options.name] && _.isUndefined(options.context) && _.isUndefined(options.callback) && _.isUndefined(options.sync) && _.isUndefined(options.limit)) delete self._events[options.name];
            else offEvents();
        }
    };
    
    Events.prototype.trigger = function(name){
        var self = this;
        var args = _.isArray(arguments[1]) || _.isArguments(arguments[1])? arguments[1] : [];
        var callback = _.isFunction(arguments[1])? arguments[1] : _.isFunction(arguments[2])? arguments[2] : function(){};
        
        var core = function(handler){
            async.nextTick(function(){
                var next = coreNext(handler);
                if(_.isNumber(handler.limit)) {
                    if(handler.limit > 0) handler.limit--;
                    else return next();
                }
                
                var _args = [];
                if(handler.self) _args.push([{
                    index: handler.index,
                    limit: function(limit){
                        if(_.isNumber(limit) || _.isNull(limit)) handler.limit = limit;
                        return handler.limit;
                    },
                    off: function(){
                        off(self, name, handler);
                    },
                }]);
                if(!handler.sync) _args.push([next]);
                _args.push(args);
                
                handler.callback.apply(handler.context, [].concat.apply([], _args));
                if(handler.sync) next();
            });
        }
        
        var coreNext = function(handler){
            var called = false;
            if(handler.next) {
                var next = handler.next;
                return function() {
                    if(!called) {
                        called = true;
                        core(next);
                    }
                }
            } else return function(){
                if(!called && callback) {
                    called = true;
                    callback();
                }
            }
        };
        
        if(self._events[name]) {
            if(name != self._eventsAllEventKey) {
                self.trigger(self._eventsAllEventKey, [name, args], function(){
                    core(self._events[name]);
                })
            } else core(self._events[name]);
        } else {
            if(callback) callback();
        }
    };
    
    // Version
    Events.VERSION = '0.0.10';
    
    // Browser
    this.Events = Events;
    
    // Node.js
    if(typeof(exports) !== 'undefined' && module.exports) module.exports = Events;

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define("isg-events", ["underscore", "async"], function () {
            return Events;
        });
    }
    
}));