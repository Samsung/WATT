/*global FVector UE4 Module */

function Wall(world) {
  this.height = 6;
  this.width = 10;
  this.world = world;

  // Workaround to prevent removing brick from memory
  this.buildFirstBrick();
  // build the wall
  this.build();
}

Wall.prototype.buildFirstBrick = function() {
  let brick_mesh = UE4.LoadObjectStaticMesh(
    "/Game/StarterContent/Shapes/Shape_Cube.Shape_Cube");
  let brick_material = UE4.LoadObjectMaterial(
    "/Game/StarterContent/Materials/M_Concrete_Poured.M_Concrete_Poured");

  let hidden_brick = this.world.SpawnActorStaticMeshActor();
  hidden_brick.SetMobility(Module.Movable);
  hidden_brick.SetActorScale3D(new FVector(0.1, 0.1, 0.1));
  hidden_brick.SetActorLocation(new FVector(0, 0, 110));
  hidden_brick.SetMobility(Module.Stationary);

  let component = hidden_brick.GetStaticMeshComponent();
  component.SetStaticMesh(brick_mesh);
  component.SetMaterial(0, brick_material);
};

Wall.prototype.build = function() {
  let brick_mesh = UE4.LoadObjectStaticMesh(
    "/Game/StarterContent/Shapes/Shape_Cube.Shape_Cube");
  let brick_material = UE4.LoadObjectMaterial(
    "/Game/StarterContent/Materials/M_Concrete_Poured.M_Concrete_Poured");

  for(let row = 0; row < this.height; ++row) {
    for(let col = 0; col < this.width; ++col) {
      let brick = this.world.SpawnActorStaticMeshActor();
      brick.SetMobility(Module.Movable);
      brick.SetActorScale3D(new FVector(
        (row % 2 ?
          (col ? 0.5 : 0.25) :
          (col < this.width - 1 ? 0.5 : 0.25)
        ),
        0.25,
        0.25
      ));
      brick.SetActorLocation(new FVector(
        50*(row % 2 ?
          (col ? col : 0.25) :
          (col === this.width - 1 ? 0.25 : 0.5) + col
        ) - 25 * this.width,
        300,
        25 * row
      ));

      let component = brick.GetStaticMeshComponent();
      component.SetStaticMesh(brick_mesh);
      component.SetMaterial(0, brick_material);
      component.SetSimulatePhysics(true);
    }
  }
};

Wall.prototype.reset = function() {
  let actor_iter = new Module.TObjectIteratorAStaticMeshActor();
  // ommit the cube, first ball and first brick
  actor_iter.Next();
  actor_iter.Next();
  actor_iter.Next();
  while (actor_iter.Next()) {
    actor_iter.Current().SetActorLocation(new FVector(0, 0, -1050000));
  }
  this.build();
};

Wall.prototype.onkeydown = function(e) {
  if (e.keyCode === 82 || e.keyCode === 403) { // reset wall R or red button A
    this.reset();
  }
};
