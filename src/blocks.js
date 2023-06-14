import { forceConstrain } from "../lockview.js";
import { getEnable, updateFlag } from "./misc.js";
import { _Override, pan_Override, pan_OverrideHigherRes, onDragCanvasPan_Override, animatePan_Override } from "./overrides.js";
import { sendUpdate } from "./socket.js";

export let lockPan = false;
export let lockZoom = false;
export let boundingBox = false;
export let forceInit = false;
export let autoScale = 0;
export let rotation = 0;
export let excludeSidebar = false;
export let blackenSidebar = false;

export let _onMouseWheel_Default; //stores mousewheel zoom
let _onDragCanvasPan_Default; //stores token-to-edge canvas move
let pan_Default; //stores right-drag canvas move
let _onDragLeftMove_Default
let animatePan_Default;
let constrainView_Default;

/*
 * Store the default prototype functions
 */
export function storeDefaultPrototypes(){
  _onMouseWheel_Default = Canvas.prototype._onMouseWheel;
  _onDragCanvasPan_Default = Canvas.prototype._onDragCanvasPan;
  _onDragLeftMove_Default = Canvas.prototype._onDragLeftMove;
  pan_Default = Canvas.prototype.pan;
  animatePan_Default = Canvas.prototype.animatePan;
  constrainView_Default = Canvas.prototype._constrainView;
}

/*
 * Get the LockView flags of the current canvas
 */
export function getFlags(){
    if (canvas == null) return;
    if (canvas.scene == null || canvas.scene == undefined) return;
    lockPan = canvas.scene.getFlag('LockView', 'lockPan');
    lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
    boundingBox = canvas.scene.getFlag('LockView', 'boundingBox');
    forceInit = canvas.scene.getFlag('LockView', 'forceInit');
    autoScale = canvas.scene.getFlag('LockView', 'autoScale');
    rotation = canvas.scene.getFlag('LockView', 'rotation');
    excludeSidebar = canvas.scene.getFlag('LockView', 'excludeSidebar');
    blackenSidebar = canvas.scene.getFlag('LockView', 'blackenSidebar');
  }

/*
 * Block zooming, panning or enable the bounding box
 */
export function setBlocks( {pan=null,zoom=null,bBox=null,force=false}={} ){
    if (getEnable(game.userId) == false){
      pan=false;
      zoom=false;
      bBox=false;
      force=true;
    }

    if (force==false && getEnable(game.userId) == false) return;

    //Store the values in the global variables
    if (pan != null) lockPan = pan;
    if (zoom != null) lockZoom = zoom;
    if (bBox != null) boundingBox = bBox;

    //Apply blocks
    if (lockZoom == true) Canvas.prototype._onMouseWheel = _Override;
    else if (lockZoom == false) Canvas.prototype._onMouseWheel = _onMouseWheel_Default;
  
    if (lockPan == true) {
      Canvas.prototype._onDragCanvasPan = _Override;  //draggin token to edge of screen
      Canvas.prototype.pan = pan_Override;  //right-mouse click & zoom
      Canvas.prototype.animatePan = _Override;
    }
    else if (lockPan == false && boundingBox == true){
      Canvas.prototype.pan = pan_OverrideHigherRes;
      Canvas.prototype._onDragCanvasPan = onDragCanvasPan_Override;
      Canvas.prototype.animatePan = animatePan_Override;
    }
    else if (lockPan == false && boundingBox == false) {
      Canvas.prototype._onDragCanvasPan = _onDragCanvasPan_Default;
      Canvas.prototype.pan = pan_Default;
      Canvas.prototype.animatePan = animatePan_Default;
    }
  }

/*
 * Update the pan lock setting
 */
export async function updatePanLock(panLock){
  await updateFlag('lockPan', panLock);
  if (getEnable(game.userId))
    await setBlocks( {pan:panLock} );
  await sendUpdate( {pan:panLock} );
}

/*
 * Update the zoom lock setting
 */
export async function updateZoomLock(zoomLock){
  await updateFlag('lockZoom', zoomLock);
  if (getEnable(game.userId))
    await setBlocks( {zoom:zoomLock} );
  await sendUpdate( {zoom:zoomLock} );
}

/*
 * Update the bounding box setting
 */
export async function updateBoundingBox(boundingBox){
  await updateFlag('boundingBox', boundingBox);
  if (getEnable(game.userId))
    await setBlocks( {bBox:boundingBox} );
  await sendUpdate( {bBox:boundingBox} );
  forceConstrain();
}