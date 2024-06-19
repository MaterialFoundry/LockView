import { registerSettings, SceneConfigurator, configureSettings } from "./src/settings.js";
import { sendViewBox, hideAllViewboxes, initializeViewboxes, getViewboxData } from "./src/viewbox.js";
import { pushControlButtons, registerLayer, updateControlButtons } from "./src/controlButtons.js";
import { getFlags, setBlocks, lockPan, lockZoom, autoScale, rotation, forceInit, blackenSidebar, excludeSidebar, storeDefaultPrototypes, boundingBox } from "./src/blocks.js";
import { drawingConfigApp, closeDrawingConfigApp } from "./src/drawingConfig.js";
import { renderSceneConfig, closeSceneConfig, closeInitialViewForm } from "./src/sceneConfig.js";
import {socket, sendUpdate} from "./src/socket.js";
import { updatePopup, setLockView, getEnable,blackSidebar } from "./src/misc.js";
import { constrainView_Override, pan_OverrideHigherRes } from "./src/overrides.js";
import { compatibilityInit } from "./src/compatibilityHandler.js";

export const moduleName = "LockView";

let windowWidthOld= -1;
let windowHeightOld = -1;
let newSceneLoad = true;
let combatTrigger = false;
let sidebarCollapsed = false;
let hiddenUIelements = {
  logo: false,
  navigation: false,
  controls: false,
  players: false,
  hotbar: false,
  sidebar: false
}
let uiHidden = false;

