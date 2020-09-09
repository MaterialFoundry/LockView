let _onMouseWheel_Default; //stores mousewheel zoom
let _onDragCanvasPan_Default; //stores token-to-edge canvas move
let pan_Default; //stores right-drag canvas move
let _onDragLeftMove_Default
let animatePan_Default;


Hooks.on("renderSceneConfig", (app, html, data) => {
   //fix cyclical issues
  // if ( app.renderCalendarScene) return ; 
   // app.renderCalendarScene = true;

  let lockPan;
  let lockZoom;
  let autoScale;

  if(app.object.data.flags["LockView"]){
    if (app.object.data.flags["LockView"].lockPan){
      lockPan = app.object.getFlag('LockView', 'lockPan');
    } else {
      app.object.setFlag('LockView', 'lockPan', false);
      lockPan = false;
    }

    if (app.object.data.flags["LockView"].lockZoom){
      lockZoom = app.object.getFlag('LockView', 'lockZoom');
    } else {
      app.object.setFlag('LockView', 'lockZoom', false);
      lockZoom = false;
    }  

    if (app.object.data.flags["LockView"].autoScale){
      autoScale = app.object.getFlag('LockView', 'autoScale');
    } else {
      app.object.setFlag('LockView', 'autoScale', false);
      autoScale = false;
    } 
  } else {
    app.object.setFlag('LockView', 'lockPan', false);
    lockPan = false;
    
    app.object.setFlag('LockView', 'lockZoom', false);
    lockZoom = false;

    app.object.setFlag('LockView', 'autoScale', autoScale);
    autoScale = false;
  }

  const fxHtml = `
  <div class="form-group">
      <label>Lock Pan</label>
      <input id="LockView_lockPan" type="checkbox" name="LV_lockPan" data-dtype="Boolean" ${lockPan ? 'checked' : ''}>
      <p class="notes">Disables panning functionality</p>
  </div>
  <div class="form-group">
      <label>Lock Zoom</label>
      <input id="LockView_lockZoom" type="checkbox" name="LV_lockZoom" data-dtype="Boolean" ${lockZoom ? 'checked' : ''}>
      <p class="notes">Disables zooming functionality</p>
  </div>
  <div class="form-group">
      <label>Autoscale</label>
      <input id="LockView_autoScale" type="checkbox" name="LV_autoScale" data-dtype="Boolean" ${autoScale ? 'checked' : ''}>
      <p class="notes">Automatically calculates a scaling factor so the grid is always the same physical size on the screen</p>
  </div>
  `
  const fxFind = html.find("input[name ='initial.x']");
  const formGroup = fxFind.closest(".form-group");
  formGroup.after(fxHtml);
});

Hooks.on("closeSceneConfig", (app, html, data) => {
  app.renderCalendarScene = false;
  let lockPan = html.find("input[name ='LV_lockPan']").is(":checked");
  let lockZoom = html.find("input[name ='LV_lockZoom']").is(":checked");
  let autoScale = html.find("input[name ='LV_autoScale']").is(":checked");
  app.object.setFlag('LockView', 'lockPan',lockPan);
  app.object.setFlag('LockView', 'lockZoom',lockZoom);
  app.object.setFlag('LockView', 'autoScale',autoScale);
  let initX = -1;
  let initY = -1;
  if (app.object.data.initial && lockPan){
    initX = app.object.data.initial.x;
    initY = app.object.data.initial.y;
  }
  app.object.setFlag('LockView', 'initX',initX);
  app.object.setFlag('LockView', 'initY',initY);
  let scale = getScale(app.object.data.grid);
  app.object.setFlag('LockView', 'scale',scale);
  if (game.settings.get("LockView","Enable") == false) return;
  if (autoScale) updateLockView(initX,initY,scale);
  setBlocks(lockPan,lockZoom);
});



function getScale(gridDim){
  let screenSize = game.settings.get("LockView","ScreenWidth"); //horizontal mm
  let gridSize = game.settings.get("LockView","Gridsize"); //mm
  //Get the horizontal resolution
  let res = screen.width;
  //Get the number of horizontal grid squares that fit on the screen
  let horSq = screenSize/gridSize;
  //Get the number of pixels/gridsquare to get the desired grid size
  let grid = res/horSq;
  //Get the scale factor
  return grid/gridDim;
}

function updateLockView(moveX,moveY,scale){
  if (moveX < 0 && moveY < 0) canvas.animatePan({scale: scale});
  else if (moveX > -1 && moveY < 0) canvas.animatePan({x: moveX, scale: scale});
  else if (moveX < 0 && moveY > -1) canvas.animatePan({y: moveY, scale: scale});
  else if (moveX > -1 && moveY > -1) canvas.animatePan({x: moveX, y: moveY, scale: scale});
}

Hooks.once('init', function(){
  _onMouseWheel_Default = Canvas.prototype._onMouseWheel;
  _onDragCanvasPan_Default = Canvas.prototype._onDragCanvasPan;
  _onDragLeftMove_Default = Canvas.prototype._onDragLeftMove;
  pan_Default = Canvas.prototype.pan;
  animatePan_Default = Canvas.prototype._animatePan;

    //initialize all settings
    game.settings.register('LockView','Enable', {
      name: "Enable",
      hint: "Enables the module on the local client",
      scope: "client",
      config: true,
      default: false,
      type: Boolean,
      onChange: x => window.location.reload()
  });
  game.settings.register("LockView", "ScreenWidth", {
    name: "Screen Width",
    hint: "The real world screen width in mm or inch",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    onChange: x => window.location.reload()
  });
  game.settings.register("LockView", "Gridsize", {
    name: "Gridsize",
    hint: "The real world grid size in mm or inch (e.g. 25 mm or 1 inch). Unit has to be the same as 'Screen Width'",
    scope: "client",
    config: true,
    default: 25,
    type: Number,
    onChange: x => window.location.reload()
  });
});

