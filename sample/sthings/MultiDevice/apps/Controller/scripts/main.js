socketMock = {
		emit: function () {
			console.log("emit", arguments);
		},
		connected: true,
		on: function (data) {
			console.log("on", arguments);			
		}
}

requirejs([], function() {
  var socket = socketMock;
  var page = 1;
  var i3dShow = document.getElementById("show");

  document.getElementById("leftBtn").addEventListener('click', function() {
    if (socket.connected) {
      socket.emit('message', 'left');
      page = page - 1;
      showCount(page);

      if (page < 1) {
        page = 1;
      }
    }
  });

  document.getElementById("rightBtn").addEventListener('click', function() {
    if (socket.connected) {
      socket.emit('message', 'right');
      page = page + 1;
      showCount(page);

      if (page > 7) {
        page = 7;
      }
      
    }
  });
  
  function showCount(page) {
    if (page === 3) {
      i3dShow.style.visibility='visible';
    } else {
      i3dShow.style.visibility='hidden';
    }
  }

  var container, controls, camera, scene, renderer, animator;
  var isAnimating = false;
  var clock = new THREE.Clock();
  var mixers = [];
  function init() {
    container = document.querySelector("#container");
    container.style.background = "none";

    camera = new THREE.PerspectiveCamera(60, container.offsetWidth / container.offsetHeight, 1, 1000);
    camera.position.y = 100;
    camera.position.z = 300;

    controls = new THREE.OrbitControls(camera);
    controls.enableDamping = true;
    controls.update();

    scene = new THREE.Scene();
    group = new THREE.Group();
    scene.add(group);

    var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    group.add(hemisphereLight);

    var loader = new THREE.FBXLoader();
    console.log(loader);
    loader.load('models/fbx/tiger_run.fbx', function(object) {
      object.mixer = new THREE.AnimationMixer(object);
      mixers.push(object.mixer);

      var action = object.mixer.clipAction(object.animations[0]);
      action.play();

      object.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      })

      scene.add(object);
    })

    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.gammaOutput = true;
    container.appendChild(renderer.domElement)
  }

  function animate() {
    animator = requestAnimationFrame(animate);

    if (mixers.length > 0) {
      for (var i=0; i<mixers.length; i++) {
        mixers[i].update(clock.getDelta());
      }
    }

    renderer.render(scene, camera);
  }

  function hide() {
    if (!isAnimating) {
      return;
    }

    mixers = [];
    isAnimating = false;

    cancelAnimationFrame(animator);
    container.removeChild(renderer.domElement);
  }
  
  document.getElementById("show").addEventListener('click', function() {
    if (socket.connected) {
      if (isAnimating) {
          return;
      }

      init();
      animate();
      isAnimating = true;
    }
  });

  socket.on("message", function(msg) {
    switch(msg) {
      case "show":
        document.getElementById("show").removeAttribute("disabled");
        break;
      case "hide":
        document.getElementById("show").setAttribute("disabled", "");
        hide();
        break;
    }
  });
});