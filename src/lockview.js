let _onMouseWheel_Default; //stores mousewheel zoom
let _onDragCanvasPan_Default; //stores token-to-edge canvas move
let pan_Default; //stores right-drag canvas move
let _onDragLeftMove_Default
let animatePan_Default;
let _onClickRight_Default;
let viewWidth;
let viewHeight;
let autoScale = 0;
let viewboxStorage; 
let viewbox; //stores current viewbox
let tooltip = [];
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
        //check if sending user is in same scene, if not, hide tooltip and return
        if (payload.sceneId != canvas.scene.data._id) {
          if(tooltip[senderNumber] != undefined)
            tooltip[senderNumber].hide();
          return;
        }
        //remove old tooltip and create new one
        canvas.stage.removeChild(tooltip[senderNumber]);
        tooltip[senderNumber] = new Tooltip();
        canvas.stage.addChild(tooltip[senderNumber]);
        tooltip[senderNumber].init();

        //update tooltip
        tooltip[senderNumber].updateTooltip(
          {
            x: payload.viewPosition.x,
            y: payload.viewPosition.y,
            w: payload.viewWidth/payload.viewPosition.scale,
            h: payload.viewHeight/payload.viewPosition.scale,
            c: parseInt(payload.senderColor.replace(/^#/, ''), 16)
          }
        );
        //tooltip[senderNumber].show;
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
  _onClickRight_Default = Canvas.prototype._onClickRight;
  
  //initialize all settings
  game.settings.register('LockView','Enable', {
    name: "LockView.Sett.Enable",
    hint: "LockView.Sett.Enable_Hint",
    scope: "client",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
  });
  game.settings.register("LockView", "ScreenWidth", {
    name: "LockView.Sett.ScreenWidth",
    hint: "LockView.Sett.ScreenWidth_Hint",
    scope: "client",
    config: true,
    default: 1,
    type: Number,
    onChange: x => updateSettings()
  });
  game.settings.register("LockView", "Gridsize", {
    name: "LockView.Sett.Gridsize",
    hint: "LockView.Sett.Gridsize_Hint",
    scope: "client",
    config: true,
    default: 25,
    type: Number,
    onChange: x => updateSettings()
  });
  game.settings.register('LockView','ForceEnable', {
    name: "Force Enable",
    hint: "Enables the module on all non-GM clients",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
    onChange: x => window.location.reload()
});
  game.settings.register('LockView','viewbox', {
    name: "LockView.Sett.ForceEnable",
    hint: "LockView.Sett.ForceEnable_Hint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean,
  });
  game.settings.register('LockView','lockOverride', {
    name: "LockView.Sett.LockOverride",
    hint: "LockView.Sett.LockOverride_Hint",
    scope: "world",
    config: true,
    default: "Alt + Z",
    type: window.Azzu.SettingsTypes.KeyBinding,
  });
  game.settings.register('LockView','editViewbox', {
    name: "Viewbox edit mode",
    hint: "",
    scope: "client",
    config: false,
    default: false,
    type: Boolean
  });
});

Hooks.once("canvasInit", (canvas) => {
  
  canvas.LockView = canvas.stage.addChildAt(new LockViewLayer(canvas), 8);
  
});

