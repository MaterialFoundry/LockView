import { updatePanLock, updateZoomLock, updateBoundingBox } from "./blocks.js";
import { viewbox, editViewboxConfig } from "./controlButtons.js";
import { sendFlagUpdate, sendSettingUpdate } from "./socket.js";

export function compareVersions(checkedVersion, requiredVersion) {
  requiredVersion = requiredVersion.split(".");
  checkedVersion = checkedVersion.split(".");
  
  for (let i=0; i<3; i++) {
    requiredVersion[i] = isNaN(parseInt(requiredVersion[i])) ? 0 : parseInt(requiredVersion[i]);
    checkedVersion[i] = isNaN(parseInt(checkedVersion[i])) ? 0 : parseInt(checkedVersion[i]);
  }
  
  if (checkedVersion[0] > requiredVersion[0]) return false;
  if (checkedVersion[0] < requiredVersion[0]) return true;
  if (checkedVersion[1] > requiredVersion[1]) return false;
  if (checkedVersion[1] < requiredVersion[1]) return true;
  if (checkedVersion[2] > requiredVersion[2]) return false;
  return true;
}

export function compatibleCore(compatibleVersion){
  const split = compatibleVersion.split(".");
  if (split.length == 1) compatibleVersion = `${compatibleVersion}.0`;
  let coreVersion = game.version;
  return compareVersions(compatibleVersion, coreVersion);
}

export async function setLockView(data) {
  let enable;
  if (data.panLock != undefined) {
    if (data.panLock == 'toggle') enable = !canvas.scene.getFlag('LockView', 'lockPan');
    else enable = data.panLock;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock").active = enable;
    await updatePanLock(enable);
  }
  if (data.zoomLock != undefined) {
    if (data.zoomLock == 'toggle') enable = !canvas.scene.getFlag('LockView', 'lockZoom');
    else enable = data.zoomLock;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock").active = enable;
    await updateZoomLock(enable);
  }
  if (data.boundingBox != undefined) {
    if (data.boundingBox == 'toggle') enable = !canvas.scene.getFlag('LockView', 'boundingBox');
    else enable = data.boundingBox;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "BoundingBox").active = enable;
    await updateBoundingBox(enable);
  }
  if (data.viewbox != undefined) {
    if (data.viewbox == 'toggle') enable = !game.settings.get("LockView","viewbox");
    else enable = data.viewbox;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox").active = enable;
    await viewbox(enable);
  }
  await ui.controls.render();
  if (data.editViewbox != undefined) {
    if (data.editViewbox == 'toggle') enable = !canvas.scene.getFlag('LockView', 'editViewbox');
    else enable = data.editViewbox;
    await editViewboxConfig(ui.controls.controls);
  }
}

/*
 * Get whether the module is enabled for the user
 */
export function getEnable(userId){
  const settings = game.settings.get("LockView","userSettings");
  const settingsOverride = game.settings.get("LockView","userSettingsOverrides");
  const user = game.users.get(userId);

  //if user is undefined, return false
  if (user == undefined) return false;

  //Check if the user's role has override enabled
  if (settingsOverride[user.role]?.enable) return true;

  //Check if the userId matches an existing id in the settings array
  for (let i=0; i<settings.length; i++)
    if (settings[i].id == userId) return settings[i].enable;

  //Else return true for new players, return false for new GMs
  const userList = game.users.entries;
  for (let i=0; i<userList.length; i++){
    if (userList[i]._id == userId && userList[i].role != 4)
      return true;
  }
  return false;
}

export function updatePopup(){
  /*
  if (game.settings.get("LockView","updatePopupV1.4.3") == false && game.user.isGM) {
    let d = new Dialog({
      title: "Lock View update v1.4.3",
      content: `
      <h3>Lock View has been updated to version 1.4.3</h3>
      <p>
      In the scene configuration you'll find a new 'Autoscale' option: 'Automatic Fit (outside)'<br>
      This option allows you to autoscale the view in such a way that the whole canvas is always visible, instead of zooming in to fit like it did with the old 'Automatic Fit'. This function is
      still there by setting it to 'Automatic Fit (inside)'.<br>
      <br>
      <b>Due to this change, any scene that you had configured with 'Autoscale: Physical Gridscale' is now set to 'Automatic Fit (outside)'. Unfortunately you'll have to manually reconfigure those scenes.</b>
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
        if (html.find("input[name ='hide']").is(":checked")) game.settings.set("LockView","updatePopupV1.4.3",true);
      }
    });
    d.render(true);
  }
  */
}

/*
 * Blacken or remove blackening of the sidebar background
 */
export function blackSidebar(en){
  if (en) document.getElementById("sidebar").style.backgroundColor = "black";
  else document.getElementById("sidebar").style.backgroundColor = "";
}

export async function updateFlag(flag, value) {
  if (game.user.isGM) return await canvas.scene.setFlag('LockView', flag, value);
  return await sendFlagUpdate(flag, value);
}

export async function updateSettings(setting, value) {
  if (game.user.isGM) return await game.settings.set("LockView", setting, value);
  return await sendSettingUpdate(setting, value);
}