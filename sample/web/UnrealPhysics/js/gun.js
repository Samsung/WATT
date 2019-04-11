/*global FVector FVector2D FSceneView FSceneViewProjectionData UE4 Module */

function Gun(holder, world) {
  this.bullet_mesh = UE4.LoadObjectStaticMesh(
    "/Game/StarterContent/Shapes/Shape_Sphere.Shape_Sphere");
  this.bullet_material = UE4.LoadObjectMaterial(
    "/Game/StarterContent/Materials/M_Tech_Hex_Tile.M_Tech_Hex_Tile");

  this.reload = 100;
  this.holder = holder;
  this.world = world;

  this.interval = null;

  // Workaround for issue when first ball halts demo
  let hidden_bullet = this.world.SpawnActorStaticMeshActor();
  hidden_bullet.SetMobility(Module.Movable);
  hidden_bullet.SetActorLocation(new FVector(0, 0, 100));
  hidden_bullet.SetActorScale3D(new FVector(0.1, 0.1, 0.1));
  hidden_bullet.SetMobility(Module.Stationary);

  let component = hidden_bullet.GetStaticMeshComponent();
  component.SetStaticMesh(this.bullet_mesh);
  component.SetMaterial(0, this.bullet_material);
}

Gun.prototype.onkeydown = function(e) {
  if ((e.keyCode === 17 || e.keyCode === 49) && !this.interval) { // key ctrl or 1
    this.shoot();
    this.interval = setInterval(this.shoot.bind(this), this.reload);
  }
};

Gun.prototype.onkeyup = function(e) {
  if ((e.keyCode === 17 || e.keyCode === 49) && this.interval) { // key ctrl or 1
    clearInterval(this.interval);
    this.interval = null;
  }
};

Gun.prototype.onmousedown = function(e) {
  this.shoot(e.clientX, e.clientY);
};

Gun.prototype.shoot = function(x, y) {
  let bullet = this.world.SpawnActorStaticMeshActor();
  bullet.SetMobility(Module.Movable);
  let d = Math.random() * 0.3 + 0.2;
  bullet.SetActorScale3D(new FVector(d, d, d));
  bullet.SetActorLocation(this.holder.getActorLocation());

  let component = bullet.GetStaticMeshComponent();
  component.SetStaticMesh(this.bullet_mesh);
  component.SetMaterial(0, this.bullet_material);

  let forward_vector = null;

  if (typeof x !== 'undefined' && typeof y !== 'undefined') {
    let screen = new FVector2D(x, y);
    let pos = new FVector();
    let dir = new FVector();
    let localPlayer = this.world.GetFirstLocalPlayerFromController();
    let projection = new FSceneViewProjectionData();
    if (localPlayer.GetProjectionData(localPlayer.get_ViewportClient().get_Viewport(), Module.eSSP_FULL, projection)) {
      let invertMat = projection.ComputeViewProjectionMatrix().InverseFast();
      FSceneView.prototype.DeprojectScreenToWorld(screen, projection.GetConstrainedViewRect(), invertMat, pos, dir);
      forward_vector = dir;
    }
  }
  if (!forward_vector) {
    forward_vector = this.holder.getActorForwardVector();
  }

  forward_vector.multiply_scalar(1000);
  component.SetAllPhysicsLinearVelocity(forward_vector, false);
  component.SetAllMassScale(2 * d);
  component.SetSimulatePhysics(true);
};
