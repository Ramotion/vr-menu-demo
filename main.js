'use strict';

function main(root, metaScene) {

  var vrDisplay = null;

  function checkVRDisplay() {
    navigator.getVRDisplays().then(function(displays) {
      if (displays.length > 0) {
        vrDisplay = displays[0];
        if (vrDisplay.capabilities.canPresent === false) {
          document.querySelector('button#vr').disabled = true;
        } else {
          document.querySelector('button#vr').disabled = false;
        }
      }
    });
  }

  setInterval(checkVRDisplay, 1000);
  checkVRDisplay();

  var loader = new THREE.TextureLoader();

  function loadTexture(url) {

    var n = new IO();

    n.cancel = function() {};

    n.execute = function(c) {
      loader.load(url, c, function(x) {}, function(x) {
        console.error('problem loading texture: ' + url)
      })
    }

    return n;
  }

  var retrieveDeps = function(nameTransform) {
    return function(xs) {
      return function(io) {
        return ioMap(function(ys) {
          var r = new Object();
          xs.forEach(function(x, i) {
            r[x] = ys[i]
          })
          return r;
        })(ioSequence(xs.map(nameTransform).map(io)))
      }
    }
  }

  var shadersReq = retrieveDeps(function(x) {
    return 'shaders/' + x + '.glsl'
  })(metaScene.shaders)(loadResource);
  var texturesReq = retrieveDeps(function(x) {
    return 'textures/' + x
  })(metaScene.textures)(loadTexture);

  var eventLoopState = {};

  ioApply(ioMap(main1(root, metaScene.scene))(shadersReq))(texturesReq).execute(function(x) {});

  function loop(c) {

    var i = Math.round(Math.random() * 10000000);

    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      eventLoopState[i] = true;

      function looper(c) {
        window.requestAnimationFrame(function() {
          if (eventLoopState[i]) {
            c();
            looper(c);
          }
        });
      }
      looper(c);
    } else {
      eventLoopState[i] = setInterval(c, 1000.0 / 60.0);
    }

    return i;
  }

  function unloop(i) {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      eventLoopState[i] = false;
    } else {
      clearInterval(eventLoopState[i]);
    }
  }

  function main1(root, protoScene) {
    return function(shaders) {
      return function(textures) {

        var s = protoScene(shaders, textures);

        var WIDTH = root.offsetWidth,
          HEIGHT = root.offsetHeight;

        var renderer = new THREE.WebGLRenderer({
          antialias: true
        });

        renderer.setSize(WIDTH, HEIGHT);
        root.appendChild(renderer.domElement);

        var camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
        var controls = new THREE.VRControls(camera);

        var effect = new THREE.VREffect(renderer);

        effect.setSize(WIDTH, HEIGHT);

        var scene = new THREE.Scene();

        var scope = {};

        function create(o) {

          var i = Math.round(Math.random() * 1000000000);

          var children = new Array();

          scope[i] = {
            getChildren: function() {
              return children
            },
            object: o(function(o) {
              var i = create(o);
              children.push(i);
              return i;
            }, lookup, function(i) {
              var ind = children.indexOf(i);
              if (ind !== -1) {
                children = children.splice(ind, 1);
              }
              remove(i);
            })
          };

          if (scope[i].object.obj !== undefined) {
            for (var j = 0; j < scope[i].object.obj.length; j++) {
              scene.add(scope[i].object.obj[j]);
            }
          }

          return i;
        }

        function lookup(i) {
          return scope[i];
        }

        function remove(i) {

          if (scope[i] !== undefined) {

            scope[i].getChildren().forEach(function(c) {
              remove(c);
            });

            if (scope[i].object.obj !== undefined) {
              for (var j = 0; j < scope[i].object.obj.length; j++) {
                scene.remove(scope[i].object.obj[j]);
              }
            }

            delete scope[i];

          }

        }

        function update(i) {

          var s = scope[i];

          if (s === undefined)
            return

          s.getChildren().forEach(function(j) {

            var r = update(j);

            if (r !== undefined) {
              var x = scope[i].object.handle(r);
              if (x) {
                scope[i].object.handle = x;
              }
              remove(j);
            }
          });

          return scope[i].object.update(Date.now(), Date.now() - lastUpdateTime, camera);
        }

        function realTimeUpdate(i) {

          var s = scope[i];

          if (s === undefined)
            return

          s.getChildren().forEach(realTimeUpdate);

          if (scope[i].object.realTimeUpdate) {
            scope[i].object.realTimeUpdate(Date.now(), Date.now() - lastUpdateTime, camera);
          }
        }

        var state = {
          result: undefined
        };

        // update

        var lastUpdateTime = Date.now();
        var paused = false;

        function onVisibilityChange() {
          if (paused) {
            lastUpdateTime = Date.now();
          }
          paused = !paused;
        }

        document.addEventListener('visibilitychange', onVisibilityChange, false);

        // Event loop + rendering

        var state = {
          result: undefined
        };

        state.interval = loop(function() {

          if (paused) {
            return
          }

          controls.update();

          realTimeUpdate(this);

          effect.render(scene, camera);

          if (state.result === undefined) {
            state.result = update(this);
          } else {
            unloop(state.interval);
            console.log('finished program:');
            console.log(state.result);
          }

          lastUpdateTime = Date.now();

        }.bind(create(s)));

        // Fullscreen handling
        // actually super hacky because of mixed notions of builtin fullscreen
        // vs simply making root take up all available browser space...

        var fsState = {
          height: root.offsetHeight,
          width: root.offsetWidth,
          fullScreen: false,
          vr: false
        };

        function onResize(w, h) {
          if (w !== fsState.width || h != fsState.height) {
            effect.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            fsState.width = w;
            fsState.height = h;
          }
        }

        function onVRDisplayPresentChange() {
          fsState.vr = !(fsState.vr);
          onResize(root.offsetWidth, root.offsetHeight);
        }

        // Resize the WebGL canvas when we resize and also when we change modes.
        window.addEventListener('resize', function() {
          onResize(root.offsetWidth, root.offsetHeight);
        });

        window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

        function vrScreenReq() {

          if (!fsState.fullScreen) {
            fsHandler();
          }

          if (vrDisplay.capabilities.canPresent) {
            vrDisplay.requestPresent([{
              source: renderer.domElement
            }]);
          }

        }

        // Button click handlers.

        document.addEventListener('touchmove', function(e) {
          e.preventDefault();
        });

        document.querySelector('button#fullscreen').addEventListener('click', function() {
          enterFullscreen(root);
        });

        document.querySelector('button#vr').addEventListener('click', function() {
          if (fsState.vr) {
            vrDisplay.exitPresent();
          } else {
            vrScreenReq();
          }
        });

        if (document.addEventListener) {
          document.addEventListener('webkitfullscreenchange', fsHandler, false);
          document.addEventListener('mozfullscreenchange', fsHandler, false);
          document.addEventListener('fullscreenchange', fsHandler, false);
          document.addEventListener('MSFullscreenChange', fsHandler, false);
        }

        function fsHandler() {

          if (fsState.fullScreen) {

            if (fsState.vr) {
              vrDisplay.exitPresent();
            }

            fsState.fullScreen = false;
            document.getElementById('screenWrapper').style.maxWidth = fsState.oldValue;

            onResize(root.offsetWidth, root.offsetHeight);

          } else {
            fsState.fullScreen = true;
            fsState.oldValue = document.getElementById('screenWrapper').style.maxWidth;
            document.getElementById('screenWrapper').style.maxWidth = '100%';
            onResize(root.offsetWidth, root.offsetHeight);
          }

        }

        function enterFullscreen(el) {
          if (el.requestFullscreen) {
            el.requestFullscreen();
          } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
          } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
          } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
          } else {
            // no fullscreen support...
            fsHandler();
          }
        }

      }
    }
  };

}
