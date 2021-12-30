import { compatibleCore, getEnable } from "./misc.js";
import { getFlags, setBlocks, updatePanLock, updateZoomLock, updateBoundingBox, lockPan, lockZoom, boundingBox, _onMouseWheel_Default } from "./blocks.js";
import * as VIEWBOX from "./viewbox.js";

let oldVB_viewPosition;

export function registerLayer() {
  const layers =  compatibleCore("0.9") ? {
    lockview: {
          layerClass: LockViewLayer,
          group: "primary"
      }
  }
  : {
    lockview: LockViewLayer
  }

  CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);

    if (!Object.is(Canvas.layers, CONFIG.Canvas.layers)) {
        const layers = Canvas.layers;
        Object.defineProperty(Canvas, 'layers', {
            get: function () {
                return foundry.utils.mergeObject(layers, CONFIG.Canvas.layers)
            }
        })
    }
}

class LockViewLayer extends CanvasLayer {
  constructor() {
    super();
  }

  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: "lockview",
      zIndex: 245,
    });
  }

  activate() {
    CanvasLayer.prototype.activate.apply(this);
    return this;
  }

  deactivate() {
    CanvasLayer.prototype.deactivate.apply(this);
    return this;
  }

  async draw() {
    super.draw();
  }
}

/*
 * Push the Lock View control buttons
 */
export function pushControlButtons(controls){
  if (game.user.isGM == false || canvas == null) return;

  getFlags();

  controls.push({
    name: "LockView",
    title: "Lock View",
    icon: "fas fa-tv",
    layer: "lockview",
    activeTool: "resetView",
    tools: [
      {
        name: "resetView",
        title: game.i18n.localize("LockView.ControlBtns.Label_SetView"),
        icon: "fas fa-compress-arrows-alt",
        visible: true,
        button: true,
        onClick: () => { setViewDialog(controls) }
      },
      {
        name: "PanLock",
        title: game.i18n.localize("LockView.ControlBtns.Label_PanLock"),
        icon: "fas fa-arrows-alt",
        visible: true,
        onClick: () => {
          controls.find(controls => controls.name == "LockView").activeTool = undefined;
          mouseManager(false);
          ui.controls.render();
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock");
          let currentState = currentTool.active;
          updatePanLock(currentState);
          currentTool.active = currentState;   
          },
        toggle: true,
        active: lockPan
      },
      {
        name: "ZoomLock",
        title: game.i18n.localize("LockView.ControlBtns.Label_ZoomLock"),
        icon: "fas fa-search-plus",
        visible: true,
        onClick: () => {
          controls.find(controls => controls.name == "LockView").activeTool = undefined;
          mouseManager(false);
          ui.controls.render();
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock");
          let currentState = currentTool.active;
          updateZoomLock(currentState);
          currentTool.active = currentState;
          },
        toggle: true,
        active: lockZoom
      },
      {
        name: "BoundingBox",
        title: game.i18n.localize("LockView.ControlBtns.Label_BoundingBox"),
        icon: "fas fa-box",
        visible: true,
        onClick: () => {
          controls.find(controls => controls.name == "LockView").activeTool = undefined;
          mouseManager(false);
          ui.controls.render();
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "BoundingBox");
          let currentState = currentTool.active;
          updateBoundingBox(currentState);
          currentTool.active = currentState;
          },
        toggle: true,
        active: boundingBox
      },
      {
        name: "Viewbox",
        title: game.i18n.localize("LockView.ControlBtns.Label_Viewbox"),
        icon: "far fa-square",
        visible: true,
        onClick: () => {
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox");
          let currentState = currentTool.active;
          viewbox(currentState,currentTool);
        },
        toggle: true,
        active: game.settings.get("LockView","viewbox")
      },
      {
        name: "EditViewbox",
        title: game.i18n.localize("LockView.ControlBtns.Label_EditViewbox"),
        icon: "fas fa-vector-square",
        visible: true,
        onClick: () => { editViewboxConfig(controls) },
        toggle: false,
        active: game.settings.get("LockView","editViewbox")
      },
    ],
  });
}

