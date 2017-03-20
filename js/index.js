/*
Copyright (c) 2017 by Jordan Leigh (http://codepen.io/jordizle/pen/haIdo)
Copyright (c) 2017 by David Katz

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

var events = new Events();
events.add = function(obj) {
  obj.events = { };
}
events.implement = function(fn) {
  fn.prototype = Object.create(Events.prototype);
}

function Events() {
  this.events = { };
}
Events.prototype.on = function(name, fn) {
  var events = this.events[name];
  if (events == undefined) {
    this.events[name] = [ fn ];
    this.emit('event:on', fn);
  } else {
    if (events.indexOf(fn) == -1) {
      events.push(fn);
      this.emit('event:on', fn);
    }
  }
  return this;
}
Events.prototype.once = function(name, fn) {
  var events = this.events[name];
  fn.once = true;
  if (!events) {
    this.events[name] = [ fn ];
    this.emit('event:once', fn);
  } else {
    if (events.indexOf(fn) == -1) {
      events.push(fn);
      this.emit('event:once', fn);
    }
  }
  return this;
}
Events.prototype.emit = function(name, args) {
  var events = this.events[name];
  if (events) {
    var i = events.length;
    while(i--) {
      if (events[i]) {
        events[i].call(this, args);
        if (events[i].once) {
          delete events[i];
        }
      }
    }
  }
  return this;
}
Events.prototype.unbind = function(name, fn) {
  if (name) {
    var events = this.events[name];
    if (events) {
      if (fn) {
        var i = events.indexOf(fn);
        if (i != -1) {
          delete events[i];
        }
      } else {
        delete this.events[name];
      }
    }
  } else {
    delete this.events;
    this.events = { };
  }
  return this;
}

var userPrefix;

var prefix = (function () {
  var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('') 
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  userPrefix = {
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };
})();

function bindEvent(element, type, handler) {
  if(element.addEventListener) {
    element.addEventListener(type, handler, false);
  } else {
    element.attachEvent('on' + type, handler);
  }
}

function Viewport(data) {
  events.add(this);

  var self = this;

  this.element = data.element;
  this.fps = data.fps;
  this.sensivity = data.sensivity;
  this.sensivityFade = data.sensivityFade;
  this.touchSensivity = data.touchSensivity;
  this.speed = data.speed;

  this.lastX = 0;
  this.lastY = 0;
  this.mouseX = 0;
  this.mouseY = 0;
  this.distanceX = 0;
  this.distanceY = 0;

  this.positionX = -20;
  this.positionY = -10;
  this.positionZ = 0;
  
  this.torqueX = 0;
  this.torqueY = 0;

  this.scale = 2;

  this.flat = false;
  this.down = false;

  this.previousPositionZ = 0;
  this.previousPositionX = 0;

  this.currentSide = 0;
  this.calculatedSide = 0;


  bindEvent(document, 'mousedown', function() {
    self.down = true;
  });

  bindEvent(document, 'mouseup', function() {
    self.down = false;
  });
  
  bindEvent(document, 'keyup', function() {
    self.down = false;
  });

  bindEvent(document, 'mousemove', function(e) {
    self.mouseX = e.pageX;
    self.mouseY = e.pageY;
  });

  bindEvent(document, 'touchstart', function(e) {

    self.down = true;
    e.touches ? e = e.touches[0] : null;
    self.mouseX = e.pageX / self.touchSensivity;
    self.mouseY = e.pageY / self.touchSensivity;
    self.lastX  = self.mouseX;
    self.lastY  = self.mouseY;
  });

  bindEvent(document, 'touchmove', function(e) {
    if(e.preventDefault) { 
      e.preventDefault();
    }

    if(e.touches.length == 1) {
      e.touches ? e = e.touches[0] : null;

      self.mouseX = e.pageX / self.touchSensivity;
      self.mouseY = e.pageY / self.touchSensivity;
    }
  });

  bindEvent(document, 'touchend', function(e) {
    self.down = false;
  });

  bindEvent(document, 'dblclick', function(e) {
    self.flat = !self.flat;
    self.emit('flatten', { flat: self.flat });
  });

  bindEvent(document, 'keypress', function(e) {
     e = e || window.event;
    switch(e.keyCode) {
        case 45:
            e.preventDefault();
            self.rotate('zoomout');
            break;

        case 43:
            e.preventDefault();
            self.rotate('zoomin');
            break;

        case 108:
            e.preventDefault();
            self.rotate('left');
            break;

        case 114:
            e.preventDefault();
            self.rotate('right');
            break;

        case 100:
            e.preventDefault();
            self.rotate('down');
            break;

        case 117:
            e.preventDefault();
            self.rotate('up');
            break;

        case 49:
            e.preventDefault();
            self.rotate('1');
            break;

        case 50:
            e.preventDefault();
            self.rotate('2');
            break;

        case 51:
            e.preventDefault();
            self.rotate('3');
            break;

        case 52:
            e.preventDefault();
            self.rotate('4');
            break;

        case 53:
            e.preventDefault();
            self.rotate('5');
            break;

        case 54:
            e.preventDefault();
            self.rotate('6');
            break;

        }
  });

  setInterval(this.animate.bind(this), 1000/this.fps);
}
events.implement(Viewport);

Viewport.prototype.rotate = function(direction) {
  switch(direction) {
    case "zoomout":
      this.scale -= 0.5;
      break;
    case "zoomin":
      this.scale += 0.5;
      break;
    case "left":
      this.positionZ -= 90;
      break;
    case "right":
      this.positionZ += 90;
      break;
    case "up":
    this.positionX += 90;
      break;
    case "down":
    this.positionX -= 90;
      break;
    case "1":
      this.positionX = 160;
      this.positionY = 10;
      this.positionZ = 180;
      break;
    case "2":
      this.positionX = 70;
      this.positionY = 0;     
      this.positionZ = 10;
      break;
    case "3":
      this.positionX = 250;    
      this.positionY = 0;
      this.positionZ = -100;
      break;
    case "4":
      this.positionX = 70;    
      this.positionY = 0;
      this.positionZ = 280;
      break;
    case "5":
      this.positionX = 250;
      this.positionY = 0;    
      this.positionZ = -10;
      break;
    case "6":
      this.positionX = -20;    
      this.positionY = -10;    
      this.positionZ = 0;
      break;
  }

  this.doRotate();
}

Viewport.prototype.doRotate = function() {

  if(this.scale != this.previousScale
    || this.positionX != this.previousPositionX 
    || this.positionY != this.previousPositionY
    || this.positionZ != this.previousPositionZ) {
    this.element.style[userPrefix.js + 'Transform'] = 'scale3d(' + this.scale + ','  + this.scale + ',' + this.scale +') rotateX(' + this.positionX + 'deg) rotateY(' + this.positionY + 'deg) rotateZ(' + this.positionZ + 'deg) ';

    this.previousScale = this.scale;
    this.previousPositionX = this.positionX;
    this.previousPositionY = this.positionY;    
    this.previousPositionZ = this.positionZ;
    //this.emit('rotate');
  }
}

Viewport.prototype.animate = function() {

  this.distanceX = (this.mouseX - this.lastX);
  this.distanceY = (this.mouseY - this.lastY);

  this.lastX = this.mouseX;
  this.lastY = this.mouseY;

  if(this.down) {
    this.torqueX = this.torqueX * this.sensivityFade + (this.distanceX * this.speed - this.torqueX) * this.sensivity;
    this.torqueY = this.torqueY * this.sensivityFade + (this.distanceY * this.speed - this.torqueY) * this.sensivity;
  }

  if(Math.abs(this.torqueX) > 1.0 || Math.abs(this.torqueY) > 1.0) {
    if(!this.down) {
      this.torqueX *= this.sensivityFade;
      this.torqueY *= this.sensivityFade;
    }

    this.positionX -= this.torqueY;


    if(this.positionX > 90 && this.positionX < 270) {
      this.positionZ -= this.torqueX;

    } else {
      this.positionZ += this.torqueX;
    }
  }

  this.doRotate();
}
var viewport = new Viewport({
  element: document.getElementsByClassName('cube')[0],
  fps: 20,
  sensivity: .1,
  sensivityFade: .93,
  speed: 2,
  touchSensivity: 1.5
});

function Cube(data) {
  var self = this;

  this.element = data.element;
  this.sides = this.element.getElementsByClassName('side');

  this.viewport = data.viewport;

  this.viewport.on('flatten', function(setting) {
    if (setting.flat) {
       self.flatten();       
    } else {
       self.unflatten(); 
    }
  });

}

Cube.prototype.flatten = function() {
  for(var i = 0; i < this.sides.length; ++i) {
    this.sides[i].classList.add('flat');
  }
}

Cube.prototype.unflatten = function() {
  for(var i = 0; i < this.sides.length; ++i) {
    this.sides[i].classList.remove('flat');
  }
}

new Cube({
  viewport: viewport,
  element: document.getElementsByClassName('cube')[0]
});