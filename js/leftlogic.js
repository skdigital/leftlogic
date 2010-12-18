(function (window, document, undefined) {
  
// Silly WebKit ditched their required support :(
[].forEach.call(document.querySelectorAll('form'), function (form) {
  form.onsubmit = function (event) {
    if (!this.checkValidity()) {
      event.preventDefault();
      this.querySelector(':invalid').focus();
      return false;
    }
  };
});

var qs = document.querySelector && function (q) { return document.querySelector(q); };
qs && window.location.pathname.replace(/(.*?)(?:\/|$)/g, function (lead, c) { 
  if (c && qs('nav a[href$="' + c + '"]')) {
    qs('nav a[href$="' + c + '"]').className = 'selected';
  }
});

var play = document.getElementById('play');

sketchpad(document.body);
var save = false;
if (play) {
  if (sketchpad(play)) {
    
    var playctx = play.firstChild.getContext('2d'),
        others = document.getElementById('others');
    others && others.addEventListener('click', function (event) {
      if (event.target.nodeName == 'IMG') {
        playctx.clearRect(0, 0, playctx.canvas.width, playctx.canvas.height);
        playctx.drawImage(event.target, 0, 0);
      }
    });
    
    
    play.addEventListener('dblclick', function (event) {
      playctx.clearRect(0, 0, playctx.canvas.width, playctx.canvas.height);
      event.preventDefault();
    }, false);
    
    var timer = 0;
    play.firstChild.addEventListener('mouseup', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var client = new XMLHttpRequest();
        client.open("POST", "/savepng.php");
        client.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        client.send('data='+play.firstChild.toDataURL('image/png'));
      }, 2000);
    });
  }
}

function sketchpad(mirror) {
  if (!document.createElement('canvas').getContext('2d')) return;

  var dots = {};

  function Dot(x, y) {
    var dot = this,
        color = colors[~~(Math.random()*colors.length)];

    function animate() {
      ctx.save();
      dot.level += 0.1 * dot.direction;
      if (dot.level < 0.01) dot.level = 0;
      ctx.fillStyle = 'rgba(' + color + ', ' + dot.level + ')';
      if (mirror == body) ctx.clearRect(~~(x / 10) * 10, ~~(y / 10) * 10, 9, 9); // because we're using opacity
      ctx.fillRect(~~(x / 10) * 10, ~~(y / 10) * 10, 9, 9);
      ctx.restore();
      if (mirror == body) {
        if (0 < dot.level && dot.level < 1) {
          dot.timer = setTimeout(animate, 50);
        } else if (dot.level > 1) {
          dot.direction = -1;
          dot.timer = setTimeout(animate, 500);
        }         
      }
    }

    dot.level = mirror == body ? 0 : 1;
    dot.direction = 1;

    if (dots[x+':'+y] !== undefined) {
      dot.level = dots[x+':'+y].level;
      dots[x+':'+y].clear();
    }

    dots[x+':'+y] = dot;

    dot.timer = setTimeout(animate, 50);
  }

  Dot.prototype.clear = function () {
    clearTimeout(this.timer);
  };

  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d'),
      copy = document.createElement('canvas'),
      ctxcopy = copy.getContext('2d'),
      drawing = false,
      body = document.body,
      comp = mirror.currentStyle ? mirror.currentStyle : getComputedStyle(mirror, null),
      left = 0,
      top = 0,
      resizeTimer = null,
      colors = ['234,109,0', '219,64,0', '224,73,0', '224,78,0', '229,95,0', '228,100,0', '229,101,0'],
      obj = mirror;

  do {
    left += obj.offsetLeft;
    top += obj.offsetTop;
  } while (obj = obj.offsetParent);

  if (mirror != body) left += 20; // not sure why, but it works :-S

  // setup the style
  canvas.className = 'game';
  canvas.height = parseInt(comp['height']);
  canvas.width = parseInt(comp['width']);

  ctx.lineWidth = 9;
  ctx.moveTo(1, 1);
  ctx.fillStyle = '#EA6D00';

  // mouse handlers
  canvas.addEventListener('mousemove', function (event) {
    var x, y;
    if (drawing) {
      x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - left;
      y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - top;
      // x = event.clientX + mirror.scrollLeft;
      // y = event.clientY + mirror.scrollTop;
      new Dot(x, y);
    }
  }, false);

  canvas.addEventListener('mousedown', function (event) {
    drawing = true;
    event.preventDefault();
  }, false);

  mirror.addEventListener('mouseup', function (event) {
    x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft) - left;
    y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop) - top;
    // x = event.clientX + mirror.scrollLeft;
    // y = event.clientY + mirror.scrollTop;
    // new Dot(x, y);
    drawing = false;
  }, false);

  window.addEventListener('resize', function (event) {
    clearTimeout(resizeTimer);
    var resizeTimer = setTimeout(function () {
      obj = mirror;
      left = top = 0;
      do {
        left += obj.offsetLeft;
        top += obj.offsetTop;
      } while (obj = obj.offsetParent);
      if (mirror != body) left += 20; // not sure why, but it works :-S
      if (mirror == body) {
        // copy the canvas before it gets resized
        copy.height = canvas.height;
        copy.width = canvas.width;

        ctxcopy.drawImage(canvas, 0, 0);

        canvas.height = mirror.scrollHeight;
        canvas.width = window.innerWidth - 16;

        ctx.drawImage(copy, 0, 0);
        ctx.fillStyle = '#EA6D00';        
      }
    }, 100);
  }, false);

  mirror.insertBefore(canvas, mirror.firstChild);
  return true;
}

})(this, document);  