Hooks.on('canvasReady',(canvas)=>{
  if (game.settings.get("LockView","Enable") == false) return;
  let initX = -1;
  let initY = -1;
  let lockPan = false;
  let lockZoom = false;
  let autoScale = false;
  if(canvas.scene.data.flags["LockView"]){
    if (canvas.scene.data.flags["LockView"].lockPan){
      lockPan = canvas.scene.getFlag('LockView', 'lockPan');
    } else {
      canvas.scene.setFlag('LockView', 'lockPan', false);
      lockPan = false;
    }

    if (canvas.scene.data.flags["LockView"].lockZoom){
      lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
    } else {
      canvas.scene.setFlag('LockView', 'lockZoom', false);
      lockZoom = false;
    }

    if (canvas.scene.data.flags["LockView"].autoScale){
      autoScale = canvas.scene.getFlag('LockView', 'autoScale');
    } else {
      canvas.scene.setFlag('LockView', 'autoScale', false);
      autoScale = false;
    }

    if (canvas.scene.data.flags["LockView"].initX){
      initX = canvas.scene.getFlag('LockView', 'initX');
    } else {
      if (canvas.scene.data.initial)
        initX = canvas.scene.data.initial.x;
      else initX = -1;
      canvas.scene.setFlag('LockView', 'initX', initX);
    }

    if (canvas.scene.data.flags["LockView"].initY){
      initY = canvas.scene.getFlag('LockView', 'initY');
    } else {
      if (canvas.scene.data.initial)
        initY = canvas.scene.data.initial.y;
      else initY = -1;
      canvas.scene.setFlag('LockView', 'initY', initY);
    }
  } 
  let scale = canvas.scene.getFlag('LockView', 'scale');
  
  //else Canvas.prototype._onMouseWheel = null;
  if (autoScale) updateLockView(initX,initY,scale);
  setBlocks(lockPan,lockZoom);
});

function setBlocks(lockPan,lockZoom){
  if (game.settings.get("LockView","Enable") == false) return;
  if (lockZoom) Canvas.prototype._onMouseWheel = _Override;
  else Canvas.prototype._onMouseWheel = _onMouseWheel_Default;
  if (lockPan) {
    Canvas.prototype._onDragCanvasPan = _Override;
    Canvas.prototype.pan = pan_Override;
    Canvas.prototype._animatePan = animatePan_Override;
    Canvas.prototype._onDragLeftMove = _onDragLeftMove_Override;
  }
  else {
    Canvas.prototype._onDragCanvasPan = _onDragCanvasPan_Default;
    Canvas.prototype.pan = pan_Default;
    Canvas.prototype._animatePan = animatePan_Default;
    Canvas.prototype._onDragLeftMove = _onDragLeftMove_Default;
  }
}

/**
 * Empty function used to override Canvas.prototype._onMouseWheel and prototype._onDragCanvasPan to prevent zooming and/or panning
 */
function _Override(event) {}

/**
 * Modified pan from foundry.js line 11096
 * Removes the x and y arguents from _constrainView to prevent panning
 */
function pan_Override({x=null, y=null, scale=null}={}) {
    const constrained = this._constrainView({scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
}

/**
 * Modified animatePan from foundry.js line 11134
 * Removes the x and y arguents from _constrainView to prevent panning
 */
async function animatePan_Override({x, y, scale, duration=250, speed}) {
  if ( speed ) {
    let ray = new Ray(this.stage.pivot, {x, y});
    duration = Math.round(ray.distance * 1000 / speed);
  }
  const constrained = this._constrainView({scale});
  const attributes = [
    { parent: this.stage.pivot, attribute: 'x', to: constrained.x },
    { parent: this.stage.pivot, attribute: 'y', to: constrained.y },
    { parent: this.stage.scale, attribute: 'x', to: constrained.scale },
    { parent: this.stage.scale, attribute: 'y', to: constrained.scale },
  ].filter(a => a.to !== undefined);
  await CanvasAnimation.animateLinear(attributes, {
    name: "canvas.animatePan",
    duration: duration,
    ontick: (dt, attributes) => {
      this.hud.align();
      const stage = this.stage;
      Hooks.callAll("canvasPan", this, {x: stage.pivot.x, y: stage.pivot.y, scale: stage.scale.x});
    }
  });
  this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
  canvas.scene._viewPosition = constrained;
}
/**
 * Modified _onDragLeftMove from foundry.js line 11337.
 * Removes the _onDragCanvasPan command, to prevent the canvas from panning if a token is moved close to the edge
*/
function _onDragLeftMove_Override(event) {
  const layer = this.activeLayer;
  const ruler = this.controls.ruler;
  if ( ruler._state > 0 ) return ruler._onMouseMove(event);
  const isSelect = ["select", "target"].includes(game.activeTool);
  if ( isSelect && canvas.controls.select.active ) return this._onDragSelect(event);
  if ( layer instanceof PlaceablesLayer ) layer._onDragLeftMove(event);
}