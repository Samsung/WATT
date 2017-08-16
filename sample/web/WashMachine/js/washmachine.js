function begin(objects_number, simulation_frames, test_length) {
  var preview = document.getElementById("preview");
  preview.style.width = window.innerWidth + 'px';
  preview.style.height = window.innerHeight - 4 + 'px';

  Preview.initGraphic(preview);
  var broadphase = new Ammo.btDbvtBroadphase();
  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);

  var solver = new Ammo.btSequentialImpulseConstraintSolver();

  var dynamicWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher,
      broadphase, solver, collisionConfiguration);
  dynamicWorld.setGravity(new Ammo.btVector3(0, -900, 0));

  // ground
  var groundShape = new Ammo.btStaticPlaneShape(
      new Ammo.btVector3(0, 1, 0), 1);
  var transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(0, 0, 0));
  transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
  var groundMotionState = new Ammo.btDefaultMotionState(transform);

  groundRigidBodyCI = new Ammo.btRigidBodyConstructionInfo(0,
      groundMotionState, groundShape, new Ammo.btVector3(0, 0, 0));
  groundRigidBody = new Ammo.btRigidBody(groundRigidBodyCI);
  dynamicWorld.addRigidBody(groundRigidBody);
  var ground = Preview.createBox(200, 2, 200,
      Preview.Vector3(0, 0, 0), Preview.Quaternion(0, 0, 0, 1));

  // falling sphere
  var fallRigidBody = [];
  var sphere = [];
  var sphere_number = objects_number; // max 96 * 6
  var total_mass = 0;
  for (var i = 0; i < sphere_number; ++i) {
    var row = i % 16;
    var col = ((i / 16)|0) % 6;
    var depth = (((i / 16)|0) / 6)|0;
    var mass = 1 + Math.random() * 2;
    total_mass += mass;
    var size = 2 + Math.random();
    var fallShape = (i % 5 == 0 ?
        new Ammo.btBoxShape(new Ammo.btVector3(
            size * 0.5, size * 0.5, size * 0.5)) :
        new Ammo.btSphereShape(size));
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(-45 + 6*row, 55 - 6*depth, -16 + 6*col));
    transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    var fallMotionState = new Ammo.btDefaultMotionState(transform);

    var localInertia = new Ammo.btVector3(0, 0, 0);
    fallShape.calculateLocalInertia(1, localInertia);
    fallRigidBodyCI = new Ammo.btRigidBodyConstructionInfo(mass,
        fallMotionState, fallShape, localInertia);

    fallRigidBody[i] = new Ammo.btRigidBody(fallRigidBodyCI);
    dynamicWorld.addRigidBody(fallRigidBody[i]);
    var pos = Preview.Vector3(-45 + 6*row, 55 - 6*depth, -16 + 6*col);
    var quat = Preview.Quaternion(0, 0, 0, 1);
    sphere[i] = (i % 5 == 0 ?
        Preview.createBox(size, size, size, pos, size) :
        Preview.createSphere(size, pos, quat));
  }

  // drum
  var drumShape = new Ammo.btCompoundShape();

  var partDimensions = [
      new Ammo.btVector3(1, 20, 20),
      new Ammo.btVector3(50, 1, 22),
      new Ammo.btVector3(50, 20, 1),
  ];

  var partShapes = [
      new Ammo.btBoxShape(partDimensions[0]),
      new Ammo.btBoxShape(partDimensions[1]),
      new Ammo.btBoxShape(partDimensions[2]),
  ];

  var partTranslate = [
      new Ammo.btVector3(-49, 0, 0),  // left
      new Ammo.btVector3(49, 0, 0),   // right
      new Ammo.btVector3(0, 20, 0),   // top
      new Ammo.btVector3(0, -20, 0),  // bottom
      new Ammo.btVector3(0, 0, -21),  // front
      new Ammo.btVector3(0, 0, 21)    // back
  ];

  var drumView = [];

  for (var i = 0; i < 6; ++i) {
    var half = (i/2)|0;
  transform.setIdentity();
  transform.setOrigin(partTranslate[i]);
  transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    drumShape.addChildShape(transform, partShapes[half]);

    drumView[i] = Preview.createWireBox(
        2 * partDimensions[half].x(),
        2 * partDimensions[half].y(),
        2 * partDimensions[half].z(),
        Preview.Vector3(
            partTranslate[i].x(),
            partTranslate[i].y() + 41,
            partTranslate[i].z()
          ),
        Preview.Quaternion(0, 0, 0, 1)
    );
  }

