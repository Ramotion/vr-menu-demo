/*
  Simple IO
*/
var IO = function(){
  this.cancel = function(){};
  this.execute = function(c){};
};

function pureIO(x) {
  var i = new IO();

  i.execute = function(c){
    setTimeout(function(){c(x);},0);
  };

  return i;
}

function ioMap(f) {
  return function(i) {
    var n = new IO();

    n.cancel = i.cancel;

    n.execute = function(c){
      i.execute(function(x){
        c(f(x));
      });
    };

    return n;
  }
}

function ioApply(iF) {
  return function(i) {
    var n = new IO();

    n.cancel = function(){
      iF.cancel();
      i.cancel();
    };

    n.execute = function(c){
      var state = {value:null,hasBeenSet:false};
      iF.execute(function(x){
        if(state.hasBeenSet){
          c(x(state.value));
        }else{
          state.value = x;
          state.hasBeenSet = true;
        }
      });

      i.execute(function(x){
        if(state.hasBeenSet){
          c(state.value(x));
        }else{
          state.value = x;
          state.hasBeenSet = true;
        }
      });
    };

    return n;
  }
}

function ioBind(i) {
  return function(f) {
    var n = new IO();

    var state = {cancel:i.cancel};

    n.cancel = function(){
      state.cancel();
    };

    n.execute = function(c){
      i.execute(function(x){
        var j = f(x);
        state.cancel = j.cancel;
        j.execute(c);
      });
    };

    return n;
  }
}

function ioSequence(xs){

  var n = new IO();

  var state = {
    results:new Array(),
    finished:0,
    total:xs.length
  };

  n.cancel = function(){};

  n.execute = function(c){
    if(xs.length === 0)
      c(state.results)

    xs.forEach(function(x,i){
      x.execute(function(r){
        state.results[i] = r;
        state.finished = state.finished + 1;
        if(state.finished === state.total && c !== undefined){
          c(state.results);
        }
      });
    });
  };

  return n;
}

// http req binding to IO
function req(verb,url,params,body){

  function encodeParam(p){
    var e = p[1];
    switch(typeof e){
      case 'undefined':
      case 'null':
        e = '';
        break
      case 'boolean':
      case 'number':
        e = e + '';
        break
      case 'string':
        e = encodeURIComponent(e);
        break
      case 'object':
          e = encodeURIComponent(JSON.stringify(e));
        break
      default:
        console.error('Unexpected query parameter value type!');
        e = '';
    }
    return p[0] + '=' + e + '&'
  }

  var r = new XMLHttpRequest();

  var i = new IO();

  i.cancel = function(){r.abort();};

  i.execute = function(c){

    var fullUrl = url;

    if(params.length > 0){
      fullUrl += ('?' + params.reduce(function(a,x){
        return a + encodeParam(x)
      },'')).slice(0,-1);
    }

    r.timeout = 6000;

    r.ontimeout = function(){
      c({
        'b':{
          'b':'Unable to contact server. Please check your connection and try again.'
        }
      });
    }

    r.onreadystatechange = function(){

      if (r.readyState !== 4) {
        return
      }

      if(r.status === 0){
        c({'b':{'b':'Unable to contact server.'}});
      }else if (r.status !== 200 && r.status !== 201) {
        c({
          'b':{
            'a':{
              'code':r.status,
              'status':r.statusText.substring(r.statusText.indexOf(' ') + 1),
              'body':r.responseText
            }
          }
        });
      }else{
        if(r.responseType == 'json'){
          if(r.responseText.length > 0){
            c({'a':JSON.parse(r.responseText)});
          }else{
            c({'a':null});
          }
        }else{
          c({'a':r.responseText});
        }
      }

    };

    r.open(verb,fullUrl);

    if(body){
      var b;

      if(e instanceof Blob || e instanceof ArrayBufferView){
        r.setRequestHeader("Content-Type", "application/binary");
        b = body;
      }else{
        r.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        b = JSON.stringify(body);
      }

      r.send(b);
    }else{
      r.send();
    }

  };

  return i
}

// faith-based GET in IO
function loadResource(url){
  return ioMap(function(r){
    if(r.a){
      return r.a
    }else{
      console.error(r.b);
    }
  })(req('GET',url,[]));
}

/*
  Graphics
*/

function clamp(x,a,b){
  return x<a?a:b<x?b:x
}

function interp(prc,start,end,curve){
  if(curve===undefined){
    return start + (prc * (end - start))
  }else{
    return start + curve(prc) * (end - start)
  }
}

function interpColor(prc,start,end,curve){
  var c1 = new THREE.Color(start);
  var c2 = new THREE.Color(end);

  return new THREE.Color(interp(prc,c1.r,c2.r,curve),interp(prc,c1.g,c2.g,curve),interp(prc,c1.b,c2.b,curve));
}

function Bezier(x1, y1, x2, y2, epsilon){

  if(!epsilon){
    epsilon = 0.0005
  }

  /* https://github.com/arian/cubic-bezier

    Copyright (c) 2013 Arian Stolwijk

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */
	var curveX = function(t){
		var v = 1 - t;
		return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
	};

	var curveY = function(t){
		var v = 1 - t;
		return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
	};

	var derivativeCurveX = function(t){
		var v = 1 - t;
		return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
	};

	return function(t){

		var x = t, t0, t1, t2, x2, d2, i;

		// First try a few iterations of Newton's method -- normally very fast.
		for (t2 = x, i = 0; i < 8; i++){
			x2 = curveX(t2) - x;
			if (Math.abs(x2) < epsilon) return curveY(t2);
			d2 = derivativeCurveX(t2);
			if (Math.abs(d2) < 1e-6) break;
			t2 = t2 - x2 / d2;
		}

		t0 = 0, t1 = 1, t2 = x;

		if (t2 < t0) return curveY(t0);
		if (t2 > t1) return curveY(t1);

		// Fallback to the bisection method for reliability.
		while (t0 < t1){
			x2 = curveX(t2);
			if (Math.abs(x2 - x) < epsilon) return curveY(t2);
			if (x > x2) t0 = t2;
			else t1 = t2;
			t2 = (t1 - t0) * .5 + t0;
		}

		// Failure
		return curveY(t2);

	};

};