Hooks.on("canvasInit", (canvas) => {
  if (game.user._isGM) {
    for (let i=0; i< tooltip.length; i++)
      if (tooltip[i] != undefined)
      tooltip[i].init();
    //for (let i=0; i<game.data.users.length; i++){
     // if(tooltip[i] == undefined){
    //    tooltip[i] = new Tooltip();
    //    canvas.stage.addChild(tooltip[i]);
     //   tooltip[i].init();
     // }
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

Hooks.on('canvasPan',(canvas,viewposition)=>{
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
  viewbox = canvas.scene._viewPosition;
  
});

Hooks.on('updateToken',(scene,token,change)=>{
  
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (game.user.isGM) {
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
          visible: "true",
          button: true,
          onClick: () => {
            if (viewboxStorage == undefined || viewboxStorage.sceneId == undefined || viewboxStorage.sceneId != canvas.scene.data._id) {
              ui.notifications.warn(game.i18n.localize("LockView.UI.NoConnect"));
              return;
            }
            let options = `
              <option value=0>${game.i18n.localize("LockView.SetView.Mode0")}</option>
              <option value=1>${game.i18n.localize("LockView.SetView.Mode1")}</option>
              <option value=2>${game.i18n.localize("LockView.SetView.Mode2")}</option>
              <option value=3>${game.i18n.localize("LockView.SetView.Mode3")}</option>
              <option value=4>${game.i18n.localize("LockView.SetView.Mode4")}</option>
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
                    let x;
                    let y;
                    let selection;
                    let option = html.find("#selectOption")[0].value;
                    let scaleSett = html.find("#scaleOption")[0].value;
                    let payload;

                    x = html.find("#val1")[0].value;
                    y = html.find("#val2")[0].value;
                    scale = html.find("#sc")[0].value;

                    if (option < 3){
                      payload = {
                        "msgType": "lockView_resetView",
                        "senderId": game.userId,
                        "scaleSett": scaleSett, 
                        "autoScale": option,
                        "scale": scale
                      };
                    }
                    else if (option == 3){
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
                    else if (option == 4){
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
          visible: "true",
          onClick: () => {
            let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock");
            let currentState = currentTool.active;
            sendLockView_update(currentState,-1,-1,-1);
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
          visible: "true",
          onClick: () => {
            let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock");
            let currentState = currentTool.active;
            sendLockView_update(-1,currentState,-1,-1)
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
          visible: "true",
          onClick: () => {
            let currentTool = controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "Viewbox");
            let currentState = currentTool.active;
            if (currentState) {
              if (viewboxStorage == undefined || viewboxStorage.sceneId == undefined || viewboxStorage.sceneId != canvas.scene.data._id) {
                for (let i=0; i< tooltip.length; i++)
                  if (tooltip[i] != undefined)
                    tooltip[i].hide();
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
            for (let i=0; i< tooltip.length; i++)
              if (tooltip[i] != undefined)
                tooltip[i].hide();
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
          visible: "true",
          onClick: () => {
            if (viewboxStorage == undefined || viewboxStorage.sceneId == undefined || viewboxStorage.sceneId != canvas.scene.data._id) {
              for (let i=0; i< tooltip.length; i++)
                if (tooltip[i] != undefined)
                  tooltip[i].hide();
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
              Canvas.prototype.pan = pan_Default;
            }

            },
          toggle: false,
          active: game.settings.get("LockView","editViewbox")
        },
      ],
    });
  }
});

Hooks.on("renderPlayerList", (playerlist,init,users) => {
  if (game.user.isGM == false) return;

  for (let i=0; i< tooltip.length; i++)
    if (tooltip[i] != undefined)
      tooltip[i].hide();

  for (let i=0; i<users.length; i++){
    if(tooltip[i] == undefined){
      tooltip[i] = new Tooltip();
      canvas.stage.addChild(tooltip[i]);
      tooltip[i].init();
    }
  }
  let payload = {
    "msgType": "lockView_getData",
    "senderId": game.userId
  };
  game.socket.emit(`module.LockView`, payload);
});

Hooks.on("renderSceneControls", (controls) => {
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

Hooks.on("renderSceneConfig", (app, html, data) => {
  let lockPan_Default = false;
  let lockZoom_Default = false;
  let autoScale = 0;
  let forceInit = false;
  if(app.object.data.flags["LockView"]){
    if (app.object.data.flags["LockView"].lockPan_Default){
      lockPan_Default = app.object.getFlag('LockView', 'lockPan_Default');
    } 
    else app.object.setFlag('LockView', 'lockPan_Default', false);

    if (app.object.data.flags["LockView"].lockZoom_Default){
      lockZoom_Default = app.object.getFlag('LockView', 'lockZoom_Default');
    } 
    else app.object.setFlag('LockView', 'lockZoom_Default', false);

    if (app.object.data.flags["LockView"].autoScale){
      autoScale = app.object.getFlag('LockView', 'autoScale');
    } else app.object.setFlag('LockView', 'autoScale', 0);

    if (app.object.data.flags["LockView"].forceInit){
      forceInit = app.object.getFlag('LockView', 'forceInit');
    } else app.object.setFlag('LockView', 'forceInit', false);
  } 
  let autoScaleOptions = [
    game.i18n.localize("LockView.Scene.Autoscale.Off"),
    game.i18n.localize("LockView.Scene.Autoscale.Hor"),
    game.i18n.localize("LockView.Scene.Autoscale.Vert"),
    game.i18n.localize("LockView.Scene.Autoscale.Grid")
  ];
  
  let autoScaleSelected = [
    "",
    "",
    "",
    ""
  ];
  autoScaleSelected[autoScale] = "selected"

  const fxHtml = `
  <div class="form-group">
      <label>${game.i18n.localize("LockView.Scene.LockPan")}</label>
      <input id="LockView_lockPan" type="checkbox" name="LV_lockPan" data-dtype="Boolean" ${lockPan_Default ? 'checked' : ''}>
      <p class="notes">${game.i18n.localize("LockView.Scene.LockPan_Hint")}</p>
  </div>
  <div class="form-group">
      <label>${game.i18n.localize("LockView.Scene.LockZoom")}</label>
      <input id="LockView_lockZoom" type="checkbox" name="LV_lockZoom" data-dtype="Boolean" ${lockZoom_Default ? 'checked' : ''}>
      <p class="notes">${game.i18n.localize("LockView.Scene.LockZoom_Hint")}</p>
  </div>
  <div class="form-group">
      <label>${game.i18n.localize("LockView.Scene.Autoscale.Label")}</label>
        <select name="LV_autoScale" id="action" value=${autoScale}>
          <option value="0" ${autoScaleSelected[0]}>${autoScaleOptions[0]}</option>
          <option value="1" ${autoScaleSelected[1]}>${autoScaleOptions[1]}</option>
          <option value="2" ${autoScaleSelected[2]}>${autoScaleOptions[2]}</option>
          <option value="3" ${autoScaleSelected[3]}>${autoScaleOptions[3]}</option>
        </select>
      <p class="notes">${game.i18n.localize("LockView.Scene.Autoscale_Hint")}</p>
  </div>
  <div class="form-group">
      <label>${game.i18n.localize("LockView.Scene.ForceInit")}</label>
      <input id="LockView_forceInit" type="checkbox" name="LV_forceInit" data-dtype="Boolean" ${forceInit ? 'checked' : ''}>
      <p class="notes">${game.i18n.localize("LockView.Scene.ForceInit_Hint")}</p>
  </div>
  `
  const fxFind = html.find("input[name ='initial.x']");
  const formGroup = fxFind.closest(".form-group");
  formGroup.after(fxHtml);
});

Hooks.on("closeSceneConfig", (app, html, data) => {
  let lockPan = html.find("input[name ='LV_lockPan']").is(":checked");
  let lockZoom = html.find("input[name ='LV_lockZoom']").is(":checked");
  let autoScale = html.find("select[name='LV_autoScale']")[0].value;
  let forceInit = html.find("input[name ='LV_forceInit']").is(":checked");
  
  app.object.setFlag('LockView', 'lockPan',lockPan);
  app.object.setFlag('LockView', 'lockZoom',lockZoom);
  app.object.setFlag('LockView', 'lockPan_Default',lockPan);
  app.object.setFlag('LockView', 'lockZoom_Default',lockZoom);
  app.object.setFlag('LockView', 'autoScale',autoScale);
  app.object.setFlag('LockView', 'forceInit', forceInit);
  
  if (app.entity.data._id == canvas.scene.data._id){
    let initX = canvas.scene.data.initial.x;
    let initY = canvas.scene.data.initial.y;
    canvas.scene.setFlag('LockView','initX',initX);
    canvas.scene.setFlag('LockView','initY',initY);
    sendLockView_update(lockPan,lockZoom,autoScale,forceInit);
    updateSettings();

    //set & render ui controls
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock").active = lockPan;
    ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock").active = lockZoom;
    ui.controls.render()
  }
});

//This hook is the last hook that is called when initializing scene. It's used to make sure that the payload that's sent is the most recent
Hooks.on('renderSettings',()=>{
  if (game.settings.get("LockView","Enable") == false && (game.settings.get("LockView","ForceEnable") == false || game.user.isGM)) return;
    sendViewBox(game.data.users.find(users => users.role == 4)._id);
  let lockPan = canvas.scene.getFlag('LockView', 'lockPan');
  let lockZoom = canvas.scene.getFlag('LockView', 'lockZoom');
  setBlocks(lockPan,lockZoom); 
});

function sendLockView_update(lockPan,lockZoom,autoScale,forceInit){
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

function updateSettings(){
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
  viewbox = canvas.scene._viewPosition;
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

  /**
   * Modified _constrainView from foundry.js line 10117
   * Allows higher scaling resolution
   */
  function _constrainView_Override({x, y, scale}) {
    const d = canvas.dimensions;
    if ( Number.isNumeric(scale) && (scale !== canvas.stage.scale.x) ) {
      const max = CONFIG.Canvas.maxZoom;
      const ratio = Math.max(d.width / window.innerWidth, d.height / window.innerHeight, max);
      scale = Math.round(Math.clamped(scale, 1 / ratio, max) * 2000) / 2000;
    } else {
      scale = canvas.stage.scale.x;
    }
    if ( Number.isNumeric(x) && x !== canvas.stage.pivot.x ) {
      const padw = 0.4 * (window.innerWidth / scale);
      x = Math.clamped(x, -padw, d.width + padw);
    }
    else x = canvas.stage.pivot.x;
    if ( Number.isNumeric(y) && x !== canvas.stage.pivot.y ) {
      const padh = 0.4 * (window.innerHeight / scale);
      y = Math.clamped(y, -padh, d.height + padh);
    }
    else y = canvas.stage.pivot.y;
    return {x, y, scale};
  }

  /**
 * Modified pan from foundry.js line 10034
 * redirects _constrainView to _constrainView_Override for higher scaling resolution
 */
  function pan_OverrideHigherRes({x=null, y=null, scale=null}={}) {
    const constrained = _constrainView_Override({x, y, scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
  }

/**
 * Empty function used to override Canvas.prototype._onMouseWheel and prototype._onDragCanvasPan to prevent zooming and/or panning
 */
function _Override(event) {}

/**
 * Modified pan from foundry.js line 10034
 * Removes the x and y arguents from _constrainView to prevent panning
 */
function pan_Override({x=null, y=null, scale=null}={}) {
    const constrained = this._constrainView({scale});
    this.stage.pivot.set(constrained.x, constrained.y);
    this.stage.scale.set(constrained.scale, constrained.scale);
    this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
    canvas.scene._viewPosition = constrained;
    Hooks.callAll("canvasPan", this, constrained);
    this.hud.align();
}

/**
 * Modified animatePan from foundry.js line 11134
 * Removes the x and y arguents from _constrainView to prevent panning
 */
async function animatePan_Override({x, y, scale, duration=250, speed}) {
  if ( speed ) {
    let ray = new Ray(this.stage.pivot, {x, y});
    duration = Math.round(ray.distance * 1000 / speed);
  }
  const constrained = this._constrainView({scale});
  const attributes = [
    { parent: this.stage.pivot, attribute: 'x', to: constrained.x },
    { parent: this.stage.pivot, attribute: 'y', to: constrained.y },
    { parent: this.stage.scale, attribute: 'x', to: constrained.scale },
    { parent: this.stage.scale, attribute: 'y', to: constrained.scale },
  ].filter(a => a.to !== undefined);
  await CanvasAnimation.animateLinear(attributes, {
    name: "canvas.animatePan",
    duration: duration,
    ontick: (dt, attributes) => {
      this.hud.align();
      const stage = this.stage;
      Hooks.callAll("canvasPan", this, {x: stage.pivot.x, y: stage.pivot.y, scale: stage.scale.x});
    }
  });
  this.sight.blurDistance = 20 / (CONFIG.Canvas.maxZoom - Math.round(constrained.scale) + 1);
  canvas.scene._viewPosition = constrained;
}
/**
 * Modified _onDragLeftMove from foundry.js line 11337.
 * Removes the _onDragCanvasPan command, to prevent the canvas from panning if a token is moved close to the edge
*/
function _onDragLeftMove_Override(event) {
  const layer = this.activeLayer;
  const ruler = this.controls.ruler;
  if ( ruler._state > 0 ) return ruler._onMouseMove(event);
  const isSelect = ["select", "target"].includes(game.activeTool);
  if ( isSelect && canvas.controls.select.active ) return this._onDragSelect(event);
  if ( layer instanceof PlaceablesLayer ) layer._onDragLeftMove(event);
}

function checkKeys() {
  let fired = false;
  let lockPanStorage;
  let lockZoomStorage;
  
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

class LockViewLayer extends PlaceablesLayer {
  constructor() {
    super();
  }

  static get layerOptions() {
    return mergeObject(super.layerOptions, {
      canDragCreate: false,
      objectClass: Note,
      sheetClass: NoteConfig
    });
  }
}

class Tooltip extends CanvasLayer {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.container = new PIXI.Container();
    this.maxWidth = 300;
    this.padding = 6;
    this.margin = 15;
    this.linesMargin = 4;
    this.width = 0;
    this.height = 0;
    this.addChild(this.container);
  }

  async draw() {
    super.draw();
  }

  updateTooltip(data) {
    this.container.removeChildren();
    let height = data.h;
    let width = data.w;

    var rect = new PIXI.Graphics();
    // force canvas rendering for rectangle
    rect.cacheAsBitmap = true;
    rect.lineStyle(2, data.c, 1);
    //rect.beginFill(0xffffff, 0.8);
    rect.drawRoundedRect( 
      0,
      0,
      data.w,
      data.h,
      3
    );
    
    //rect.endFill();
    this.container.addChild(rect);
   
    let x = data.x,
      y = data.y;

    x -= Math.floor(width / 2);
    y -= Math.floor(height / 2);

    this.container.setTransform(x, y);
    this.container.visible = true;
  }
  
  hide() {
    this.container.visible = false;
    //this.container.removeChildren();
  }

  show() {
    this.container.visible = true;
  }
}