export async function viewbox(currentState,currentTool=false){
  await game.settings.set("LockView","viewbox",currentState);
  if (currentState) {
    if (VIEWBOX.viewboxStorage == undefined || VIEWBOX.viewboxStorage.sceneId == undefined || VIEWBOX.viewboxStorage.sceneId != canvas.scene.data._id) {
      for (let i=0; i< VIEWBOX.viewbox.length; i++)
        if (VIEWBOX.viewbox[i] != undefined)
          VIEWBOX.viewbox[i].hide();
        ui.notifications.warn(game.i18n.localize("LockView.UI.NoConnect"));
    }
    else {
      VIEWBOX.getViewboxData();
    }
  }
  else {
    for (let i=0; i< VIEWBOX.viewbox.length; i++)
      if (VIEWBOX.viewbox[i] != undefined)
        VIEWBOX.viewbox[i].hide();
    canvas.scene.setFlag('LockView', 'editViewbox', false);
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox").active = false;
    getFlags();
    setBlocks();
    ui.controls.controls.find(controls => controls.name == "LockView").activeTool = undefined;
    mouseManager(false);
    ui.controls.render();
  }
  if (currentTool != false) currentTool.active = currentState; 
}

export let mouseMode = null;
let viewboxId;
let startOffset = {};
let screenWidth;
let selectedViewbox;
var mouseDownEvent = function(e) { handleMouseDown(e) };
var mouseUpEvent = function(e) { handleMouseUp(e) };
var mouseMoveEvent = function(e) { handleMouseMove(e) };
//var rightDownEvent = function(e) { handleRightDown(e) };

function mouseManager(en){
  if (en) {
    canvas.mouseInteractionManager.target.addListener("mousedown", mouseDownEvent );
    //canvas.mouseInteractionManager.target.addListener("rightdown", mouseDownEvent );
  }  
  else {
    canvas.mouseInteractionManager.target.removeListener("mousedown", mouseDownEvent );
    canvas.mouseInteractionManager.target.removeListener("mouseup", mouseUpEvent );
    canvas.mouseInteractionManager.target.removeListener("mousemove", mouseMoveEvent );
    //canvas.mouseInteractionManager.target.removeListener("rightdown", mouseDownEvent );
   // canvas.mouseInteractionManager.target.removeListener("rightup", mouseUpEvent );
    //canvas.mouseInteractionManager.target.removeListener("rightmove", mouseMoveEvent );
    VIEWBOX.getViewboxData();
  }
}

function handleMouseDown(e){
  //console.log('e',e.data.button,e)
  let position = e.data.getLocalPosition(canvas.stage);
  const d = canvas.dimensions;
  for (let i=0; i<VIEWBOX.viewbox.length; i++){
    if (VIEWBOX.viewbox[i] == undefined) continue;
    const moveLocation = VIEWBOX.viewbox[i].moveLocation;
    const scaleLocation = VIEWBOX.viewbox[i].scaleLocation;
    const currentPosition = {
      x: VIEWBOX.viewbox[i].currentPosition.x - VIEWBOX.viewbox[i].boxWidth/2,
      y: VIEWBOX.viewbox[i].currentPosition.y - VIEWBOX.viewbox[i].boxHeight/2
    }
    //console.log('viewbox',position,currentPosition,VIEWBOX.viewbox[i])
    //if mouse over move button
    if (e.data.button == 0 && Math.abs(position.x - moveLocation.x) <= 20 && Math.abs(position.y - moveLocation.y) <= 20) mouseMode = 'move';
    //if mouse over scale button
    else if (e.data.button == 0 && Math.abs(position.x - scaleLocation.x) <= 20 && Math.abs(position.y - scaleLocation.y) <= 20) mouseMode = 'scale';
    //if mouse within viewbox
    //else if (e.data.button == 2 && position.x > currentPosition.x && position.x < currentPosition.x+VIEWBOX.viewbox[i].boxWidth && position.y > currentPosition.y && position.y < currentPosition.y+VIEWBOX.viewbox[i].boxHeight) {
    //  console.log('test')
    //  mouseMode = 'move';
      //continue;
    //}
    else continue;

    selectedViewbox = i;
    startOffset = {
      x: position.x - moveLocation.x,
      y: position.y - moveLocation.y
    }
    viewboxId = VIEWBOX.viewbox[i].userId;
    screenWidth = VIEWBOX.viewbox[i].screenWidth;
    if (e.data.button == 0) {
      canvas.mouseInteractionManager.target.addListener("mouseup", mouseUpEvent );
      canvas.mouseInteractionManager.target.addListener("mousemove", mouseMoveEvent );
    }
    else {
      canvas.mouseInteractionManager.target.addListener("rightup", mouseUpEvent );
      canvas.mouseInteractionManager.target.addListener("mousemove", mouseMoveEvent );
    }
    return;
  }
}

function handleMouseUp(){
  mouseMode = null; 
  canvas.mouseInteractionManager.target.removeListener("mousemove", mouseMoveEvent );
  VIEWBOX.getViewboxData();
}

