function Camera(module) {
  let camera_iter = new module.TObjectIteratorACameraActor();
  this.camera = camera_iter.Current();
  this.manual_move = false;
  this.move_forward = false;
  this.move_backward = false;
  this.move_left = false;
  this.move_right = false;
  this.sheft_pressed = false;
  this.speed_forward = 130;
  this.speed_side = 80;
  this.run_speedup = 2.5;

  this.current = new FTransform();
  this.center = new FTransform();
  let camera_angle = Math.atan(0.267);
  let center_quat = new FQuat(0, Math.sin(camera_angle), 0,
  Math.cos(camera_angle));
  this.center.SetRotation(center_quat);
  this.center.SetLocation(new FVector(-300, 0, 200));

  this.left = new FTransform();
  this.right = new FTransform();
  let left_quat = new FQuat(0, 0, 1, -1);
  let right_quat = new FQuat(0, 0, 1, 1);
  left_quat.multiply(center_quat);
  right_quat.multiply(center_quat);

  this.right.SetRotation(right_quat);
  this.right.SetLocation(new FVector(0, -400, 300));

  this.left.SetRotation(left_quat);
  this.left.SetLocation(new FVector(0, 400, 300));
};

Camera.prototype.animate = function(elapsed_time) {
  if (this.manual_move) {
    let delta_time = elapsed_time - this.prev_elapsed_time;
    this.move(delta_time);
    this.camera.SetActorTransform(this.current);
  } else {
    let tau = Math.sin(0.5 * elapsed_time);
    if (tau > 0)
      this.current.Blend(this.center, this.right, tau);
    else
      this.current.Blend(this.center, this.left, -tau);

    if (this.current.IsValid())
      this.camera.SetActorTransform(this.current);
  }
  this.prev_elapsed_time = elapsed_time;
};

Camera.prototype.move = function(delta_time) {
  if (this.move_forward || this.move_backward || this.move_right || this.move_left) {
    let loc = this.current.GetLocation();
    
    if (this.move_forward || this.move_backward) {
      let forward_vector = this.camera.GetActorForwardVector();
      let step = this.speed_forward * delta_time;
      if (this.sheft_pressed)
        step = step * this.run_speedup;
      if (this.move_backward)
        step = -step;
      forward_vector.multiply_scalar(step);
      loc.add(forward_vector);
    }
    if (this.move_right || this.move_left) {
      let right_vector = this.camera.GetActorRightVector();
      let step = this.speed_side * delta_time;
      if (this.sheft_pressed)
        step = step * this.run_speedup;
      if (this.move_left)
        step = -step;
      right_vector.multiply_scalar(step);
      loc.add(right_vector);    
    }

    this.current.SetLocation(loc);
  }
};

Camera.prototype.onkeydown = function(e) {
  console.log("keydown:", e.keyCode);
  if (e.keyCode == 87) { // key W
    this.manual_move = true;
    this.move_forward = true;
    this.move_backward = false;
  }
  else if (e.keyCode == 68) { // key D
    this.manual_move = true;
    this.move_left = false;
    this.move_right = true;
  }
  else if (e.keyCode == 65) { // key A
    this.manual_move = true;
    this.move_left = true;
    this.move_right = false;
  }
  else if (e.keyCode == 83) { // key S
    this.manual_move = true;
    this.move_forward = false;
    this.move_backward = true;
  }
  else if (e.keyCode == 16) { // shift
    this.sheft_pressed = true;
  }
  else if (e.keyCode == 27) { // ESC
    this.manual_move = false;
  }
};

Camera.prototype.onkeyup = function(e) {
  console.log("keyup:", e.keyCode);
  if (e.keyCode == 87) { // key W
    this.move_forward = false;
  }
  else if (e.keyCode == 83) { // key S
    this.move_backward = false;
  }
  else if (e.keyCode == 68) { // key D
    this.move_right = false;
  }
  else if (e.keyCode == 65) { // key A
    this.move_left = false;
  }
  else if (e.keyCode == 16) { // shift
    this.sheft_pressed = false;
  }
};
