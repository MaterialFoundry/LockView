import {registerSettings} from "./src/settings.js";
import {pushControlButtons} from "./src/controlButtons.js";
import {registerLayer,Viewbox,drawingConfigApp,closeDrawingConfigApp,getControlledTokens,blackSidebar,getEnable,getViewboxEnable} from "./src/misc.js";
import {renderSceneConfig,closeSceneConfig} from "./src/sceneConfig.js";
import {constrainView_Override,pan_OverrideHigherRes,_Override,pan_Override,onDragCanvasPan_Override,animatePan_Override} from "./src/overrides.js";

export const moduleName = "LockView";
let _onMouseWheel_Default; //stores mousewheel zoom
let _onDragCanvasPan_Default; //stores token-to-edge canvas move
export var pan_Default; //stores right-drag canvas move
let _onDragLeftMove_Default
let animatePan_Default;
let constrainView_Default;
//let autoScale = 0;
export var viewboxStorage; 
export var viewbox = [];
let windowWidthOld= -1;
let windowHeightOld = -1;
let fitScale = -1;
export var scaleMax = CONFIG.Canvas.maxZoom;

//CONFIG.debug.hooks = true;

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
    else if (payload.msgType == "lockView_getData"){
      sendViewBox(payload.senderId);
    }
    else if (payload.msgType == "lockView_update") {
      if (getEnable(game.userId) == false) return;
      let initX = -1;
      let initY = -1;
      if (payload.autoScale > 0 && payload.autoScale < 4) scaleToFit(payload.autoScale);
      else if (payload.autoScale == 4 && payload.forceInit) updateView(initX,initY,getScale());
      else if (payload.autoScale == 4) updateView(-1,-1,getScale());
      else if (payload.forceInit == true) updateView(initX,initY,canvas.scene.data.initial.scale);
      let lockPan = payload.lockPan;
      let lockZoom = payload.lockZoom;
      let boundingBox = payload.boundingBox;
      setBlocks(lockPan,lockZoom,boundingBox);
      
      //set sidebar background 
      let blackenSidebar = (canvas.scene.getFlag("LockView","blackenSidebar") && canvas.scene.getFlag("LockView","excludeSidebar") ? true : false);
      blackSidebar(blackenSidebar);
    }
    else if (payload.msgType == "lockView_resetView"){
      if (getEnable(game.userId) == false) return;
      let initX = canvas.scene.getFlag('LockView', 'initX');
      let initY = canvas.scene.getFlag('LockView', 'initY');
      let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
      let scale;
      
      if (payload.scaleSett == 0) scale = canvas.scene._viewPosition.scale;
      else if (payload.scaleSett == 1) scale = payload.scale;
      else if (payload.scaleSett == 3){
        if (autoScale == 4) scale = getScale();
        else scale = canvas.scene._viewPosition.scale;
      } 
      else scale = canvas.scene.data.initial.scale;
      
      let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
      let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
      let boundingBox = canvas.scene.getFlag('LockView', 'boundingBox');
      setBlocks(false,false,false);
      if (payload.autoScale > 0 && payload.autoScale < 4) scaleToFit(payload.autoScale);
      else updateView(initX,initY,scale);
      setBlocks(lockPan,lockZoom,boundingBox); 
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
      const lockPan = canvas.scene.getFlag('LockView', 'lockPan');
      const lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
      const boundingBox = canvas.scene.getFlag('LockView', 'boundingBox');

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
      setBlocks(false,false,false);
      
      updateView(shiftX,shiftY,scale);

      setBlocks(lockPan,lockZoom,boundingBox);
    }
    else if (payload.msgType == "lockView_forceCanvasPan") forceCanvasPan();
    else if (payload.msgType == "lockView_refreshSettings") {
      if (getEnable(game.userId)) updateSettings();
      else {
        setBlocks(false,false,false,true);
        blackSidebar(false);
      }
      sendViewBox(payload.senderId);
    }
  });
  if (game.settings.get("LockView","updatePopupV1.3.2") == false && game.user.isGM) {
    updatePopup()
  }
});

