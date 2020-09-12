let _onMouseWheel_Default; //stores mousewheel zoom
let _onDragCanvasPan_Default; //stores token-to-edge canvas move
let pan_Default; //stores right-drag canvas move
let _onDragLeftMove_Default
let animatePan_Default;
let viewWidth;
let viewHeight;
let lockPanOverride = false;
let lockZoomOverride = false;
let lockPan = false;
let lockZoom = false;
let autoScale = false;
let viewboxStorage; 

Hooks.on('ready', ()=>{
  game.socket.on(`module.LockView`, (payload) =>{
    //console.log(payload);
    //draw a box if the TV's client sends their view
    if (game.userId == payload.receiverId && payload.msgType == "lockView_viewport"){
      viewboxStorage = payload;
      if(game.settings.get("LockView","viewbox")){
        if (payload.sceneId != canvas.scene.data._id) {
          tooltip.hide();
          return;
        }
        tooltip.updateTooltip(
          {
            x: payload.viewPosition.x,
            y: payload.viewPosition.y,
            w: payload.viewWidth/payload.viewPosition.scale,
            h: payload.viewHeight/payload.viewPosition.scale,
            c: parseInt(payload.senderColor.replace(/^#/, ''), 16)
          }
        );
      }
    }
    else if (payload.msgType == "lockView_getData" && (game.settings.get("LockView","Enable") || (game.settings.get("LockView","ForceEnable") && game.user.isGM == false))){
      sendViewBox(payload.senderId);
    }
    else if (payload.msgType == "lockView_update") {
      if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
      let scale = getScale();
      if (payload.autoScale) updateView(payload.initX,payload.initY,scale);
      lockPan = payload.lockPan;
      lockZoom = payload.lockZoom;
      setBlocks();
    }
    else if (payload.msgType == "lockView_Override"){
      if (payload.lockPan == true || payload.lockPan == false) lockPanOverride = payload.lockPan; 
      if (payload.lockZoom == true || payload.lockZoom == false) lockZoomOverride = payload.lockZoom; 
      setBlocks();
    }
    else if (payload.msgType == "lockView_resetView"){
      if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
      let initX = canvas.scene.getFlag('LockView', 'initX');
      let initY = canvas.scene.getFlag('LockView', 'initY');
      autoScale = canvas.scene.getFlag('LockView', 'autoScale');
      let scale = getScale();
      
      let lockPanStorage = lockPan;
      let lockZoomStorage = lockZoom;
      lockPan = false;
      lockZoom = false;
      setBlocks();
      updateView(initX,initY,scale);
      lockPan = lockPanStorage;
      lockZoom = lockZoomStorage;
      setBlocks(); 
      
    }
  });
});

Hooks.once('init', function(){
 // CONFIG.debug.hooks = true;
  _onMouseWheel_Default = Canvas.prototype._onMouseWheel;
  _onDragCanvasPan_Default = Canvas.prototype._onDragCanvasPan;
  _onDragLeftMove_Default = Canvas.prototype._onDragLeftMove;
  pan_Default = Canvas.prototype.pan;
  animatePan_Default = Canvas.prototype._animatePan;

  //initialize all settings
  //let config = true;
  //if (game.user.data.isGM) config =
  game.settings.register('LockView','Enable', {
    name: "Enable",
    hint: "Enables the module on the local (TV's) client",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
  });
  game.settings.register("LockView", "ScreenWidth", {
    name: "Screen Width",
    hint: "The real world screen width in mm or inch. Must be set on the local (TV's) client.",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    onChange: x => window.location.reload()
  });
  game.settings.register("LockView", "Gridsize", {
    name: "Gridsize",
    hint: "The real world grid size in mm or inch (e.g. 25 mm or 1 inch). Unit has to be the same as 'Screen Width'. Must be set on the local (TV's) client",
    scope: "client",
    config: true,
    default: 25,
    type: Number,
    onChange: x => window.location.reload()
  });
  game.settings.register('LockView','ForceEnable', {
    name: "Force Enable",
    hint: "Enables the module on all non-GM clients",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
});
  game.settings.register('LockView','viewbox', {
    name: "Display Viewbox",
    hint: "Draws the borders on the GM's screen of what players who have the module enabled can see.",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });
  game.settings.register('LockView','lockOverride', {
    name: "Lock Override",
    hint: "Enter a keybinding to override the zoom and pan lock.",
    scope: "world",
    config: true,
    default: "Alt + Z",
    type: window.Azzu.SettingsTypes.KeyBinding,
  });
  game.settings.register('LockView','lockPanOverride', {
    name: "lockPan override",
    hint: "",
    scope: "world",
    config: false,
    default: false,
    type: Boolean
  });
  game.settings.register('LockView','lockZoomOverride', {
    name: "lockZoom override",
    hint: "",
    scope: "world",
    config: false,
    default: false,
    type: Boolean
  });
});

Hooks.on("renderSceneConfig", (app, html, data) => {
   //fix cyclical issues
  // if ( app.renderCalendarScene) return ; 
   // app.renderCalendarScene = true;

  if(app.object.data.flags["LockView"]){
    if (app.object.data.flags["LockView"].lockPan){} 
    else app.object.setFlag('LockView', 'lockPan', false);

    if (app.object.data.flags["LockView"].lockZoom){} 
    else app.object.setFlag('LockView', 'lockZoom', false);

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
  lockPan = html.find("input[name ='LV_lockPan']").is(":checked");
  lockZoom = html.find("input[name ='LV_lockZoom']").is(":checked");
  autoScale = html.find("input[name ='LV_autoScale']").is(":checked");
  app.object.setFlag('LockView', 'lockPan',lockPan);
  app.object.setFlag('LockView', 'lockZoom',lockZoom);
  app.object.setFlag('LockView', 'autoScale',autoScale);
  if (app.entity.data._id == canvas.scene.data._id){
    
    let initX = canvas.scene.data.initial.x;
    let initY = canvas.scene.data.initial.y;
    canvas.scene.setFlag('LockView','initX',initX);
    canvas.scene.setFlag('LockView','initY',initY);
    let payload = {
      "msgType": "lockView_update",
      "senderId": game.userId, 
      "initX": -1,
      "initY": -1,
      "lockPan": lockPan,
      "lockZoom": lockZoom,
      "autoScale": autoScale
    };
    game.socket.emit(`module.LockView`, payload);
    updateSettings();
  }
});

Hooks.on('canvasReady',(canvas)=>{
  tooltip.init();

  if (game.user.isGM){
    let payload = {
        "msgType": "lockView_getData",
        "senderId": game.userId
    };
    game.socket.emit(`module.LockView`, payload);
  }

  if(game.user.isGM){
    if(canvas.scene.data.flags["LockView"].lockPan){} 
    else canvas.scene.setFlag('LockView', 'lockPan', false);
    //canvas.scene.setFlag('LockView', 'lockPan', canvas.scene.getFlag('LockView', 'lockPanInit'));
    
    if (canvas.scene.data.flags["LockView"].lockZoom){}
    else canvas.scene.setFlag('LockView', 'lockZoom', false);
    //canvas.scene.setFlag('LockView', 'lockZoom', canvas.scene.getFlag('LockView', 'lockZoomInit'));

    if (canvas.scene.data.flags["LockView"].autoScale){}
    else canvas.scene.setFlag('LockView', 'autoScale', false);

    if (canvas.scene.data.flags["LockView"].initX){}
    else {
      if (canvas.scene.data.initial)
        initX = canvas.scene.data.initial.x;
      else initX = -1;
    }

    if (canvas.scene.data.flags["LockView"].initY){}
    else {
      if (canvas.scene.data.initial)
        initY = canvas.scene.data.initial.y;
      else initY = -1;
    } 
  }
  lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  updateSettings();
  checkKeys();
});

Hooks.on('canvasPan',()=>{
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
  for (let i=0; i<game.data.users.length; i++)
    if (game.data.users[i].role > 2) 
      sendViewBox(game.data.users[i]._id);
});

let tooltip;
Hooks.once("canvasInit", (canvas) => {
  tooltip = new Tooltip();
  canvas.stage.addChild(tooltip);
  canvas.LockView = canvas.stage.addChildAt(new LockViewLayer(canvas), 8);
  lockPanOverride = game.settings.get("LockView","lockPanOverride");
  lockZoomOverride = game.settings.get("LockView","lockZoomOverride");
});

Hooks.on("canvasInit", (canvas) => {
  if (game.user._isGM == false) return;
  let payload = {
    "msgType": "lockView_Override",
    "senderId": game.userId, 
    "lockZoom": lockZoomOverride,
    "lockPan": lockPanOverride,
  };
  game.socket.emit(`module.LockView`, payload);

  tooltip.init();
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) {
    controls.push({
      name: "LockView",
      title: "Lock View",
      icon: "fas fa-tv",
      layer: "LockViewLayer",
      tools: [
        {
          name: "resetView",
          title: "Reset View",
          icon: "fas fa-compress-arrows-alt",
          visible: "true",
          onClick: () => {
            let payload = {
              "msgType": "lockView_resetView",
              "senderId": game.userId, 
            };
            game.socket.emit(`module.LockView`, payload);
            },
          button: true
        },
        {
          name: "PanLock",
          title: "Pan Override",
          icon: "fas fa-arrows-alt",
          visible: "true",
          onClick: () => {
            for (let i=0; i<controls.length; i++)
              if(controls[i].name == "LockView")
                for (let j=0; j<controls[i].tools.length; j++)
                  if (controls[i].tools[j].name == "PanLock") {
                    let currentState = controls[i].tools[j].active;
                    let payload = {
                      "msgType": "lockView_Override",
                      "senderId": game.userId, 
                      "lockZoom": -1,
                      "lockPan": currentState,
                    };
                    game.socket.emit(`module.LockView`, payload);
                    game.settings.set("LockView","lockPanOverride",currentState);
                    controls[i].tools[j].active = currentState;
                  }
            },
          toggle: true,
          active: game.settings.get("LockView","lockPanOverride")
        },
        {
          name: "ZoomLock",
          title: "Zoom Override",
          icon: "fas fa-search-plus",
          visible: "true",
          onClick: () => {
            for (let i=0; i<controls.length; i++)
              if(controls[i].name == "LockView")
                for (let j=0; j<controls[i].tools.length; j++)
                  if (controls[i].tools[j].name == "ZoomLock") {
                    let currentState = controls[i].tools[j].active;
                    let payload = {
                      "msgType": "lockView_Override",
                      "senderId": game.userId, 
                      "lockZoom": currentState,
                      "lockPan": -1,
                    };
                    game.socket.emit(`module.LockView`, payload);
                    game.settings.set('LockView', 'lockZoomOverride', currentState);
                    controls[i].tools[j].active = currentState;
                  }
            },
          toggle: true,
          active: game.settings.get("LockView","lockZoomOverride")
        },
        {
          name: "Viewbox",
          title: "Viewbox",
          icon: "fas fa-square",
          visible: "true",
          onClick: () => {
            for (let i=0; i<controls.length; i++)
              if(controls[i].name == "LockView")
                  for (let j=0; j<controls[i].tools.length; j++)
                    if (controls[i].tools[j].name == "Viewbox") {
                      let currentState = controls[i].tools[j].active;
                      if (currentState) {
                        if (viewboxStorage.sceneId != canvas.scene.data._id) {
                          tooltip.hide();
                          return;
                        }
                        tooltip.updateTooltip(
                          {
                            x: viewboxStorage.viewPosition.x,
                            y: viewboxStorage.viewPosition.y,
                            w: viewboxStorage.viewWidth/viewboxStorage.viewPosition.scale,
                            h: viewboxStorage.viewHeight/viewboxStorage.viewPosition.scale,
                            c: parseInt(viewboxStorage.senderColor.replace(/^#/, ''), 16)
                          }
                        );
                        }
                      else tooltip.hide();
                      game.settings.set('LockView', 'viewbox', currentState);
                      controls[i].tools[j].active = currentState;
                    }
            },
          toggle: true,
          active: game.settings.get("LockView","viewbox")
        },
      ],
    });
  }
});

//This hook is the last hook that is called when initializing scene. It's used to make sure that the payload that's sent is the most recent
Hooks.on('renderSettings',()=>{
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
  for (let i=0; i<game.data.users.length; i++)
    if (game.data.users[i].role > 2) 
      sendViewBox(game.data.users[i]._id);
});


function updateSettings(){
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
  let initX = canvas.scene.getFlag('LockView', 'initX');
  let initY = canvas.scene.getFlag('LockView', 'initY');
  lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  let scale = getScale();
  if (autoScale) updateView(initX,initY,scale);
  setBlocks();
}

function getScale(){
  let screenSize = game.settings.get("LockView","ScreenWidth"); //horizontal mm
  let gridSize = game.settings.get("LockView","Gridsize"); //mm
  //Get the horizontal resolution
  let res = screen.width;
  //Get the number of horizontal grid squares that fit on the screen
  let horSq = screenSize/gridSize;
  //Get the number of pixels/gridsquare to get the desired grid size
  let grid = res/horSq;
  //Get the scale factor
  let scale = grid/canvas.scene.data.grid;
  return scale;
}

function updateView(moveX,moveY,scale){
  if (moveX < 0 && moveY < 0) canvas.pan({scale: scale});
  else if (moveX > -1 && moveY < 0) canvas.pan({x: moveX, scale: scale});
  else if (moveX < 0 && moveY > -1) canvas.pan({y: moveY, scale: scale});
  else if (moveX > -1 && moveY > -1) canvas.pan({x: moveX, y: moveY, scale: scale});
  for (let i=0; i<game.data.users.length; i++)
    if (game.data.users[i].role > 2) 
      sendViewBox(game.data.users[i]._id);
}

//Send data to the GM to draw the viewbox
function sendViewBox(target){
  let payload = {
      "msgType": "lockView_viewport",
      "senderId": game.userId, 
      "senderColor": game.user.color,
      "receiverId": target, 
      "sceneId": canvas.scene.data._id,
      "viewPosition": canvas.scene._viewPosition,
      "viewWidth": window.innerWidth,
      "viewHeight": window.innerHeight
  };
  game.socket.emit(`module.LockView`, payload);
}

//let lockPanOverride = false;
//let lockZoomOverride = false;

//Block zooming and/or panning
function setBlocks(){
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;

  if (lockZoom == true && lockZoomOverride == false) Canvas.prototype._onMouseWheel = _Override;
  else if (lockZoom == false || lockZoomOverride == true) Canvas.prototype._onMouseWheel = _onMouseWheel_Default;
  
  if (lockPan == true && lockPanOverride == false) {
    Canvas.prototype._onDragCanvasPan = _Override;
    Canvas.prototype.pan = pan_Override;
    Canvas.prototype._animatePan = animatePan_Override;
    Canvas.prototype._onDragLeftMove = _onDragLeftMove_Override;
  }
  else if (lockPan == false || lockPanOverride == true) {
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

function checkKeys() {
  let fired = false;
  let lockPanStorage;
  let lockZoomStorage;
  window.addEventListener("keydown", async (e) => {
    if (fired){}
    else if (window.Azzu.SettingsTypes.KeyBinding.eventIsForBinding(
      e,
      window.Azzu.SettingsTypes.KeyBinding.parse(game.settings.get('LockView','lockOverride')))
  ) {
      fired = true;
      lockPanStorage = lockPan;
      lockPan = false;
      lockZoomStorage = lockZoom;
      lockZoom = false;
      setBlocks();
    }
  });

  window.addEventListener("keyup", (e) => {
    fired = false;
    lockPan = canvas.scene.getFlag('LockView', 'lockPan');
    lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');

    setBlocks();
  });
}

class LockViewLayer extends PlaceablesLayer {
  constructor() {
    super();
  }

  static get layerOptions() {
    return mergeObject(super.layerOptions, {
      canDragCreate: false,
      objectClass: Note,
      sheetClass: NoteConfig
    });
  }
}

class Tooltip extends CanvasLayer {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.container = new PIXI.Container();
    this.maxWidth = 300;
    this.padding = 6;
    this.margin = 15;
    this.linesMargin = 4;
    this.width = 0;
    this.height = 0;
    this.addChild(this.container);
  }

  async draw() {
    super.draw();
  }

  updateTooltip(data) {
    this.container.removeChildren();
    let height = data.h;
    let width = data.w;
     
    var rect = new PIXI.Graphics();
    // force canvas rendering for rectangle
    rect.cacheAsBitmap = true;
    rect.lineStyle(2, data.c, 1);
    //rect.beginFill(0xffffff, 0.8);
    rect.drawRoundedRect(
      0,
      0,
      data.w,
      data.h,
      3
    );
    
    //rect.endFill();
    this.container.addChild(rect);
   
    let x = data.x,
      y = data.y;

    x -= Math.floor(width / 2);
    y -= Math.floor(height / 2);

    this.container.setTransform(x, y);
    this.container.visible = true;
  }
  
  hide() {
    this.container.visible = false;
  }

  show() {
    this.container.visible = true;
  }
}