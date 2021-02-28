import * as MODULE from "../lockview.js";
import * as VIEWBOX from "./viewbox.js";
import * as MISC from "./misc.js";
import * as BLOCKS from "./blocks.js";

/*
 * Set up the socket used to communicate between GM and player clients
 */
export function socket(){
    game.socket.on(`module.LockView`, (payload) =>{
        //console.log(payload);
        if (payload.msgType == 'update') { updatePlayerSettings(payload) }
        else if (payload.msgType == 'resetView') { resetView(payload) }
        else if (payload.msgType == 'newView'){ newView(payload) }
        else if (payload.msgType == 'forceConstrain') { MODULE.forceConstrain() }
        else if (payload.msgType == 'viewbox') { VIEWBOX.drawViewbox(payload) }
        else if (payload.msgType == "getViewboxData"){ VIEWBOX.sendViewBox() }
    });  
}

/*
 * Reset the view to the initial view settings or autofit settings
 */
async function resetView(payload){
    if (MISC.getEnable(game.userId) == false) return;
    BLOCKS.getFlags();
    let newPosition = canvas.scene.data.initial;
    
    if (payload.scaleSett == 0) newPosition.scale = canvas.scene._viewPosition.scale;
    else if (payload.scaleSett == 1) newPosition.scale = payload.scale;
    else if (payload.scaleSett == 3){
      if (BLOCKS.autoScale == 5) newPosition.scale = MODULE.getPhysicalScale();
      else newPosition.scale = canvas.scene._viewPosition.scale;
    } 
  
    //Disable all blocks
    await BLOCKS.setBlocks( {pan:false,zoom:false,bBox:false} );
  
    //Pan to the new position
    if (payload.autoScale > 0 && payload.autoScale < 5) await MODULE.scaleToFit(payload.autoScale);
    else await canvas.pan( newPosition );
  
    //Set blocks
    BLOCKS.setBlocks( {pan:BLOCKS.lockPan,zoom:BLOCKS.lockZoom,bBox:BLOCKS.boundingBox} );
}

/*
 *  Update the player settings
 */
export async function updatePlayerSettings(payload){
    //If module isn't enabled for this client, disable blocks and return
    if (MISC.getEnable(game.userId) == false) {
      //Disable all blocks
      BLOCKS.setBlocks( {pan:false,zoom:false,bBox:false} );
  
      return;
    }
  
    //Get all flags
    BLOCKS.getFlags();
  
    //Apply new settings
    if (payload.forceInit || payload.autoScale) MODULE.applySettings(payload.force);
  
    //Set blocks
    BLOCKS.setBlocks( {
      pan:payload.lockPan,
      zoom:payload.lockZoom,
      bBox:payload.boundingBox
    });
}

/*
 * Send updated settings to connected clients
 */
export function sendUpdate({pan=null,zoom=null,bBox=null,aScale=null,fInit=null,force=false}){
    let payload = {
      "msgType": "update",
      "senderId": game.userId, 
      "lockPan": pan,
      "lockZoom": zoom,
      "autoScale": aScale,
      "forceInit": fInit,
      "boundingBox": bBox,
      "force": force
    };
    game.socket.emit(`module.LockView`, payload);
}

/*
 * Set a new view for the user
 */
async function newView(payload){
    if (VIEWBOX.getViewboxEnable(game.userId)==false) return;
    if (payload.receiverId != 'all' && payload.receiverId != game.userId) return;
  
    BLOCKS.getFlags();
    let scale;
    let position = canvas.scene._viewPosition;
  
    if (payload.scaleSett == 0) position.scale = canvas.scene._viewPosition.scale;
    else {
      if (BLOCKS.autoScale && payload.scaleSett == 3) position.scale = MODULE.getPhysicalScale();
      else if (BLOCKS.autoScale == false && payload.scaleSett == 3) position.scale = canvas.scene._viewPosition.scale;
      else if (payload.scaleSett == 1) position.scale = payload.scale;
      else if (payload.type == "shift") position.scale = scale = canvas.scene._viewPosition.scale;
      else position.scale = canvas.scene.data.initial.scale;
    }
  
    if (payload.type == "grid"){
      position.x += payload.shiftX*canvas.scene.data.grid;
      position.y += payload.shiftY*canvas.scene.data.grid;
    }
    else if (payload.type == "coords"){
      position.x = payload.shiftX;
      position.y = payload.shiftY;
    }
    else if (payload.type == "coordsAbs"){
      //Sidebar offset
      let offset = 0;
      let screenWidth = screen.width;
      if (ui.sidebar._collapsed == false && BLOCKS.excludeSidebar && BLOCKS.blackenSidebar){
        offset = (window.innerWidth-ui.sidebar._element[0].offsetLeft);
        screenWidth = ui.sidebar._element[0].offsetLeft;
      }
    
      if (payload.scaleChange != null) position.scale = screenWidth/payload.scaleChange;
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
    BLOCKS.setBlocks( {pan:false,zoom:false,bBox:false} );
  
    //Pan to the new position
    await canvas.pan( position );
  
    //If module isn't enabled for this client, return
    if (MISC.getEnable(game.userId) == false) return;
  
    //Set blocks
    BLOCKS.setBlocks( {pan:BLOCKS.lockPan,zoom:BLOCKS.lockZoom,bBox:BLOCKS.boundingBox} );
  }