function updatePopup(){
  let d = new Dialog({
    title: "Lock View update v1.3.2",
    content: `
    <h3>Lock View has been updated to version 1.3.2</h3>
    <p>
    -Some bugs have been fixed<br>
    -You'll now find some new settings in the Scene Configuration screen related to setting up a bounding box.<br>
    -All Lock View settings have been moved to their own section in the Scene Configuration.<br>
    -The module settings now includes a help button, there you'll find more info on these new functions and all other Lock View Functions.<br>
    -The 'Enable' and 'Force Enable' settings have been removed, in favor or a 'User Configuration' screen that you will find in the module settings.<br>
    <br>
    <b>The old enable settings no longer work, you need to set them up in the new User Configuration screen in the Module Settings</b><br>
    <br>
    <input type="checkbox" name="hide" data-dtype="Boolean">
    Don't show this screen again
    </p>`,
    buttons: {
     ok: {
      icon: '<i class="fas fa-check"></i>',
      label: "OK"
     }
    },
    default: "OK",
    close: html => {
      if (html.find("input[name ='hide']").is(":checked")) game.settings.set("LockView","updatePopupV1.3.2",true);
    }
   });
   d.render(true);
}


Hooks.once('init', function(){
 // CONFIG.debug.hooks = true;
  _onMouseWheel_Default = Canvas.prototype._onMouseWheel;
  _onDragCanvasPan_Default = Canvas.prototype._onDragCanvasPan;
  _onDragLeftMove_Default = Canvas.prototype._onDragLeftMove;
  pan_Default = Canvas.prototype.pan;
  animatePan_Default = Canvas.prototype.animatePan;
  constrainView_Default = Canvas.prototype._constrainView;
  
  registerSettings(); //in ./src/settings.js
  registerLayer();
});

Hooks.on("canvasInit", (canvas) => {
  if (game.user.isGM) {
    for (let i=0; i< viewbox.length; i++)
      if (viewbox[i] != undefined)
        viewbox[i].hide();
  }
});
  
Hooks.on('canvasReady',(canvas)=>{
  if (game.user.isGM){
    let payload = {
      "msgType": "lockView_getData",
      "senderId": game.userId
    };
    game.socket.emit(`module.LockView`, payload);
    
    if (canvas.scene.data.flags["LockView"] == undefined){
      canvas.scene.setFlag('LockView', 'lockPan', false);
      canvas.scene.setFlag('LockView', 'lockZoom', false);
      canvas.scene.setFlag('LockView', 'autoScale', 0);
      canvas.scene.setFlag('LockView', 'boundingBox', 0);
    }
    else {
      if(canvas.scene.data.flags["LockView"].lockPan){} 
      else canvas.scene.setFlag('LockView', 'lockPan', false);
  
      if (canvas.scene.data.flags["LockView"].lockZoom){}
      else canvas.scene.setFlag('LockView', 'lockZoom', false);
  
      if (canvas.scene.data.flags["LockView"].autoScale){}
      else canvas.scene.setFlag('LockView', 'autoScale', 0);

      if (canvas.scene.data.flags["LockView"].boundingBox){}
      else canvas.scene.setFlag('LockView', 'boundingBox', 0);
    }
    
  }
  if (getEnable(game.userId)){
    if (canvas.scene.getFlag('LockView', 'lockPan')){
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
    if (canvas.scene.getFlag('LockView', 'boundingBox'))
      Canvas.prototype.pan = pan_OverrideHigherRes;
    else
      Canvas.prototype.pan = pan_Default;

  updateSettings();
  checkKeys();
  forceCanvasPan();
 
  scaleToFit();
  let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  if (fitScale > 0 && fitScale != canvas.scene._viewPosition.scale && (autoScale > 0 && autoScale < 4)){
      updateView(-1,-1,fitScale);
  }
  sendViewBox(game.data.users.find(users => users.role == 4)._id);
  }
  
});

Hooks.on('canvasPan',(canvas,data)=>{
  if (getEnable(game.userId)) {
    scaleMax = CONFIG.Canvas.maxZoom;
    scaleToFit();
    let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
    if (fitScale > 0 && fitScale != canvas.scene._viewPosition.scale && (autoScale > 0 && autoScale < 4)){
      if (Math.abs(canvas.scene._viewPosition.scale - fitScale) < 0.015){
        Canvas.prototype.pan = pan_OverrideHigherRes;
        updateView(-1,-1,fitScale);
        let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
        if (lockPan) Canvas.prototype.pan = pan_Override;
        else if (canvas.scene.getFlag('LockView', 'boundingBox')==false) Canvas.prototype.pan = pan_Default;
      }
    }
  }
  sendViewBox(game.data.users.find(users => users.role == 4)._id,data);
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) {
    pushControlButtons(controls);
  }
});

