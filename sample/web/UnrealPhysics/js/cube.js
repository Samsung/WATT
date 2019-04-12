/*global FVector FTransform FQuat UE4 Module*/

function Cube(world) {
  this._cube = world.SpawnActorStaticMeshActor();
  this._cube.SetMobility(Module.Movable);

  let cube_mesh = UE4.LoadObjectStaticMesh(
    "/Game/StarterContent/Shapes/Shape_Cube.Shape_Cube");
  let wood_material = UE4.LoadObjectMaterial(
    "/Game/StarterContent/Materials/M_Wood_Oak.M_Wood_Oak");

  let component = this._cube.GetStaticMeshComponent();
  component.SetStaticMesh(cube_mesh);
  component.SetMaterial(0, wood_material);

  this._cube_transform = this._cube.GetActorTransform();

  let loc = this._cube.GetActorLocation();
  loc.set_Z(-50);
  this._cube_transform.SetLocation(loc);

  this._intermediate_transform = new FTransform();
  this._trasform_rotation = new FTransform();
  this._trasform_rotation.SetLocation(new FVector(0, 0, 100));
  this._quat = new FQuat();
  this._quat.set_X(0);
};

Cube.prototype.animate = function(elapsed_time) {
  let sin = Math.sin(elapsed_time);
  let alpha = 0.125 * Math.PI * Math.sin(elapsed_time / 7);

  this._quat.set_Y(sin*Math.sin(alpha));
  this._quat.set_Z(sin*Math.cos(alpha));
  this._quat.set_W(Math.cos(elapsed_time));
  this._trasform_rotation.SetRotation(this._quat);

  FTransform.prototype.Multiply(this._intermediate_transform,
    this._cube_transform, this._trasform_rotation);

  this._cube.SetActorTransform(this._intermediate_transform);
};
