# isg-events@0.1.0
Synchronous and asynchronous cross-platform library for organizing events.

## Install

* NPM `npm install isg-events`
* GIT `git clone https://github.com/isglazunov/isg-events.git`
* download from [releases](https://github.com/isglazunov/isg-events/releases)

## Require
Depends on the modules:
* [lodash@2.2.1](https://github.com/lodash/lodash)
* [async@0.2.9](https://github.com/caolan/async)

Indirect dependency
* [isg-connector@0.0.2](https://github.com/isglazunov/isg-connector)

The module can be connected using all supported module [isg-connector@0.0.2](https://github.com/isglazunov/isg-connector) methods.

### window (Browser)
```html
<script src="isg-events.js"></script>
<script>
    var Events = isgEvents.Events;
</script>
```

### define (AMD/Requirejs)
```js
define(['isg-events.js'], function(isgEvents){
    var Events = isgEvents.Events;
});
```

### require (Node.js)
```js
var isgEvents = require('isg-events');
var Events = isgEvents.Events;
```

## Usage

### Available variables

#### isgEvents.version
Contains the current version of the module.

#### isgEvents.dependencies
Contains links to the required modules.

### new Events;
```js
var events = new Events;
```
or
```js
var MyEvents = function(){};
MyEvents.prototype = new Events;
```

### events.on(name, callback[, options]);
Available options:
```js
{
    sync: false, // true // asynchronous / synchronous call handler.
    context: this, // this in the handler for the default `container`
    self: false, // true // adds the first argument of `self`
    limit: null // Number // how many times to call the handler
}
```

#### Asynchronous event
The following will be called only after a call `next`.
```js
container.on("action", function(next, arg1, arg2){
    setTimeout(function(){
        console.log("0");
        next();
    }, 50);
});
```

#### Synchronous event.
The function `next` will be called automatically after the call handler.
```js
container.on("action", function(arg1, arg2){
    setTimeout(function(){
        console.log("1");
    }, 100);
}, {sync: true});
```

#### Access to the handler.
The handler described below exclude yourself from the list of event handlers immediately after the call.
```js
container.on("action", function(self, next, arg1, arg2){
    self.off();
    setTimeout(function(){
        console.log("2");
        next();
    }, 50);
}, {self: true});
```
Available attributes of self variable:
```js
{
    index: Number // Personal index of each handler
    off: Function // Short-cut method to the handler could disable itself
    limit: Function // Returns a copy of the options limit
    // If the first argument is a number or null, the option replaces the limit for him
}
```

### events.once(name, callback[, options]);
Equivalent to calling: `events.on(name, callback, {limit: 1});`

### events.trigger(name[[, Array arguments], callback]);
```js
container.trigger("action", function(){
    console.log("trigger");
}); 
```
If you call the `trigger` after the announcement of the above handlers, the console will look like this:
```js
0
2
trigger
1
```

### events.off(query);
Available query attributes:
```js
{
    name: undefined, // String
    callback: undefined, // Function
    sync: undefined, // Boolean
    context: undefined, // any
    self: undefined, // Boolean
    limit: undefined // Number or Null
}
```
Each specified attribute narrows the scope of the search to detach from the list of handlers.
```js
container.off({
    name: "action"
});
```
Disable all event handlers "action"

## Versions

### 0.1.0
To connect the module used [isg-connector@0.0.2](https://github.com/isglazunov/isg-connector).

### 0.0.12
New requiring method for Node.js.
New configuration prefix. ~~_events~~ to _isgEvents.
Some fixes and cleaning.

### 0.0.11
New requiring methods.
Some fixes.

### 0.0.10
Bigger readme.
Some fixes.

### 0.0.9
The basic functionality.
