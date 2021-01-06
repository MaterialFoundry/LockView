export var controlledTokens = [];

/*
 * Get all tokens that are controlled by the player and store them into the 'controlledTokens' array
 */
export function getControlledTokens(){
  if (game.user.isGM) return;
  //Get a list of all tokens that are controlled by the user
  controlledTokens = [];
  let tokens = canvas.tokens.children[0].children;
  for (let i=0; i<tokens.length; i++){
    //Get the permission of each token, and store owned tokens in array
    const permission = tokens[i].actor.data.permission;
    let permissionString = JSON.stringify(permission);
    permissionString = permissionString.replace('{','');
    permissionString = permissionString.replace('}','');
    permissionString = permissionString.replaceAll('"','');
    let permissionArray = permissionString.split(',');
    let defaultPermission;
    let userPermission;
    for (let j=0; j<permissionArray.length; j++){
      const array = permissionArray[j].split(':');
      if (array[0] == 'default') defaultPermission = array[1];
      else if (array[0] == game.userId) userPermission = array[1];
      if (userPermission == undefined) userPermission = defaultPermission;
    }
    if (userPermission > 2) 
      controlledTokens.push(tokens[i]);
  }
  return controlledTokens;
}

/*
 * Blacken or remove blackening of the sidebar background
 */
export function blackSidebar(en){
  if (en) document.getElementById("sidebar").style.backgroundColor = "black";
  else document.getElementById("sidebar").style.backgroundColor = "";
}

/*
 * Get whether the module is enabled for the user
 */
export function getEnable(userId){
  const settings = game.settings.get("LockView","userSettings");

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
  if (game.settings.get("LockView","updatePopupV1.3.2") == false && game.user.isGM) {
    let d = new Dialog({
      title: "Lock View update v1.4.0",
      content: `
      <h3>Lock View has been updated to version 1.4.0</h3>
      <p>
      The 'Enable' and 'Force Enable' module settings have been removed, in favor or a 'User Configuration' screen that you will find in the module settings.<br>
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
}