Handlebars.registerHelper('ifCondLV', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

//CONFIG.debug.hooks = true;

Hooks.on('ready', ()=>{ socket(); updatePopup(); configureSettings() });
Hooks.on('canvasReady',()=>{ onCanvasReady() });
Hooks.on('renderSidebarTab',()=>{ if (combatTrigger == false) onRenderSidebarTab() });
Hooks.on("renderSceneConfig", (app, html) => { renderSceneConfig(app,html) });
Hooks.on("closeSceneConfig", (app, html) => { closeSceneConfig(app,html) });
Hooks.on("getSceneControlButtons", (controls) => { pushControlButtons(controls) });
Hooks.on("renderSceneControls", (controls) => { onRenderSceneControls(controls) });
Hooks.on("renderDrawingConfig", (app,html,data)=>{ drawingConfigApp(app, html, data) });
Hooks.on("closeDrawingConfig", (app,html)=>{ closeDrawingConfigApp(app, html) });
Hooks.on("updateDrawing",()=>{ forceConstrain() });
Hooks.on("closeinitialViewForm", () => { closeInitialViewForm() })
Hooks.on("setLockView", (data) => { setLockView(data) })
Hooks.on("sidebarCollapse", (app,collapse) => { getFlags(); forceConstrain(); setUI(collapse) });
Hooks.on("collapseSidebar", (app,collapse) => { getFlags(); forceConstrain(); setUI(collapse); });
Hooks.on("renderSceneNavigation", () => { setUI(sidebarCollapsed) });
Hooks.on("lightingRefresh", () => { getFlags(); applySettings(lockPan && lockZoom); });
Hooks.on("updateCombat", () => { combatTrigger = true;})

Hooks.on('canvasPan',(canvas,data)=>{
  if (getEnable(game.userId)) 
    scaleToFit(rotation);
  
  sendViewBox();
});

Hooks.once('init', function(){

  compatibilityInit();

  //Store default canvas prototype functions
  storeDefaultPrototypes();
  
  //Register module settings (./src/settings.js)
  registerSettings(); 

  //Register lockview layer for the control buttons (./src/misc.js)
  registerLayer();
});

Hooks.on("canvasInit", (canvas) => {
  //On canvas initialization, hide all viewboxes
  hideAllViewboxes();

  //Disable all blocks
  setBlocks( {pan:false,zoom:false,bBox:false} );

  newSceneLoad = true;
  setTimeout(function(){newSceneLoad = false;},2000);

});

Hooks.on("renderPlayerList", (playerlist,init,users) => {
  if (game.user.isGM == false) return;
  hideAllViewboxes();
  initializeViewboxes(users);
  getViewboxData();
});

async function setUI(hide) {
  sidebarCollapsed = hide;
  if (!getEnable(game.userId) || canvas.scene == undefined) return;
  
    uiHidden = hide;
    let hideUIelements = {};
    if (canvas.scene.getFlag('LockView', 'hideUI')) {
      if (canvas.scene.flags["LockView"].hideUIelements){
        hideUIelements = await canvas.scene.getFlag('LockView', 'hideUIelements');
      } 
      else hideUIelements = {
        logo: true,
        navigation: true,
        controls: true,
        players: true,
        hotbar: true,
        sidebar: false
      }
    }
    else {
      hideUIelements = {
        logo: false,
        navigation: false,
        controls: false,
        players: false,
        hotbar: false,
        sidebar: false
      }
    }

    if (hide) {
      for (let element in hideUIelements) {
        if (hideUIelements?.[element]) {
          if (game.user.isGM && element == 'sidebar') continue;
          document.getElementById(element).style.visibility = 'hidden'
          //$(`#${element}`).hide();
          hiddenUIelements[element] = true;
        }
        else {
          document.getElementById(element).style.visibility = 'visible'
          //$(`#${element}`).show();
          hiddenUIelements[element] = false;
        }
      }
    }
    else {
      for (let element in hideUIelements) {
        if (hideUIelements?.[element]) {
          document.getElementById(element).style.visibility = 'visible'
          //$(`#${element}`).show();
          hiddenUIelements[element] = false;
        }
      }
    }
  
}

export function onKeyPress() {
    uiHidden = !uiHidden;
    setUI(uiHidden);
}

/*
 * If the scene controls are rendered, check whether editViewbox should be enabled
 */
async function onRenderSceneControls(controls) {
  if (canvas?.scene == null)
    return;

  if (controls.activeControls != 'LockView') 
      canvas['lockview'].deactivate();
      
  if (combatTrigger) {
    combatTrigger = false;
    return;
  }
  
  if (getEnable(game.userId) && canvas?.scene?.getFlag('LockView', 'sidebar') == 'collapse') {
    if (newSceneLoad == true)
      ui.sidebar.collapse();

    setUI(ui.sidebar._collapsed);
  }
  else if (getEnable(game.userId) && canvas?.scene?.getFlag('LockView', 'sidebar') == 'expand') {
    if (newSceneLoad == true)
      ui.sidebar.expand();

    setUI(ui.sidebar._collapsed);
  }

  if (game.user.isGM == false) return;

  await getFlags();

  let editEnable = canvas.scene.getFlag('LockView', 'editViewbox');
  if (editEnable == undefined) { 
    await canvas.scene.setFlag('LockView', 'editViewbox', false);
    editEnable = false;
    updateControlButtons();
  }

  if (editEnable && controls.activeControl != "LockView") {
    await canvas.scene.setFlag('LockView', 'editViewbox', false);
    await setBlocks();

    const lockViewControls = ui.controls.controls.find(controls => controls.name == "LockView");
    if (lockViewControls == undefined)
      return;

    // Disable the editViewbox control button
    lockViewControls.activeTool = undefined;
    
    getViewboxData();
    updateControlButtons();
  }
  
}

/*
 * Run when canvas is ready
 */
async function onCanvasReady(){
  await getFlags();

  //Apply the settings
  await applySettings(true);

  //forceCanvasPan();
  sendViewBox();
}

async function onRenderSidebarTab(){
  if (game.user.isGM){

    //If the user is the GM, request viewbox data from connected players
    getViewboxData();

    //Get the flags
    await getFlags();

    const lockViewControls = ui.controls.controls.find(controls => controls.name == "LockView");
    if (lockViewControls != undefined) {
      //set & render ui controls
      lockViewControls.tools.find(tools => tools.name == "PanLock").active = lockPan;
      lockViewControls.tools.find(tools => tools.name == "ZoomLock").active = lockZoom;
      lockViewControls.tools.find(tools => tools.name == "BoundingBox").active = boundingBox;
      ui.controls.render();
    }
  }

  sendViewBox();
}

function forceInitialView() {
  if (newSceneLoad) return canvas.scene.initial;
  else return {};
}

/*
 * Apply the settings
 */
export async function applySettings(force=false,forceInitial=true) {
  
  //If module isn't enabled for this client, return
  if (getEnable(game.userId) == false) return;

  //Get the flags for this scene
  await getFlags();

  if (rotation != null) canvas.stage.rotation = rotation*Math.PI/180;

  //If 'autoScale' if 'horizontal fit', 'vertical fit' or 'automatic fit'
  if (autoScale > 0 && autoScale < 5 && force) 
    scaleToFit(rotation, autoScale);
  else if (autoScale > 0 && autoScale < 5) 
    scaleToFit(rotation);
  else {
    let newPosition = {};
    
    //If 'forceInit' is enabled, set 'newPosition' to the canvas' initial position
    if (forceInit && forceInitial) 
      newPosition = forceInitialView()

    //If 'autoScale' is set to 'physical gridsize', calculate the scale, and set it in 'newPosition'
    if (autoScale == 5) {
      newPosition.scale = getPhysicalScale();
    }

    //Check if current view falls within the bounding box
    if (autoScale == 0 && boundingBox && forceInit == false && canvas?.scene != null)
      newPosition = constrainView_Override(canvas.scene._viewPosition);

    //Pan to the new position
    if (canvas?.scene != null && (isNaN(newPosition.x)==false || isNaN(newPosition.y)==false || isNaN(newPosition.scale)==false)) {
      await canvas.pan( newPosition );
    }
  }

  //Set sidebar background to black if 'blackenSidebar' is on
  blackSidebar(blackenSidebar);

  //Set the blocks to the correct settings
  await setBlocks( {pan:lockPan, zoom:lockZoom, bBox: boundingBox} );

  sendViewBox();
}

/*
 * Scale the canvas to fit the foundry window
 */
export async function scaleToFit(rotation, force = 0){
  //Get the flags for this scene
  await getFlags();
  let horizontal;                                   //Stores whether the screen fills horizontally or vertically
  let sidebarOffset = 0;                            //Offset in pixels due to the presence of the sidebar
  let windowWidth = window.innerWidth;            //width of the foundry window
  const sceneWidth = canvas.dimensions.sceneWidth;  //width of the current scene
  let windowHeight = window.innerHeight;          //height of the foundry window
  const sceneHeight = canvas.dimensions.sceneHeight;//height of the current scene
  let autoScaleTemp = (force > 0) ? force : autoScale;  //Stores the autoscale for local usage
  
  //If exclude sidebar is on, and the sidebar is not collapsed, store the sidebar width to 'sidebarOffset'
  if (excludeSidebar && ui.sidebar._collapsed == false) 
    sidebarOffset = ui.sidebar.position.width;

  //Horizontal fit
  if (autoScaleTemp == 1) horizontal = true;
  //Vertical fit
  else if (autoScaleTemp == 2) horizontal = false;
  //Automatic fit
  else if (autoScaleTemp == 3) 
    //Compare ratio between window size and canvas size in x and y direction to determine if the fit should be horizontal or vertical
    horizontal = (((windowWidth-sidebarOffset) / sceneWidth) > (windowHeight / sceneHeight)) ? true : false;
  else if (autoScaleTemp == 4) 
    //Compare ratio between window size and canvas size in x and y direction to determine if the fit should be horizontal or vertical
    horizontal = (((windowWidth-sidebarOffset) / sceneWidth) > (windowHeight / sceneHeight)) ? false : true;
  
  else return;

  if (rotation == 90 || rotation == 270){
    // If the canvas is rotated, swap the window width and height
    // This is necessary because window.innerWidth/window.innerHeight are not affected by rotating the canvas
    let swap = windowWidth;
    windowWidth = windowHeight;
    windowHeight = swap;
  }

  //If the windowWidth or windowHeight is the same as last time this function ran, and if the function is not forced to run, return
  if (windowWidth == windowWidthOld && windowHeight == windowHeightOld && force == 0) return;

  //Store the current window width and height
  windowWidthOld = windowWidth;
  windowHeightOld = windowHeight;

  //Calculate the new values
  const scale = horizontal ? (windowWidth-sidebarOffset)/sceneWidth : windowHeight/sceneHeight;

  let newPosition = {
    x : canvas.dimensions.sceneX + (sceneWidth+sidebarOffset/scale)/2,
    y : canvas.dimensions.sceneY + sceneHeight/2,
    scale : Math.round(scale* 2000) / 2000
  }

  if (boundingBox) {
    newPosition = constrainView_Override(newPosition);
  }

  //Disable to blocks to allow zooming and panning
  await setBlocks( {pan:false,zoom:false,bBox:false} );

  //Use pan_OverrideHigherRes to get get a higher scale resolution for improved fit
  Canvas.prototype.pan = pan_OverrideHigherRes;

  //Pan to the new position
  await canvas.pan( newPosition );

  //Set the blocks again
  setBlocks( {pan:lockPan, zoom:lockZoom, bBox: boundingBox} );
}

/*
 *  Calculate the scale to get a gridsize that corresponds with physical values
 */
export function getPhysicalScale(){
  let screenSize = game.settings.get("LockView","ScreenWidth"); //horizontal mm
  let gridSize = game.settings.get("LockView","Gridsize"); //mm
  //Get the horizontal resolution
  let res = screen.width;
  //Get the number of horizontal grid squares that fit on the screen
  let horSq = screenSize/gridSize;
  //Get the number of pixels/gridsquare to get the desired grid size
  let grid = res/horSq;
  //Get the scale factor
  let scale = grid/canvas.scene.grid.size;
  return scale;
}

/*
 * Force bounding box constraint
 */
export function forceConstrain(){
  getFlags();
  //If the user is the GM and boundingBox is enabled, force constrain for all users
  if (game.user.isGM) {
    const payload = {
      "msgType": "forceConstrain",
      "senderId": game.userId
    };
    game.socket.emit(`module.LockView`, payload);
  }
  if (getEnable(game.userId) == false) return;
  const newPosition = constrainView_Override(canvas.scene._viewPosition);
  canvas.pan( newPosition );
  sendViewBox();
}