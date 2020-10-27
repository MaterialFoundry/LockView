import {registerSettings} from "./src/settings.js";
import {pushControlButtons} from "./src/controlButtons.js";
import {LockViewLayer,Viewbox} from "./src/misc.js";
import {renderSceneConfig,closeSceneConfig} from "./src/sceneConfig.js";
import {_constrainView_Override,pan_OverrideHigherRes,_Override,pan_Override} from "./src/overrides.js";

export const moduleName = "LockView";
let _onMouseWheel_Default; //stores mousewheel zoom
let _onDragCanvasPan_Default; //stores token-to-edge canvas move
export var pan_Default; //stores right-drag canvas move
let _onDragLeftMove_Default
let animatePan_Default;
//let autoScale = 0;
export var viewboxStorage; 
export var viewbox = [];
let windowWidthOld= -1;
let windowHeightOld = -1;
let fitScale = -1;

Hooks.on('ready', ()=>{
  game.socket.on(`module.LockView`, (payload) =>{
    //console.log(payload);
    //draw a box if the TV's client sends their view
    if (game.userId == payload.receiverId && payload.msgType == "lockView_viewport"){
      viewboxStorage = payload;
      if(game.settings.get("LockView","viewbox")){
        let senderNumber;
        let senderNumbers = Array.from(game.users);
        //get index of the sending user
        for (let i=0; i<senderNumbers.length; i++)
          if (senderNumbers[i].data._id == payload.senderId)
            senderNumber = i;
        //check if sending user is in same scene, if not, hide viewbox and return
        if (payload.sceneId != canvas.scene.data._id) {
          if(viewbox[senderNumber] != undefined)
            viewbox[senderNumber].hide();
          return;
        }
        
        //If viewbox doesn't exist for player, create it
        if (viewbox[senderNumber] == undefined){
          viewbox[senderNumber] = new Viewbox();
          canvas.stage.addChild(viewbox[senderNumber]);
          viewbox[senderNumber].init();
        }

        //update viewbox
        viewbox[senderNumber].updateViewbox(
          {
            x: payload.viewPosition.x,
            y: payload.viewPosition.y,
            w: payload.viewWidth/payload.viewPosition.scale,
            h: payload.viewHeight/payload.viewPosition.scale,
            c: parseInt(payload.senderColor.replace(/^#/, ''), 16)
          }
        );
        //viewbox[senderNumber].show;
      }
    }
    else if (payload.msgType == "lockView_getData" && (game.settings.get("LockView","Enable") || (game.settings.get("LockView","ForceEnable") && game.user.isGM == false))){
      sendViewBox(payload.senderId);
    }
    else if (payload.msgType == "lockView_update") {
      if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
      let initX = -1;
      let initY = -1;
      if (payload.autoScale == 1 || payload.autoScale == 2) scaleToFit(payload.autoScale);
      else if (payload.autoScale == 3 && payload.forceInit) updateView(initX,initY,getScale());
      else if (payload.autoScale == 3) updateView(-1,-1,getScale());
      else if (payload.forceInit == true) updateView(initX,initY,canvas.scene.data.initial.scale);
      let lockPan = payload.lockPan;
      let lockZoom = payload.lockZoom;
      setBlocks(lockPan,lockZoom);
    }
    else if (payload.msgType == "lockView_resetView"){
      if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
      let initX = canvas.scene.getFlag('LockView', 'initX');
      let initY = canvas.scene.getFlag('LockView', 'initY');
      let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
      let scale;
      
      if (payload.scaleSett == 0) scale = canvas.scene._viewPosition.scale;
      else if (payload.scaleSett == 1) scale = payload.scale;
      else if (payload.scaleSett == 3){
        if (autoScale == 3) scale = getScale();
        else scale = canvas.scene._viewPosition.scale;
      } 
      else scale = canvas.scene.data.initial.scale;
      
      let lockPanStorage = canvas.scene.getFlag('LockView', 'lockPan');
      let lockZoomStorage = canvas.scene.getFlag('LockView', 'lockZoom');
      let lockPan = false;
      let lockZoom = false;
      setBlocks(lockPan,lockZoom);
      if (payload.autoScale == 1 || payload.autoScale == 2) scaleToFit(payload.autoScale);
      else updateView(initX,initY,scale);
      lockPan = lockPanStorage;
      lockZoom = lockZoomStorage;
      setBlocks(lockPan,lockZoom); 
      
    }
    else if (payload.msgType == "lockView_newViewport"){
      let scale;
      let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
      if (payload.scaleSett == 0) scale = canvas.scene._viewPosition.scale;
      else {
        if (autoScale && payload.scaleSett == 3) scale = getScale();
        else if (autoScale == false && payload.scaleSett == 3) scale = canvas.scene._viewPosition.scale;
        else if (payload.scaleSett == 1) scale = payload.scale;
        else if (payload.type == "shift") scale = scale = canvas.scene._viewPosition.scale;
        else scale = canvas.scene.data.initial.scale;
      }
      let lockPanStorage = canvas.scene.getFlag('LockView', 'lockPan');
      let lockZoomStorage = canvas.scene.getFlag('LockView', 'lockZoom');
      let lockPan = false;
      let lockZoom = false;
      let shiftX = canvas.scene._viewPosition.x;
      let shiftY = canvas.scene._viewPosition.y;
      if (payload.type == "grid"){
        shiftX += payload.shiftX*canvas.scene.data.grid;
        shiftY += payload.shiftY*canvas.scene.data.grid;
      }
      else if (payload.type == "coords"){
        shiftX = payload.shiftX;
        shiftY = payload.shiftY;
      }
      else {
        shiftX = payload.shiftX+canvas.scene._viewPosition.x;
        shiftY = payload.shiftY+canvas.scene._viewPosition.y;
      }
      if (payload.type == "shift" && payload.scaleChange != 0){
        scale = canvas.scene._viewPosition.scale*payload.scaleChange;
      }
      setBlocks(lockPan,lockZoom);
      
      updateView(shiftX,shiftY,scale);
      lockPan = lockPanStorage;
      lockZoom = lockZoomStorage;
      setBlocks(lockPan,lockZoom);
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
  
  registerSettings(); //in ./src/settings.js
});

Hooks.once("canvasInit", (canvas) => {
  canvas.LockView = canvas.stage.addChildAt(new LockViewLayer(canvas), 8);
});

Hooks.on("canvasInit", (canvas) => {
  if (game.user.isGM) {
    for (let i=0; i< viewbox.length; i++)
      if (viewbox[i] != undefined)
        viewbox[i].init();
  }
});
  
Hooks.on('canvasReady',(canvas)=>{
  if (game.user.isGM){
    let payload = {
      "msgType": "lockView_getData",
      "senderId": game.userId
    };
    game.socket.emit(`module.LockView`, payload);
      
    if(canvas.scene.data.flags["LockView"].lockPan){} 
    else canvas.scene.setFlag('LockView', 'lockPan', false);

    if (canvas.scene.data.flags["LockView"].lockZoom){}
    else canvas.scene.setFlag('LockView', 'lockZoom', false);

    if (canvas.scene.data.flags["LockView"].autoScale){}
    else canvas.scene.setFlag('LockView', 'autoScale', 0);
  }
  else if ((game.settings.get("LockView","Enable") || game.settings.get("LockView","ForceEnable")) && canvas.scene.getFlag('LockView', 'lockPan')){
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
  updateSettings();
  checkKeys();
});

Hooks.on('canvasPan',(canvas)=>{
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
  scaleToFit();
  let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  if (fitScale > 0 && fitScale != canvas.scene._viewPosition.scale && (autoScale == 1 || autoScale == 2)){
    if (Math.abs(canvas.scene._viewPosition.scale - fitScale) < 0.015){
      Canvas.prototype.pan = pan_OverrideHigherRes;
      updateView(-1,-1,fitScale);
      let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
      if (lockPan) Canvas.prototype.pan = pan_Override;
      else Canvas.prototype.pan = pan_Default;
    }
  }
  sendViewBox(game.data.users.find(users => users.role == 4)._id);
});

Hooks.on('updateToken',(scene,token,change)=>{
  
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) {
    pushControlButtons(controls);
  }
});

Hooks.on("renderPlayerList", (playerlist,init,users) => {
  if (game.user.isGM == false) return;

  for (let i=0; i< viewbox.length; i++)
    if (viewbox[i] != undefined)
      viewbox[i].hide();

  for (let i=0; i<users.length; i++){
    if(viewbox[i] == undefined){
      viewbox[i] = new Viewbox();
      canvas.stage.addChild(viewbox[i]);
      viewbox[i].init();
    }
  }
  let payload = {
    "msgType": "lockView_getData",
    "senderId": game.userId
  };
  game.socket.emit(`module.LockView`, payload);
});

Hooks.on("renderSceneControls", (controls) => {
  if (canvas == null) return;
  let editEnable;
  if (canvas.scene.getFlag('LockView', 'editViewbox') == undefined){ 
    canvas.scene.setFlag('LockView', 'editViewbox', true);
    editEnable = false;
  }
  else {
    editEnable = canvas.scene.getFlag('LockView', 'editViewbox') ? false : true;
  }
  if (editEnable && controls.activeTool != "EditViewbox"){
    Canvas.prototype._onDragCanvasPan = _onDragCanvasPan_Default;
    Canvas.prototype.pan = pan_Default;
    Canvas.prototype._animatePan = animatePan_Default;
    Canvas.prototype._onDragLeftMove = _onDragLeftMove_Default;
    canvas.scene.setFlag('LockView', 'editViewbox', false);
    return;
  }
});

Hooks.on("renderSceneConfig", (app, html) => {
  renderSceneConfig(app,html);
});

Hooks.on("closeSceneConfig", (app, html) => {
  closeSceneConfig(app,html);
});

//This hook is the last hook that is called when initializing scene. It's used to make sure that the payload that's sent is the most recent
Hooks.on('renderSettings',()=>{
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
    sendViewBox(game.data.users.find(users => users.role == 4)._id);
  let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  setBlocks(lockPan,lockZoom); 
});

export function sendLockView_update(lockPan,lockZoom,autoScale,forceInit){
  let payload = {
    "msgType": "lockView_update",
    "senderId": game.userId, 
    "lockPan": lockPan,
    "lockZoom": lockZoom,
    "autoScale": autoScale,
    "forceInit": forceInit
  };
  game.socket.emit(`module.LockView`, payload);
}

function scaleToFit(force = 0){
  let horizontal;
  let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  if ((autoScale == 1 && force == 0) || force == 1) horizontal = true;
  else if ((autoScale == 2 && force == 0) || force == 2) horizontal = false;
  else return;
  Canvas.prototype.pan = pan_OverrideHigherRes;

  let x = canvas.dimensions.paddingX + canvas.dimensions.sceneWidth/2;
  let y = canvas.dimensions.paddingY + canvas.dimensions.sceneHeight/2;
  let scale = -1;
  if (horizontal){
    let windowWidth = window.innerWidth;
    let sceneWidth = canvas.dimensions.sceneWidth;
    if (windowWidth != windowWidthOld || force > 0){
      windowWidthOld = windowWidth;
      scale = windowWidth/sceneWidth;
      fitScale = Math.round(scale* 2000) / 2000;
      updateView(x,y,scale);
    }
  }
  else{
    let windowHeight = window.innerHeight;
    let sceneHeight = canvas.dimensions.sceneHeight;
    if (windowHeight != windowHeightOld || force > 0){
      windowHeightOld = windowHeight;
      scale = windowHeight/sceneHeight;
      fitScale = Math.round(scale* 2000) / 2000;
      updateView(x,y,scale);
    }
  }
  
  let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  if (lockPan) Canvas.prototype.pan = pan_Override;
  else Canvas.prototype.pan = pan_Default;
}

export function updateSettings(){
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
  let initX = canvas.scene.getFlag('LockView', 'initX');
  let initY = canvas.scene.getFlag('LockView', 'initY');
  let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  let forceInit = canvas.scene.getFlag('LockView', 'forceInit');
  if (autoScale == 1 || autoScale == 2) scaleToFit(autoScale);
  else if (autoScale == 3 && forceInit) updateView(initX,initY,getScale());
  else if (autoScale == 3) updateView(-1,-1,getScale());
  else if (forceInit) updateView(initX,initY,canvas.scene.data.initial.scale);
  setBlocks(lockPan,lockZoom);
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
  sendViewBox(game.data.users.find(users => users.role == 4)._id);
}

//Send data to the GM to draw the viewbox
function sendViewBox(target){
  let payload = {
      "msgType": "lockView_viewport",
      "senderId": game.userId, 
      "senderName": game.user.name,
      "senderColor": game.user.color,
      "receiverId": target, 
      "sceneId": canvas.scene.data._id,
      "viewPosition": canvas.scene._viewPosition,
      "viewWidth": window.innerWidth,
      "viewHeight": window.innerHeight
  };
  game.socket.emit(`module.LockView`, payload);
}

//Block zooming and/or panning
function setBlocks(lockPan,lockZoom){
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;

  if (lockZoom == true) Canvas.prototype._onMouseWheel = _Override;
  else if (lockZoom == false) Canvas.prototype._onMouseWheel = _onMouseWheel_Default;
  
  if (lockPan == true) {
    Canvas.prototype._onDragCanvasPan = _Override;  //draggin token to edge of screen
    Canvas.prototype.pan = pan_Override;  //right-mouse click & zoom
    Canvas.prototype.animatePan = _Override;
  }
  else if (lockPan == false) {
    Canvas.prototype._onDragCanvasPan = _onDragCanvasPan_Default;
    Canvas.prototype.pan = pan_Default;
    Canvas.prototype._animatePan = animatePan_Default;
  }
}

function checkKeys() {
  let fired = false;
  
  window.addEventListener("keydown", async (e) => {
    if (fired){}
    else if (window.Azzu.SettingsTypes.KeyBinding.eventIsForBinding(
      e,
      window.Azzu.SettingsTypes.KeyBinding.parse(game.settings.get('LockView','lockOverride')))
  ) {
      fired = true;
      let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
      let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
      lockPanStorage = lockPan;
      lockPan = false;
      lockZoomStorage = lockZoom;
      lockZoom = false;
      setBlocks(lockPan,lockZoom);
    }
  });

  window.addEventListener("keyup", (e) => {
    fired = false;
    let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
    let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');

    setBlocks(lockPan,lockZoom);
  });
}