Hooks.on("updateDrawing",()=>{
  if (getEnable(game.userId) == false) return;
  forceCanvasPan();
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
    Canvas.prototype.animatePan = animatePan_Default;
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

Hooks.on("sidebarCollapse", () => {
  updateSettings();
})

//This hook is the last hook that is called when initializing scene. It's used to make sure that the payload that's sent is the most recent
Hooks.on('renderSettings',()=>{
  //sendViewBox(game.data.users.find(users => users.role == 4)._id);
  if (getEnable(game.userId) == false) return;
  const lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  const lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  const boundingBox = canvas.scene.getFlag('LockView', 'boundingBox');
  setBlocks(lockPan,lockZoom,boundingBox); 
});

Hooks.on("renderDrawingConfig", (app,html,data)=>{
  drawingConfigApp(app, html, data)
});

Hooks.on("closeDrawingConfig", (app,html)=>{
  closeDrawingConfigApp(app, html)
});

Hooks.on("closePermissionControl", ()=> {
  getControlledTokens();
});

Hooks.on("updateActor", ()=> {
  getControlledTokens();
});

export function forceCanvasPan(){
  if (getEnable(game.userId) == false) return;
  let position = canvas.scene._viewPosition;
  position.x = position.x+1;
  position.y = position.y+1;
  position.scale = position.scale+0.01;
  canvas.pan(position);
}

export function sendLockView_update(lockPan,lockZoom,autoScale,forceInit,boundingBox){
  let payload = {
    "msgType": "lockView_update",
    "senderId": game.userId, 
    "lockPan": lockPan,
    "lockZoom": lockZoom,
    "autoScale": autoScale,
    "forceInit": forceInit,
    "boundingBox": boundingBox
  };
  game.socket.emit(`module.LockView`, payload);
}

function scaleToFit(force = 0){
  
  let horizontal;
  let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  let excludeSidebar = false;
  let sidebarOffset = 0;
  if (canvas.scene.getFlag("LockView","excludeSidebar") && ui.sidebar._collapsed == false) {
    excludeSidebar = true;
    sidebarOffset = window.innerWidth-ui.sidebar._element[0].offsetLeft;
  }
  
  if ((autoScale == 1 && force == 0) || force == 1) horizontal = true;
  else if ((autoScale == 2 && force == 0) || force == 2) horizontal = false;
  else if ((autoScale == 3 && force == 0) || force == 3) {
    if (((window.innerWidth-sidebarOffset) / canvas.dimensions.sceneWidth) > (window.innerHeight / canvas.dimensions.sceneHeight)) horizontal = true;
    else horizontal = false;
  }
  else return;
  Canvas.prototype.pan = pan_OverrideHigherRes;
  let scale = -1;
  if (horizontal){
    let windowWidth = window.innerWidth;
    let sceneWidth = canvas.dimensions.sceneWidth;
    if (windowWidth != windowWidthOld || force > 0){
      windowWidthOld = windowWidth;
      scale = (windowWidth-sidebarOffset)/sceneWidth;
      let x = canvas.dimensions.paddingX + (canvas.dimensions.sceneWidth+sidebarOffset/scale)/2;
      let y = canvas.dimensions.paddingY + canvas.dimensions.sceneHeight/2;
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
      let x = canvas.dimensions.paddingX + (canvas.dimensions.sceneWidth+sidebarOffset/scale)/2;
      let y = canvas.dimensions.paddingY + canvas.dimensions.sceneHeight/2;
      fitScale = Math.round(scale* 2000) / 2000;
      updateView(x,y,scale);
    }
  }
  
  let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  if (lockPan) Canvas.prototype.pan = pan_Override;
  else if (canvas.scene.getFlag('LockView', 'boundingBox')) Canvas.prototype.pan = pan_OverrideHigherRes;
  else Canvas.prototype.pan = pan_Default;
}

export function updateSettings(){
  if (getEnable(game.userId) == false) return;
  let initX = canvas.scene.getFlag('LockView', 'initX');
  let initY = canvas.scene.getFlag('LockView', 'initY');
  let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  let boundingBox = canvas.scene.getFlag('LockView', 'boundingBox');
  let autoScale = canvas.scene.getFlag('LockView', 'autoScale');
  let forceInit = canvas.scene.getFlag('LockView', 'forceInit');

  if (autoScale > 0 && autoScale < 4) scaleToFit(autoScale);
  else if (autoScale == 4 && forceInit) updateView(initX,initY,getScale());
  else if (autoScale == 4) updateView(-1,-1,getScale());
  else if (forceInit) updateView(initX,initY,canvas.scene.data.initial.scale);
  setBlocks(lockPan,lockZoom,boundingBox);
  //set sidebar background 
  let blackenSidebar = (canvas.scene.getFlag("LockView","blackenSidebar") && canvas.scene.getFlag("LockView","excludeSidebar") ? true : false);
  blackSidebar(blackenSidebar);
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
function sendViewBox(target,viewPosition=undefined){
  if (getViewboxEnable(game.userId)==false) return;
  if (viewPosition == undefined) viewPosition = canvas.scene._viewPosition;

  const excludeSidebar = canvas.scene.getFlag('LockView', 'excludeSidebar');
  const blackSidebar = canvas.scene.getFlag('LockView', 'blackenSidebar');
  let viewPositionNew = {
    x: viewPosition.x,
    y: viewPosition.y,
    scale: viewPosition.scale
  }
  let offset = 0;
  if (ui.sidebar._collapsed == false && excludeSidebar && blackSidebar){
    offset = (window.innerWidth-ui.sidebar._element[0].offsetLeft);
    viewPositionNew.x -= offset/(2*viewPosition.scale);
  }
  let payload = {
      "msgType": "lockView_viewport",
      "senderId": game.userId, 
      "senderName": game.user.name,
      "senderColor": game.user.color,
      "receiverId": target, 
      "sceneId": canvas.scene.data._id,
      "viewPosition": viewPositionNew,
      "viewWidth": window.innerWidth-offset,
      "viewHeight": window.innerHeight
  };

  game.socket.emit(`module.LockView`, payload);
}

//Block zooming and/or panning
export function setBlocks(lockPan,lockZoom,boundingBox,force=false){
  if (force==false && getEnable(game.userId) == false) return;

  if (lockZoom == true) Canvas.prototype._onMouseWheel = _Override;
  else if (lockZoom == false) Canvas.prototype._onMouseWheel = _onMouseWheel_Default;

  if (lockPan) {
    Canvas.prototype._onDragCanvasPan = _Override;  //draggin token to edge of screen
    Canvas.prototype.pan = pan_Override;  //right-mouse click & zoom
    Canvas.prototype.animatePan = _Override;
  }
  else if (boundingBox){
    Canvas.prototype.pan = pan_OverrideHigherRes;
    Canvas.prototype._onDragCanvasPan = onDragCanvasPan_Override;
    Canvas.prototype.animatePan = animatePan_Override;
    //Canvas.prototype.animatePan = _Override;
  }
  else if (lockPan == false && boundingBox == false) {
    Canvas.prototype._onDragCanvasPan = _onDragCanvasPan_Default;
    Canvas.prototype.pan = pan_Default;
    Canvas.prototype.animatePan = animatePan_Default;
  }
}

function checkKeys() {
  /*
  let fired = false;
  
  window.addEventListener("keydown", async (e) => {
    if (fired){}
    else if (window.Azzu.SettingsTypes.KeyBinding.eventIsForBinding(
      e,
      window.Azzu.SettingsTypes.KeyBinding.parse(game.settings.get('LockView','lockOverride')))
  ) {
      fired = true;
      setBlocks(false,false,false);
    }
  });

  window.addEventListener("keyup", (e) => {
    fired = false;
    const lockPan = canvas.scene.getFlag('LockView', 'lockPan');
    const lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
    const boundingBox = canvas.scene.getFlag('LockView', 'boundingBox');
    setBlocks(lockPan,lockZoom,boundingBox);
  });
  */
}