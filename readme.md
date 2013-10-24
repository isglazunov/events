# isg-events
0.0.9

# install

* NPM `npm install isg-events`
* GIT `git clone https://github.com/isglazunov/events.git`
* download from [releases](https://github.com/isglazunov/events/releases)

# require

## Node.js
```js
var Events = require("isg-events");
```

## Browser
```html
<script src="isg-events.js"></script>
```

### `define`
```js
define(["isg-events"], function(Events){});
```
Ability to connect with define.amd added, but not tested. If something is wrong, fix it.

# usage
It is recommended to use in conjunction with the [underscore](https://github.com/jashkenas/underscore) and [async](https://github.com/caolan/async) modules.

## `new Events;`
```js
var events = new Events;
```
```js
var container = _.extend({}, new Events);
```

## `events.on(name, callback[, options]);`
Available options:
```js
{
    sync: false, // true // asynchronous / synchronous call handler.
    context: this, // this in the handler for the default `container`
    self: false, // true // adds the first argument of `self`
    limit: null // Number // how many times to call the handler
}
```

### Asynchronous event
The following will be called only after a call `next`.
```js
container.on("action", function(next, arg1, arg2){
    setTimeout(function(){
        console.log("0");
        next();
    }, 50);
});
```

### Synchronous event.
The function `next` will be called automatically after the call handler.
```js
container.on("action", function(arg1, arg2){
    setTimeout(function(){
        console.log("1");
    }, 100);
}, {sync: true});
```

### Access to the handler.
The handler described below exclude yourself from the list of event handlers immediately after the call.
```js
container.on("action", function(self, next, arg1, arg2){
    self.off();
    setTimeout(function(){
        console.log("2");
        next();
    }, 50);
});
```

## `events.once(name, callback[, options])`
Equivalent to calling: `events.on(name, callback, {limit: 1});`

### `events.trigger(name[[, Array arguments], callback];`
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

### `events.off(query)`
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

# versions