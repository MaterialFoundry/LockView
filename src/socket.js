import { forceConstrain, getPhysicalScale, scaleToFit, applySettings } from "../lockview.js";
import { drawViewbox, sendViewBox, getViewboxEnable } from "./viewbox.js";
import { getEnable } from "./misc.js";
import { setBlocks, getFlags, autoScale, lockPan, lockZoom, boundingBox, excludeSidebar, blackenSidebar } from "./blocks.js";
import { updateControlButtons } from "./controlButtons.js";

/*
 * Set up the socket used to communicate between GM and player clients
 */
export function socket(){
  game.socket.on(`module.LockView`, (payload) =>{
    if (game.userId == payload.senderId) return;
    //console.log('pl',payload)
    if (payload.msgType == 'update') { updatePlayerSettings(payload) }
    else if (payload.msgType == 'resetView') { resetView(payload) }
    else if (payload.msgType == 'newView'){ newView(payload) }
    else if (payload.msgType == 'forceConstrain') { forceConstrain() }
    else if (payload.msgType == 'viewbox') { drawViewbox(payload) }
    else if (payload.msgType == "getViewboxData"){ sendViewBox() }
    else if (payload.msgType == "flagUpdate") { onUpdateFlag(payload) }
    else if (payload.msgType == "settingUpdate") { onUpdateSetting(payload) }
  });  
}

/*
 * Reset the view to the initial view settings or autofit settings
 */
async function resetView(payload){
    if (getEnable(game.userId) == false) return;
    getFlags();
    let newPosition = canvas.scene.initial;
    if (newPosition == null) newPosition = canvas.scene._viewPosition;
    
    if (payload.rotateSett != "null") canvas.stage.rotation = payload.rotateSett*Math.PI/180;
    if (payload.scaleSett == 0) newPosition.scale = canvas.scene._viewPosition.scale;
    else if (payload.scaleSett == 1) newPosition.scale = payload.scale;
    else if (payload.scaleSett == 3){
      //if (autoScale == 5) newPosition.scale = getPhysicalScale();
      //else newPosition.scale = canvas.scene._viewPosition.scale;
      newPosition.scale = getPhysicalScale();
    } 
  
    //Disable all blocks
    await setBlocks( {pan:false,zoom:false,bBox:false} );
  
    //Pan to the new position
    if (payload.autoScale > 0 && payload.autoScale < 5) await scaleToFit(payload.rotateSett, payload.autoScale);
    else await canvas.pan( newPosition );
  
    //Set blocks
    setBlocks( {pan:lockPan,zoom:lockZoom,bBox:boundingBox} );
}

/*
 *  Update the player settings
 */
export async function updatePlayerSettings(payload){
    //If module isn't enabled for this client, disable blocks and return
    if (getEnable(game.userId) == false) {
      //Disable all blocks
      setBlocks( {pan:false,zoom:false,bBox:false} );
  
      return;
    }
  
    //Get all flags
    getFlags();
  
    //Apply new settings
    if (payload.forceInit || payload.autoScale || payload.rotation) applySettings(payload.force);
  
    //Set blocks
    setBlocks( {
      pan:payload.lockPan,
      zoom:payload.lockZoom,
      bBox:payload.boundingBox
    });

    updateControlButtons();
}

/*
 * Send updated settings to connected clients
 */
export function sendUpdate({pan=null,zoom=null,bBox=null,aScale=null,rotation=null,fInit=null,force=false}){
    let payload = {
      "msgType": "update",
      "senderId": game.userId, 
      "lockPan": pan,
      "lockZoom": zoom,
      "autoScale": aScale,
      "rotation": rotation,
      "forceInit": fInit,
      "boundingBox": bBox,
      "force": force
    };
    game.socket.emit(`module.LockView`, payload);
}

/*
 * Send flag update to GM
 */
export function sendFlagUpdate(flag, value) {
  let payload = {
    "msgType": "flagUpdate",
    "senderId": game.userId,
    "flag": flag,
    "value": value
  }
  game.socket.emit(`module.LockView`, payload);
  return new Promise(resolve => setTimeout(resolve, 100));
}

function onUpdateFlag(payload) {
  if (!game.user.isGM) return;
  canvas.scene.setFlag('LockView', payload.flag, payload.value);
}

export function sendSettingUpdate(setting, value) {
  let payload = {
    "msgType": "settingUpdate",
    "senderId": game.userId,
    "setting": setting,
    "value": value
  }
  game.socket.emit(`module.LockView`, payload);
  return new Promise(resolve => setTimeout(resolve, 100));
}

function onUpdateSetting(payload) {
  if (!game.user.isGM) return;
  game.settings.set("LockView", payload.setting, payload.value);
}

/*
 * Set a new view for the user
 */
async function newView(payload){
  //console.log('newView',payload)
    if (getViewboxEnable(game.userId)==false) return;
    const users = payload.users;
    if (users == undefined) return;
    if (users != "all" && users.find(id => id == game.user.id) == undefined) return;
  
    getFlags();
    let scale;
    let position = canvas.scene._viewPosition;

    if (payload.rotateSett > 0) canvas.stage.rotation = payload.rotateSett*Math.PI/180;

    if (payload.scaleSett == 0) position.scale = canvas.scene._viewPosition.scale;
    else {
      if (autoScale && payload.scaleSett == 3) position.scale = getPhysicalScale();
      else if (autoScale == false && payload.scaleSett == 3) position.scale = canvas.scene._viewPosition.scale;
      else if (payload.scaleSett == 1) position.scale = payload.scale;
      else if (payload.type == "shift") position.scale = scale = canvas.scene._viewPosition.scale;
      else position.scale = canvas.scene.initial.scale;
    }
  
    if (payload.type == "grid"){
      position.x += payload.shiftX*canvas.scene.grid.size;
      position.y += payload.shiftY*canvas.scene.grid.size;
    }
    else if (payload.type == "coords"){
      position.x = payload.shiftX;
      position.y = payload.shiftY;
    }
    else if (payload.type == "coordsAbs"){
      //Sidebar offset
      let offset = 0;
      let screenWidth = screen.width;
      if (ui.sidebar._collapsed == false && excludeSidebar && blackenSidebar){
        offset = (window.innerWidth-ui.sidebar._element[0].offsetLeft);
        screenWidth = ui.sidebar._element[0].offsetLeft;
      }
    
      if (payload.scaleChange != null) {
        position.scale = screen.width/payload.scaleChange;
      }
      else position.scale = canvas.scene._viewPosition.scale;
      if (payload.shiftX != null) position.x = payload.shiftX + offset/(2*position.scale);;
      if (payload.shiftX != null) position.y = payload.shiftY;
    }
    else {
      position.x = payload.shiftX+canvas.scene._viewPosition.x;
      position.y = payload.shiftY+canvas.scene._viewPosition.y;
    }
    if (payload.type == "shift" && payload.scaleChange != 0){
      position.scale = canvas.scene._viewPosition.scale*payload.scaleChange;
    }
  
    //Disable all blocks
    setBlocks( {pan:false,zoom:false,bBox:false} );
  
    //Pan to the new position
    await canvas.pan( position );
  
    //If module isn't enabled for this client, return
    if (getEnable(game.userId) == false) return;
  
    //Set blocks
    setBlocks( {pan:lockPan,zoom:lockZoom,bBox:boundingBox} );
  }