function handleMouseMove(e){
  let position = e.data.getLocalPosition(canvas.stage);
  //console.log('move',position)
  let width = VIEWBOX.viewbox[selectedViewbox].boxWidth;
  let height = VIEWBOX.viewbox[selectedViewbox].boxHeight;
  
  if (mouseMode == 'move') {
    position.x += 20 - startOffset.x + VIEWBOX.viewbox[selectedViewbox].boxWidth/2
    position.y += 20 - startOffset.y + VIEWBOX.viewbox[selectedViewbox].boxHeight/2

    let payload = {
      "msgType": "newView",
      "senderId": game.userId, 
      "shiftX": position.x,
      "shiftY": position.y,
      "scaleChange": null,
      "scaleSett": 0,
      "type": "coordsAbs",
      "receiverId": viewboxId
    };
    game.socket.emit(`module.LockView`, payload);
  }
  else {
    let offset = VIEWBOX.viewbox[selectedViewbox].scaleLocation.x - position.x;
    position.scale = (width - offset)/width;
    
    position.x = VIEWBOX.viewbox[selectedViewbox].xStorage + Math.floor(width / 2) - offset/2;
    position.y = VIEWBOX.viewbox[selectedViewbox].yStorage + Math.floor(height / 2) - offset*height/(2*width);
    
    width *= position.scale;
    height *= position.scale;

    if (width <= screenWidth/CONFIG.Canvas.maxZoom) return;
    
    let payload = {
      "msgType": "newView",
      "senderId": game.userId, 
      "shiftX": position.x,
      "shiftY": position.y,
      "scaleChange": width,
      "scaleSett": 0,
      "type": "coordsAbs",
      "receiverId": viewboxId
    };
    game.socket.emit(`module.LockView`, payload);
  }

  //update viewbox
  VIEWBOX.viewbox[selectedViewbox].updateViewbox(
    {
      x: position.x,
      y: position.y,
      width: width,
      height: height,
      color: VIEWBOX.viewbox[selectedViewbox].boxColor,
      name: VIEWBOX.viewbox[selectedViewbox].boxName,
      controlBtn: true
    }
  );
}

export async function editViewboxConfig(controls) {
  let currentState = !canvas.scene.getFlag('LockView', 'editViewbox');

  if (VIEWBOX.viewboxStorage == undefined || VIEWBOX.viewboxStorage.sceneId == undefined || VIEWBOX.viewboxStorage.sceneId != canvas.scene.data._id) {
    for (let i=0; i< VIEWBOX.viewbox.length; i++)
      if (VIEWBOX.viewbox[i] != undefined)
        VIEWBOX.viewbox[i].hide();
    ui.notifications.warn(game.i18n.localize("LockView.UI.NoConnect"));
    canvas.scene.setFlag('LockView', 'editViewbox', false);
    controls.find(controls => controls.name == "LockView").activeTool = undefined;
    ui.controls.render();
    return;
  }
  if (controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox").active == false){
    ui.notifications.warn(game.i18n.localize("LockView.UI.ViewboxDisabled"));
    canvas.scene.setFlag('LockView', 'editViewbox', false);
    controls.find(controls => controls.name == "LockView").activeTool = undefined;
    ui.controls.render();
    return;
  }

  await canvas.scene.setFlag('LockView', 'editViewbox', currentState);
  
  if (currentState) {
    Canvas.prototype.pan = _Override_VB_Pan;
    Canvas.prototype._onMouseWheel = _onMouseWheel_Default;
    oldVB_viewPosition = canvas.scene._viewPosition;
  }
  else {
    //Canvas.prototype.pan = BLOCKS.pan_Default;
    controls.find(controls => controls.name == "LockView").activeTool = undefined;
    await getFlags();
    if (getEnable(game.userId)) await setBlocks( {pan:lockPan, zoom:lockZoom, bBox: boundingBox} );
    else await setBlocks( {pan:false, zoom:false, bBox:false, force: true} );
  }
  ui.controls.render();
  mouseManager(currentState);
  VIEWBOX.getViewboxData();
}

function _Override_VB_Pan({x=null, y=null, scale=null}={}) {
  let diffX = oldVB_viewPosition.x - x;
  let diffY = oldVB_viewPosition.y - y;
  oldVB_viewPosition.x = x;
  oldVB_viewPosition.y = y;
  if (Math.abs(diffX)>200 || Math.abs(diffX)>200) return;
  
  let scaleChange;
  if (scale == null) scaleChange = 0;
  else scaleChange = scale/oldVB_viewPosition.scale;

  let payload = {
    "msgType": "newView",
    "senderId": game.userId, 
    "shiftX": diffX,
    "shiftY": diffY,
    "scaleChange": scaleChange,
    "type": "shift",
    "receiverId": 'all'
  };
  game.socket.emit(`module.LockView`, payload);
}

