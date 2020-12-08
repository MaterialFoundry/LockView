import * as MODULE from "../lockview.js";

let oldVB_viewPosition;

export function pushControlButtons(controls){
  if (canvas == null) return;
  controls.push({
    name: "LockView",
    title: "Lock View",
    icon: "fas fa-tv",
    layer: "LockViewLayer",
    tools: [
      {
        name: "resetView",
        title: game.i18n.localize("LockView.ControlBtns.Label_SetView"),
        icon: "fas fa-compress-arrows-alt",
        visible: true,
        button: true,
        onClick: () => {
          if (MODULE.viewboxStorage == undefined || MODULE.viewboxStorage.sceneId == undefined || MODULE.viewboxStorage.sceneId != canvas.scene.data._id) {
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

                  if (option < 4){
                    payload = {
                      "msgType": "lockView_resetView",
                      "senderId": game.userId,
                      "scaleSett": scaleSett, 
                      "autoScale": option,
                      "scale": scale
                    };
                  }
                  else if (option == 4){
                    payload = {
                      "msgType": "lockView_newViewport",
                      "senderId": game.userId, 
                      "shiftX": x,
                      "shiftY": y,
                      "scaleSett": scaleSett, 
                      "scale": scale,
                      "type": "grid"
                    };
                  }
                  else if (option == 5){
                    payload = {
                      "msgType": "lockView_newViewport",
                      "senderId": game.userId, 
                      "shiftX": x,
                      "shiftY": y,
                      "scaleSett": scaleSett, 
                      "scale": scale,
                      "type": "coords"
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
      },
      {
        name: "PanLock",
        title: game.i18n.localize("LockView.ControlBtns.Label_PanLock"),
        icon: "fas fa-arrows-alt",
        visible: true,
        onClick: () => {
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock");
          let currentState = currentTool.active;
          MODULE.sendLockView_update(currentState,-1,-1,-1);
          canvas.scene.setFlag('LockView', 'lockPan', currentState);
          currentTool.active = currentState;   
          },
        toggle: true,
        active: canvas.scene.getFlag('LockView', 'lockPan')
      },
      {
        name: "ZoomLock",
        title: game.i18n.localize("LockView.ControlBtns.Label_ZoomLock"),
        icon: "fas fa-search-plus",
        visible: true,
        onClick: () => {
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock");
          let currentState = currentTool.active;
          MODULE.sendLockView_update(-1,currentState,-1,-1)
          canvas.scene.setFlag('LockView', 'lockZoom', currentState);
          currentTool.active = currentState;
          },
        toggle: true,
        active: canvas.scene.getFlag('LockView', 'lockZoom')
      },
      {
        name: "Viewbox",
        title: game.i18n.localize("LockView.ControlBtns.Label_Viewbox"),
        icon: "far fa-square",
        visible: true,
        onClick: () => {
          let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox");
          let currentState = currentTool.active;
          if (currentState) {
            if (MODULE.viewboxStorage == undefined || MODULE.viewboxStorage.sceneId == undefined || MODULE.viewboxStorage.sceneId != canvas.scene.data._id) {
              for (let i=0; i< MODULE.viewbox.length; i++)
                if (MODULE.viewbox[i] != undefined)
                    MODULE.viewbox[i].hide();
                  ui.notifications.warn(game.i18n.localize("LockView.UI.NoConnect"));
            }
            else {
              game.settings.set("LockView","viewbox",true);
              let payload = {
                "msgType": "lockView_getData",
                "senderId": game.userId
              };
              game.socket.emit(`module.LockView`, payload);
            }
          }
          else 
          for (let i=0; i< MODULE.viewbox.length; i++)
            if (MODULE.viewbox[i] != undefined)
                MODULE.viewbox[i].hide();
          game.settings.set('LockView', 'viewbox', currentState);
          currentTool.active = currentState;    
          },
        toggle: true,
        active: game.settings.get("LockView","viewbox")
      },
      {
        name: "EditViewbox",
        title: game.i18n.localize("LockView.ControlBtns.Label_EditViewbox"),
        icon: "fas fa-vector-square",
        visible: true,
        onClick: () => {
          if (MODULE.viewboxStorage == undefined || MODULE.viewboxStorage.sceneId == undefined || MODULE.viewboxStorage.sceneId != canvas.scene.data._id) {
            for (let i=0; i< MODULE.viewbox.length; i++)
              if (MODULE.viewbox[i] != undefined)
                MODULE.viewbox[i].hide();
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
          let currentState = canvas.scene.getFlag('LockView', 'editViewbox') ? false : true;
          if (currentState == false) controls.find(controls => controls.name == "LockView").activeTool = undefined;
          canvas.scene.setFlag('LockView', 'editViewbox', currentState);
          ui.controls.render();
          if (currentState) {
            Canvas.prototype.pan = _Override_VB_Pan;
            oldVB_viewPosition = canvas.scene._viewPosition;
          }
          else {
            Canvas.prototype.pan = MODULE.pan_Default;
          }

          },
        toggle: false,
        active: game.settings.get("LockView","editViewbox")
      },
    ],
  });
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
    "msgType": "lockView_newViewport",
    "senderId": game.userId, 
    "shiftX": diffX,
    "shiftY": diffY,
    "scaleChange": scaleChange,
    "type": "shift"
  };
  game.socket.emit(`module.LockView`, payload);
  
}