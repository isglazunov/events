// isg-events@0.1.0
// https://github.com/isglazunov/isg-events

(function(factory){
    
    // isg-connector@0.0.2
    (function(b,constructor,c,d){if(typeof(window)!=='undefined'){var e=[];for(var f in d){e.push(window[d[f]])}this[b]=constructor.apply(null,e)}if(typeof(define)!=='undefined'&&define.amd){var e=['module'];for(var f in c){e.push(c[f])}define(e,function(a){a.exports=constructor.apply(null,[].slice.call(arguments,1))})}if(typeof(module)!=='undefined'&&module.exports&&typeof(require)=='function'){var e=[];for(var f in c){e.push(require(c[f]))}module.exports=constructor.apply(null,e)}return constructor})(
        'isgEvents', factory, ['lodash', 'async'], ['_', 'async']
    );
    
}.call(this, function(_, async){
    
    var isgEvents = {
        index: 0,
        version: '0.1.0',
        dependencies: {
            _: _,
            async: async
        }
    };
    
    isgEvents.Events = function(){
        this._isgEventsSync = false;
        this._isgEventsSelf = false;
        this._isgEventsAllEventName = '*';
        this._isgEventsLimit = null;
        this._isgEvents = {};
    };
    
    isgEvents.off = function(self, name, handler){
        if(!handler.prev) { // first
            if(!handler.next) { // last
                delete self._isgEvents[name];
            } else { // not last
                self._isgEvents[name] = handler.next;
                handler.next.prev = undefined;
                handler.next.last = handler.last;
                handler.next = undefined;
            }
        } else { // not first
            if(!handler.next) { // last
                self._isgEvents[name].last = handler.prev;
                handler.prev.next = undefined;
                handler.prev = undefined;
            } else { // not last
                handler.prev.next = handler.next;
                handler.next.prev = handler.prev;
            }
        }
    };
    
    isgEvents.Events.prototype.on = function(name, callback, options){
        var options = _.isObject(options)? options : {}
        _.defaults(options, {
            context: this,
            sync: this._isgEventsSync,
            self: this._isgEventsSelf,
            limit: this._isgEventsLimit
        });
        var event = {
            index: isgEvents.index++,
            callback: callback,
            context: options.context,
            sync: options.sync,
            self: options.self,
            limit: options.limit,
            prev: undefined,
            next: undefined
        };
        if(!_.isObject(this._isgEvents)) this._isgEvents = {};
        if(this._isgEvents[name]) { // If list 
            event.prev = this._isgEvents[name].last;
            this._isgEvents[name].last.next = event;
            this._isgEvents[name].last = event;
        } else {;
            event.last = event;
            this._isgEvents[name] = event;
        } 
        return this;
    };
    
    isgEvents.Events.prototype.once = function(name, callback, options){
        return this.on(name, callback, (options? _.extend(options, {limit: 1}) : {limit: 1}) );
    };
    
    isgEvents.Events.prototype.off = function(query, callback){
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
            
            isgEvents.off(self, name, handler);
        };
        var offEvent = function(name){
            if(self._isgEvents[name]) {
                offHandler(name, self._isgEvents[name]);
            }
        };
        var offEvents = function(){
            for(var name in self._isgEvents) {
                offEvent(name);
            }
        };
        
        if(!_.isObject(this._isgEvents)) this._isgEvents = {};
        if(_.isUndefined(options.name)) {
            if(_.isUndefined(options.context) && _.isUndefined(options.callback) && _.isUndefined(options.sync) && _.isUndefined(options.limit)) self._isgEvents = {};
            else offEvent(options.name);
        } else {
            if(self._isgEvents[options.name] && _.isUndefined(options.context) && _.isUndefined(options.callback) && _.isUndefined(options.sync) && _.isUndefined(options.limit)) delete self._isgEvents[options.name];
            else offEvents();
        }
    };
    
    isgEvents.Events.prototype.trigger = function(name){
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
                        isgEvents.off(self, name, handler);
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
        
        if(!_.isObject(this._isgEvents)) this._isgEvents = {};
        if(self._isgEvents[name]) {
            if(self._isgEventsAllEventName != name) {
                self.trigger(self._isgEventsAllEventName, [name, args], function(){
                    core(self._isgEvents[name]);
                })
            } else core(self._isgEvents[name]);
        } else {
            if(callback) callback();
        }
    };
    
    return isgEvents;
}));