/*
 * Render the 'Set View' dialog
 */
function setViewDialog(controls) {
  controls.find(controls => controls.name == "LockView").activeTool = undefined;
  mouseManager(false);
  ui.controls.render();
  if (VIEWBOX.viewboxStorage == undefined || VIEWBOX.viewboxStorage.sceneId == undefined || VIEWBOX.viewboxStorage.sceneId != canvas.scene.data._id) {
    ui.notifications.warn(game.i18n.localize("LockView.UI.NoConnect"));
    return;
  }
  let options = `
    <option value=0>${game.i18n.localize("LockView.SetView.Mode0")}</option>
    <option value=1>${game.i18n.localize("LockView.SetView.Mode1")}</option>
    <option value=2>${game.i18n.localize("LockView.SetView.Mode2")}</option>
    <option value=3>${game.i18n.localize("LockView.SetView.Mode3")}</option>
    <option value=4>${game.i18n.localize("LockView.SetView.Mode4")}</option>
    <option value=5>${game.i18n.localize("LockView.SetView.Mode5")}</option>
    <option value=6>${game.i18n.localize("LockView.SetView.Mode5")}</option>
  `;
  let optionsScale = `
    <option value=0>${game.i18n.localize("LockView.SetView.Scale0")}</option>
    <option value=1>${game.i18n.localize("LockView.SetView.Scale1")}</option>
    <option value=2>${game.i18n.localize("LockView.SetView.Scale2")}</option>
    <option value=3>${game.i18n.localize("LockView.SetView.Scale3")}</option>
  `;
  let dialogTemplate = 
  `
  <div class="form-group">
    <div style="display:flex"> 
      <div  style="flex:1"></div>
      <span style="flex:1">
        <select style="width:200px" id="selectOption">${options}</select>
      </span>
      <div  style="flex:1"></div>
    </div>
    <p style="margin-bottom:10px;">
    <div style="display:flex"> 
      <div  style="flex:1"></div>
      <span style="flex:1;">
        <select style="width:200px" id="scaleOption">${optionsScale}</select>
      </span>
      <div  style="flex:1"></div>
    </div>
    <p style="margin-bottom:15px;">
  </div>
  <div class="form-group" style="display:flex; flex-direction:row; justify-content:space-around" id="numberBoxes">
      <span style="flex-basis=20%">
        X: 
        <input id="val1" type="number" style="width:75px" value=0 />
      </span>
      <span style="flex-basis=20%">
        Y: 
        <input id="val2" type="number" style="width:75px" value=0 />
      </span>
      <span style="flex-basis=20%">
      ${game.i18n.localize("LockView.SetView.LabelScale")}: 
        <input id="sc" type="number" style="width:75px" value=1 />
      </span>
  </div>
  <p style="margin-bottom:10px;">
  <div>
    <div  style="flex:1"></div>
    
    <p style="margin-bottom:10px;">
  </div>   
  `;
  let d = new Dialog({
    title: game.i18n.localize("LockView.SetView.Title"),
    content: dialogTemplate,
    buttons:{
      Yes: {
        label: game.i18n.localize("LockView.SetView.BtnOK"),
        callback: (html) => {
          let option = html.find("#selectOption")[0].value;
          let scaleSett = html.find("#scaleOption")[0].value;
          let payload;

          let x = html.find("#val1")[0].value;
          let y = html.find("#val2")[0].value;
          let scale = html.find("#sc")[0].value;

          if (option < 5){
            payload = {
              "msgType": "resetView",
              "senderId": game.userId,
              "scaleSett": scaleSett, 
              "autoScale": option,
              "scale": scale,
              "receiverId": 'all'
            };
          }
          else if (option == 5){
            payload = {
              "msgType": "newView",
              "senderId": game.userId, 
              "shiftX": x,
              "shiftY": y,
              "scaleSett": scaleSett, 
              "scale": scale,
              "type": "grid",
              "receiverId": 'all'
            };
          }
          else if (option == 6){
            payload = {
              "msgType": "newView",
              "senderId": game.userId, 
              "shiftX": x,
              "shiftY": y,
              "scaleSett": scaleSett, 
              "scale": scale,
              "type": "coords",
              "receiverId": 'all'
            };
          }
          game.socket.emit(`module.LockView`, payload);
        }
      },
      Cancel: {
        label: game.i18n.localize("LockView.SetView.BtnCancel")
      }
    }
  }).render(true);
}