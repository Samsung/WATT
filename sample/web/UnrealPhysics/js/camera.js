/*global FVector FTransform FQuat */

function Camera(module) {
  let camera_iter = new module.TObjectIteratorACameraActor();
  this.camera = camera_iter.Current();
  this.manual_move = false;
  this.move_forward = false;
  this.move_backward = false;
  this.rotatation_delta_X = 0;
  this.rotatation_delta_Y = 0;
  this.move_left = false;
  this.move_right = false;
  this.move_up = false;
  this.move_down = false;
  this.rotatation_up = false;
  this.rotatation_down = false;
  this.rotatation_left = false;
  this.rotatation_right = false;
  this.shift_pressed = false;
  this.speed_forward = 130;
  this.speed_angular = 50;
  this.speed_mouse = 0.25;
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
    if (tau > 0) {
      this.current.Blend(this.center, this.right, tau);
    } else {
      this.current.Blend(this.center, this.left, -tau);
    }

    if (this.current.IsValid()) {
      this.camera.SetActorTransform(this.current);
    }
  }
  this.prev_elapsed_time = elapsed_time;
};

Camera.prototype.move = function(delta_time) {
  if (this.move_forward || this.move_backward
      || this.move_right || this.move_left
      || this.move_up || this.move_down ) {
    let loc = this.current.GetLocation();

    if (this.move_forward || this.move_backward) {
      let forward_vector = this.camera.GetActorForwardVector();
      let step = this.speed_forward * delta_time;
      if (this.shift_pressed) {
        step = step * this.run_speedup;
      }
      if (this.move_backward) {
        step = -step;
      }
      forward_vector.multiply_scalar(step);
      loc.add(forward_vector);
    }
    if (this.move_right || this.move_left) {
      let right_vector = this.camera.GetActorRightVector();
      let step = this.speed_side * delta_time;
      if (this.shift_pressed) {
        step = step * this.run_speedup;
      }
      if (this.move_left) {
        step = -step;
      }
      right_vector.multiply_scalar(step);
      loc.add(right_vector);
    }
    if (this.move_up || this.move_down) {
      let up_vector = this.camera.GetActorUpVector();
      let step = this.speed_side * delta_time;
      if (this.shift_pressed) {
        step = step * this.run_speedup;
      }
      if (this.move_down) {
        step = -step;
      }
      up_vector.multiply_scalar(step);
      loc.add(up_vector);
    }

    this.current.SetLocation(loc);
  }
  if (this.rotatation_left || this.rotatation_right 
        || this.rotatation_up || this.rotatation_down
        || this.rotatation_delta_X || this.rotatation_delta_Y) {
    let rotator = this.camera.GetActorRotation(); //FRotator
    let step = this.speed_angular * delta_time;

    if (this.shift_pressed) {
      step = step * this.run_speedup;
    }
    if (this.rotatation_up && rotator.get_Pitch() + step < 90) {
      rotator.set_Pitch(rotator.get_Pitch() + step);
    }
    if (this.rotatation_down && rotator.get_Pitch() - step > -90) {
      rotator.set_Pitch(rotator.get_Pitch() - step);
    }
    if (this.rotatation_left) {
      rotator.set_Yaw(rotator.get_Yaw() - step);
    }
    if (this.rotatation_right) {
      rotator.set_Yaw(rotator.get_Yaw() + step);
    }
    if (this.rotatation_delta_X !== 0) {
      rotator.set_Yaw(rotator.get_Yaw() + this.rotatation_delta_X * this.speed_mouse);
      this.rotatation_delta_X = 0;
    }
    if (this.rotatation_delta_Y !== 0) {
      let rotatationY = rotator.get_Pitch() - this.rotatation_delta_Y * this.speed_mouse;
      if (rotatationY < 90 && rotatationY > -90) {
        rotator.set_Pitch(rotatationY);
        this.rotatation_delta_Y = 0;
      }
    }
    this.current.SetRotation(rotator.Quaternion()); // void SetRotation([Const, Ref] FQuat NewRotation);
  }
};
Camera.prototype.onmousedown = function(e) {
  this.manual_move = true;
};

Camera.prototype.onmousemove = function(e) {
  this.rotatation_delta_X = e.movementX;
  this.rotatation_delta_Y = e.movementY;
};


Camera.prototype.onkeydown = function(e) {
  if (e.keyCode === 87 || e.keyCode === 38) { // key W or up arrow
    this.manual_move = true;
    this.move_forward = true;
    this.move_backward = false;
  }
  else if (e.keyCode === 68 || e.keyCode === 54) { // key D or 6
    this.manual_move = true;
    this.move_left = false;
    this.move_right = true;
  }
  else if (e.keyCode === 65 || e.keyCode === 52) { // key A or 4
    this.manual_move = true;
    this.move_left = true;
    this.move_right = false;
  }
  else if (e.keyCode === 83 || e.keyCode === 40) { // key S or down arrow
    this.manual_move = true;
    this.move_forward = false;
    this.move_backward = true;
  }
  else if (e.keyCode === 16) { // shift
    this.shift_pressed = true;
  }
  else if (e.keyCode === 27 || e.keyCode === 48) { // ESC or 0
    this.manual_move = false;
  }
  else if (e.keyCode === 69 || e.keyCode === 32 || e.keyCode === 55) { // key E or space or 7
    this.manual_move = true;
    this.move_up = true;
    this.move_down = false;
  }
  else if (e.keyCode === 81 || e.keyCode === 67 || e.keyCode === 57) { // key Q or C or 9
    this.manual_move = true;
    this.move_up = false;
    this.move_down = true;
  }
  else if (e.keyCode === 50) { // key 2
    this.manual_move = true;
    this.rotatation_up = true;
    this.rotatation_down = false;
  }
  else if (e.keyCode === 56) { // key 8
    this.manual_move = true;
    this.rotatation_up = false;
    this.rotatation_down = true;
  }
  else if (e.keyCode === 37) { // left arrow
    this.manual_move = true;
    this.rotatation_left = true;
    this.rotatation_right = false;
  }
  else if (e.keyCode === 39) { // right arrow
    this.manual_move = true;
    this.rotatation_left = false;
    this.rotatation_right = true;
  }
};

Camera.prototype.onkeyup = function(e) {

  if (e.keyCode === 16) { // shift
    this.shift_pressed = false;
  } else {
    this.move_forward = false;
    this.move_backward = false;
    this.move_up = false;
    this.move_down = false;
    this.move_left = false;
    this.move_right = false;
    this.rotatation_up = false;
    this.rotatation_down = false;
    this.rotatation_left = false;
    this.rotatation_right = false;

  }
};

Camera.prototype.getActorLocation = function() {
  return this.camera.GetActorLocation();
};

Camera.prototype.getActorForwardVector = function() {
  return this.camera.GetActorForwardVector();
};
