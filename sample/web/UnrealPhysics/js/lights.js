/*global FVector Module */

function Lights(world) {
  this.direct_light = world.SpawnActorDirectionalLight();

  this.direct_light.SetMobility(Module.Movable);
  this.direct_light.SetActorRotation(new Module.FRotator(-42, 18, -11));
  this.direct_light.SetMobility(Module.Stationary);

  this.direct_light.SetBrightness(1.6);
}

Lights.prototype.animate = function(elapsed_time) {
};