transform.setIdentity();
transform.setOrigin(new Ammo.btVector3(0, 41, 0));
transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
  var drumMotionState = new Ammo.btDefaultMotionState(transform);

  drumShape.calculateLocalInertia(5000, localInertia);
  drumRigidBodyCI = new Ammo.btRigidBodyConstructionInfo(5000,
      drumMotionState, drumShape, localInertia);
  drumRigidBody = new Ammo.btRigidBody(drumRigidBodyCI);

  dynamicWorld.addRigidBody(drumRigidBody);

  // pylon
  var pylonShape = new Ammo.btBoxShape(new Ammo.btVector3(2, 30, 20));
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(-52, 31, 0));
  transform.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
  var pylonMotionState = new Ammo.btDefaultMotionState(transform);

  localInertia = new Ammo.btVector3(0, 0, 0);
  pylonShape.calculateLocalInertia(0, localInertia);
  pylonRigidBodyCI = new Ammo.btRigidBodyConstructionInfo(0,
      pylonMotionState, pylonShape, localInertia);

  var pylonRigidBody = new Ammo.btRigidBody(pylonRigidBodyCI);
  dynamicWorld.addRigidBody(pylonRigidBody);
  var pylon = Preview.createBox(4, 60, 40,
      Preview.Vector3(-52, 31, 0), Preview.Quaternion(0, 0, 0, 1));

  // hinge
  var pivot = [
      new Ammo.btVector3(2, 10, 0),
      new Ammo.btVector3(-50, 0, 0)
  ];
  var axis = new Ammo.btVector3(1, 0, 0);
  var hinge = new Ammo.btHingeConstraint(pylonRigidBody, drumRigidBody,
      pivot[0], pivot[1], axis, axis, false);

  dynamicWorld.addConstraint(hinge, true);

  Preview.render();

  var rendered_frames = 0;
  var step_with_preview = function() {
    var elapsedTime = clock.getDelta();
    dynamicWorld.stepSimulation(elapsedTime, 1000, 1/simulation_frames);
    hinge.enableAngularMotor(true, -1 - 0.003 * total_mass);

    for (var i = 0; i < sphere_number; ++i) {
      var motion_state = fallRigidBody[i].getMotionState();
      if (motion_state) {
        var transform = new Ammo.btTransform();
        motion_state.getWorldTransform(transform);
        var p = transform.getOrigin();
        var q = transform.getRotation();
        Preview.updatePosition(sphere[i],
            Preview.Vector3(p.x(), p.y(), p.z()),
            Preview.Quaternion(q.x(), q.y(), q.z(), q.w()));
      }
    }

    motion_state = drumRigidBody.getMotionState();
    if (motion_state) {
      var transform = new Ammo.btTransform();
      motion_state.getWorldTransform(transform);
      var p = transform.getOrigin();
      var q = transform.getRotation();
      for (var i = 0; i < 6; ++i) {
        Preview.updateMatrix(
            drumView[i],
            Preview.constructMatrix(
                Preview.Vector3(p.x(), p.y(), p.z()),
                Preview.Quaternion(q.x(), q.y(), q.z(), q.w()),
                Preview.Vector3(
                    partTranslate[i].x(),
                    partTranslate[i].y(),
                    partTranslate[i].z()
            )));
      }
    }

    motion_state = pylonRigidBody.getMotionState();
    if (motion_state) {
      var transform = new Ammo.btTransform();
      motion_state.getWorldTransform(transform);
      var p = transform.getOrigin();
      var q = transform.getRotation();
      Preview.updatePosition(pylon,
          Preview.Vector3(p.x(), p.y(), p.z()),
          Preview.Quaternion(q.x(), q.y(), q.z(), q.w()));
    }

    Preview.render();
    if (++rendered_frames <= test_length || test_length == 0)
      requestAnimationFrame(step_with_preview);
  }

  var clock = new THREE.Clock();
  step_with_preview();
}
