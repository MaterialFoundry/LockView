import { applySettings, forceConstrain, getPhysicalScale, moduleName } from "../lockview.js";
import { sendUpdate } from "./socket.js";
import { viewbox, getViewboxData } from "./viewbox.js";
import { SceneConfigurator, fillMissingSceneSettings } from "./settings.js";
import { compatibilityHandler } from "./compatibilityHandler.js";

let storedFlags = {};
let hideUiElementFlags;

/*
 * Push Lock View settings onto the scene configuration menu
 */
export async function renderSceneConfig(app,html){ 
    console.log('renderSceneConfig')
    getViewboxData();
    hideUiElementFlags = undefined;

    let flags = fillMissingSceneSettings(app.object.flags.LockView, true);

    let autoScaleOptions = [
        game.i18n.localize("LockView.Scene.Autoscale.Off"),
        game.i18n.localize("LockView.Scene.Autoscale.Hor"),
        game.i18n.localize("LockView.Scene.Autoscale.Vert"),
        game.i18n.localize("LockView.Scene.Autoscale.Auto"),
        game.i18n.localize("LockView.Scene.Autoscale.AutoOutside"),
        game.i18n.localize("LockView.Scene.Autoscale.Grid")
    ];
    
    let autoScaleSelected = [];
    autoScaleSelected[flags.autoScale] = "selected";

    let sidebarOptions = [
        game.i18n.localize("LockView.Scene.Sidebar_NoChange"),
        game.i18n.localize("LockView.Scene.Sidebar_Collapse"),
        game.i18n.localize("LockView.Scene.Sidebar_Expand"),
    ]

    let rotationOptions = [
        game.i18n.localize("LockView.Scene.Rotation.Landscape"),
        game.i18n.localize("LockView.Scene.Rotation.Portrait"),
        game.i18n.localize("LockView.Scene.Rotation.FlippedLandscape"),
        game.i18n.localize("LockView.Scene.Rotation.FlippedPortrait"),
    ];

    const sceneConfigHtml = `
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.LockPan")}</label>
        <input id="LockView_lockPan" type="checkbox" name="LV_lockPan" data-dtype="Boolean" ${flags.lockPanInit ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.LockPan_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.LockZoom")}</label>
        <input id="LockView_lockZoom" type="checkbox" name="LV_lockZoom" data-dtype="Boolean" ${flags.lockZoomInit ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.LockZoom_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.boundingBox")}</label>
        <input id="LockView_boundingBox" type="checkbox" name="LV_boundingBox" data-dtype="Boolean" ${flags.boundingBoxInit ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.boundingBox_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.Autoscale.Label")}</label>
            <select name="LV_autoScale" id="action" value=${flags.autoScale}>
            <option value="0" ${autoScaleSelected[0]}>${autoScaleOptions[0]}</option>
            <option value="1" ${autoScaleSelected[1]}>${autoScaleOptions[1]}</option>
            <option value="2" ${autoScaleSelected[2]}>${autoScaleOptions[2]}</option>
            <option value="3" ${autoScaleSelected[3]}>${autoScaleOptions[3]}</option>
            <option value="4" ${autoScaleSelected[4]}>${autoScaleOptions[4]}</option>
            <option value="5" ${autoScaleSelected[5]}>${autoScaleOptions[5]}</option>
            </select>
        <p class="notes">${game.i18n.localize("LockView.Scene.Autoscale_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.Rotation.Label")}</label>
            <select name="LV_rotation" id="action" value=${flags.rotation}>
            <option value=0 ${flags.rotation==0 ? "selected" : ""}>${rotationOptions[0]}</option>
            <option value=90 ${flags.rotation==90 ? "selected" : ""}>${rotationOptions[1]}</option>
            <option value=180 ${flags.rotation==180 ? "selected" : ""}>${rotationOptions[2]}</option>
            <option value=270 ${flags.rotation==270 ? "selected" : ""}>${rotationOptions[3]}</option>
            </select>
        <p class="notes">${game.i18n.localize("LockView.Scene.Rotation_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.ExcludeSidebar")}</label>
        <input id="LockView_excludeSidebar" type="checkbox" name="LV_excludeSidebar" data-dtype="Boolean" ${flags.excludeSidebar ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.excludeSidebar_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.BlackenSidebar")}</label>
        <input id="LockView_blackenSidebar" type="checkbox" name="LV_blackenSidebar" data-dtype="Boolean" ${flags.blackenSidebar ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.blackenSidebar_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.Sidebar")}</label>
            <select name="LV_sidebar" id="action" value=${flags.sidebar}>
                <option value="noChange" ${flags.sidebar=="noChange" ? "selected" : ""}>${sidebarOptions[0]}</option>
                <option value="collapse" ${flags.sidebar=="collapse" ? "selected" : ""}>${sidebarOptions[1]}</option>
                <option value="expand" ${flags.sidebar=="expand" ? "selected" : ""}>${sidebarOptions[2]}</option>
            </select>
        <p class="notes">${game.i18n.localize("LockView.Scene.Sidebar_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.HideUI")}</label>
        <div class="form-fields">
            <input id="LockView_hideUI" type="checkbox" name="LV_hideUI" data-dtype="Boolean" ${flags.hideUI ? 'checked' : ''}>
            <button type="button" title="${game.i18n.localize("LockView.Scene.HideUIDialog.Title")}" id="LockView_setUIelements"><i class="fas fa-cog"></i></button>
        </div>
        <p class="notes">${game.i18n.localize("LockView.Scene.HideUI_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.ForceInit")}</label>
        <div class="form-fields">
            <input id="LockView_forceInit" type="checkbox" name="LV_forceInit" data-dtype="Boolean" ${flags.forceInit ? 'checked' : ''}>
            <button class="capture-position" type="button" title="${game.i18n.localize("LockView.Scene.SetInitialView")}" id="LockView_setInitialView"><i class="fas fa-ruler-combined"></i></button>
        </div>
        <p class="notes">${game.i18n.localize("LockView.Scene.ForceInit_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Sett.SceneConfigurator.Title")}</label>
        <div class="form-fields">
            <button type="button" style="min-width:150px" title="${game.i18n.localize("LockView.Sett.SceneConfigurator.Title")}" id="LockView_sceneConfigurator">${game.i18n.localize("LockView.Sett.SceneConfigurator.Title")}</button>
        </div>
        <p class="notes">${game.i18n.localize("LockView.Sett.SceneConfigurator.Hint")}</p>
    </div>
    `
    
    const tab = `<a class="item" data-tab="lockview">
        <i class="fas fa-lock"></i> Lock View
        </a>`;
    const contents = `<div class="tab" data-tab="lockview">${sceneConfigHtml}</div>`

    compatibilityHandler('sceneTab', html).after(tab);
    compatibilityHandler('sceneTabContents', html).after(contents)
    
    const setInitialViewButton = html.find("button[id = 'LockView_setInitialView']");
    setInitialViewButton.on("click",event => {
        if (app.object.id == canvas.scene.id)
            handleInitialView(app.object,html);
        else
            ui.notifications.warn(game.i18n.localize("LockView.UI.NotOnScene"));
    })

    const setUIElementsButton = html.find("button[id = 'LockView_setUIelements']");
    setUIElementsButton.on("click",event => {
        if (hideUiElementFlags == undefined) hideUiElementFlags = flags.hideUIelements;
        handleUIelementsDialog(hideUiElementFlags,app);
    })

    const openSceneConfigurator = html.find("button[id='LockView_sceneConfigurator']");
    openSceneConfigurator.on("click", () => {
        new SceneConfigurator().render(true);
    });
}

function handleUIelementsDialog(hideUIelements,app) {
    const content = `
        <hr>
        <div style="display:flex">
            <label style="width:90%">${game.i18n.localize("LockView.Scene.HideUIDialog.Logo")}</label>
            <input style="width:10%" id="LockView_hideUI_Logo" type="checkbox" data-dtype="Boolean" ${hideUIelements.logo ? 'checked' : ''}>
        </div>  
        <div style="display:flex">
            <label style="width:90%">${game.i18n.localize("LockView.Scene.HideUIDialog.Navigation")}</label>
            <input style="width:10%" id="LockView_hideUI_Navigation" type="checkbox" data-dtype="Boolean" ${hideUIelements.navigation ? 'checked' : ''}>
        </div>  
        <div style="display:flex">
            <label style="width:90%">${game.i18n.localize("LockView.Scene.HideUIDialog.Controls")}</label>
            <input style="width:10%" id="LockView_hideUI_Controls" type="checkbox" data-dtype="Boolean" ${hideUIelements.controls ? 'checked' : ''}>
        </div>  
        <div style="display:flex">
            <label style="width:90%">${game.i18n.localize("LockView.Scene.HideUIDialog.Players")}</label>
            <input style="width:10%" id="LockView_hideUI_Players" type="checkbox" data-dtype="Boolean" ${hideUIelements.players ? 'checked' : ''}>
        </div>  
        <div style="display:flex">
            <label style="width:90%">${game.i18n.localize("LockView.Scene.HideUIDialog.Hotbar")}</label>
            <input style="width:10%" id="LockView_hideUI_Hotbar" type="checkbox" data-dtype="Boolean" ${hideUIelements.hotbar ? 'checked' : ''}>
        </div>  
        <div style="display:flex">
            <label style="width:90%">${game.i18n.localize("LockView.Scene.HideUIDialog.Sidebar")}</label>
            <input style="width:10%" id="LockView_hideUI_Sidebar" type="checkbox" data-dtype="Boolean" ${hideUIelements.sidebar ? 'checked' : ''}>
        </div>  
    `
    
    let d = new Dialog({
        title: `Lock View: ${game.i18n.localize("LockView.Scene.HideUIDialog.Title")}`,
        content: game.i18n.localize("LockView.Scene.HideUIDialog.Content") + content,
        buttons: {},
        close: html => {
            const uiElements = {
                logo: html.find("input[id ='LockView_hideUI_Logo']").is(":checked"),
                navigation: html.find("input[id ='LockView_hideUI_Navigation']").is(":checked"),
                controls: html.find("input[id ='LockView_hideUI_Controls']").is(":checked"),
                players: html.find("input[id ='LockView_hideUI_Players']").is(":checked"),
                hotbar: html.find("input[id ='LockView_hideUI_Hotbar']").is(":checked"),
                sidebar: html.find("input[id ='LockView_hideUI_Sidebar']").is(":checked")
            }
            hideUiElementFlags = uiElements;
        }
       });
       d.render(true);
}

/*
 * On closing the scene configuration menu, save the settings and update the view of all users
 */
export async function closeSceneConfig(app,html){
    
    const flags = fillMissingSceneSettings(app.object.flags.LockView, true);

    const config = {
        lockPan: html.find("input[name ='LV_lockPan']").is(":checked"),
        lockPanInit: html.find("input[name ='LV_lockPan']").is(":checked"),
        lockZoom: html.find("input[name ='LV_lockZoom']").is(":checked"),
        lockZoomInit: html.find("input[name ='LV_lockZoom']").is(":checked"),
        boundingBox: html.find("input[name ='LV_boundingBox']").is(":checked"),
        boundingBoxInit: html.find("input[name ='LV_boundingBox']").is(":checked"),
        autoScale: html.find("select[name='LV_autoScale']")[0].value,
        rotation: html.find("select[name='LV_rotation']")[0].value,
        sidebar: html.find("select[name='LV_sidebar']")[0].value,
        blackenSidebar: html.find("input[name ='LV_blackenSidebar']").is(":checked"),
        excludeSidebar: html.find("input[name ='LV_excludeSidebar']").is(":checked"),
        hideUI: html.find("input[name ='LV_hideUI']").is(":checked"),
        forceInit: html.find("input[name ='LV_forceInit']").is(":checked"),
        hideUIelements: hideUiElementFlags == undefined ? flags.hideUIelements : hideUiElementFlags
    };
    for (let flag of Object.entries(config)) {
        await app.object.setFlag('LockView',flag[0],flag[1]);
    }
    
    if (app.object.id == canvas.scene.id){
        //Apply the new settings
        await applySettings(true);

        //Send new settings to users
        await sendUpdate( {pan:config.lockPan, zoom:config.lockZoom, aScale:config.autoScale, rotation:config.rotation, fInit:config.forceInit, bBox:config.boundingBox, force:true} );
        await forceConstrain();
        //set & render ui controls
        if (!game.settings.get(moduleName,'hideControlButton')) {
            ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock").active = config.lockPan;
            ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock").active = config.lockZoom;
            ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "BoundingBox").active = config.boundingBox;
            ui.controls.render();
        }
        canvas.scene.setFlag('LockView', 'editViewbox', false);
    }
}

let initialViewBox = {};
let initialViewDialog;

function handleInitialView(scene,html){
    scene.sheet.close();
    initialViewBox = new InitialViewBox();
    canvas.stage.addChild(initialViewBox);
    initialViewBox.init();
    const initalData = {
        x: html.find("input[name ='initial.x']")[0].value == "" ? 0 : html.find("input[name ='initial.x']")[0].value,
        y: html.find("input[name ='initial.y']")[0].value == "" ? 0 : html.find("input[name ='initial.y']")[0].value,
        scale: html.find("input[name ='initial.scale']")[0].value == "" ? 1 : html.find("input[name ='initial.scale']")[0].value
    }
    initialViewBox.updateBox(initalData);
    let dialog = new initialViewForm();
    dialog.pushData(scene,initalData);
    dialog.render(true)
    canvas.mouseInteractionManager.target.addListener("mousedown", mouseDownEvent );
    ui.controls.controls.find(c => c.name == ui.controls.activeControl).activeTool = undefined;
}

/*
 * 
 */
class InitialViewBox extends CanvasLayer {
    constructor() {
      super();
      this.init();
      this.data = {};
    }
  
    init() {
      this.container = new PIXI.Container();
      this.addChild(this.container);
    }
  
    async draw() {
      super.draw();
    }
  
    /*
     * Update the viewbox
     */
    updateBox(data) {
        const color = 0xff0000;
        
        const width = window.innerWidth/data.scale;
        const height = window.innerHeight/data.scale;
        
        const x = data.x - Math.floor(width / 2);
        const y = data.y - Math.floor(height / 2);
    
        this.container.removeChildren();
        var drawing = new PIXI.Graphics();
        drawing.lineStyle(2, color, 1);
        drawing.drawRect(0,0,width,height);
        this.container.addChild(drawing);  
    
        var drawingCircles = new PIXI.Graphics();
        drawingCircles.lineStyle(2, color, 1);
        drawingCircles.beginFill(color);
        drawingCircles.drawCircle(-20,-20,20);
        drawingCircles.drawCircle(width+20,height+20,20);
        this.container.addChild(drawingCircles);

        var moveIcon = PIXI.Sprite.from('modules/LockView/img/icons/arrows-alt-solid.png');
        moveIcon.anchor.set(0.5);
        moveIcon.scale.set(0.25);
        moveIcon.position.set(-20,-20)
        this.container.addChild(moveIcon);

        var scaleIcon = PIXI.Sprite.from('modules/LockView/img/icons/compress-arrows-alt-solid.png');
        scaleIcon.anchor.set(0.5);
        scaleIcon.scale.set(0.20);
        scaleIcon.position.set(width+20,height+20)
        this.container.addChild(scaleIcon);
        
        this.container.setTransform(x, y);
        this.container.visible = true;

        this.data = {
            x: x,
            y: y,
            centerX: data.x,
            centerY: data.y,
            width: width,
            height: height,
            scale: data.scale
        }
    }
    
    /*
     * Hide the viewbox
     */
    hide() {
      this.container.visible = false;
    }
  
    /*
     * Show the viewbox
     */
    show() {
      this.container.visible = true;
    }
  
    /*
     * Remove the viewbox
     */
    remove() {
      this.container.removeChildren();
    }
  }

let mouseMode = null;
let startOffset = {};
var mouseDownEvent = function(e) { handleMouseDown(e) };
var mouseUpEvent = function(e) { handleMouseUp(e) };
var mouseMoveEvent = function(e) { handleMouseMove(e) };

function handleMouseDown(e){
    let position = e.data.getLocalPosition(canvas.stage);
    const d = canvas.dimensions;
  
    const moveLocation = {x: initialViewBox.data.x-20, y: initialViewBox.data.y-20};
    const scaleLocation = {x: initialViewBox.data.x+initialViewBox.data.width+20, y: initialViewBox.data.y+initialViewBox.data.height+20};

    if (Math.abs(position.x - moveLocation.x) <= 20 && Math.abs(position.y - moveLocation.y) <= 20) mouseMode = 'move';
    else if (Math.abs(position.x - scaleLocation.x) <= 20 && Math.abs(position.y - scaleLocation.y) <= 20) mouseMode = 'scale';
    else return;

    if (mouseMode == 'move'){
        startOffset = {
            x: position.x - moveLocation.x,
            y: position.y - moveLocation.y
          }

    }
    else {
        startOffset = {
            x: position.x - scaleLocation.x,
            y: position.y - scaleLocation.y
          }
    }
    
    canvas.mouseInteractionManager.target.addListener("mouseup", mouseUpEvent );
    canvas.mouseInteractionManager.target.addListener("mousemove", mouseMoveEvent );
    
}

function handleMouseUp(){
  mouseMode = null; 
  canvas.mouseInteractionManager.target.removeListener("mousemove", mouseMoveEvent );

}

function handleMouseMove(e){
  let position = e.data.getLocalPosition(canvas.stage);
  position.scale = initialViewBox.data.scale;
  let width = initialViewBox.data.width;
  let height = initialViewBox.data.height;

  if (mouseMode == 'move') {
    position.x += -startOffset.x + 20 + initialViewBox.data.width/2
    position.y += -startOffset.y + 20 + initialViewBox.data.height/2
  }
  else {
    let offsetX = initialViewBox.data.x + width + 20 - position.x;
    position.scale = (width + offsetX)/width;
    let newWidth = width - offsetX;
    

    if (newWidth <= window.innerWidth/CONFIG.Canvas.maxZoom) return;

    position.scale = window.innerWidth/newWidth;
    let offsetY = offsetX*height/width;

    position.x = initialViewBox.data.centerX - offsetX/2;
    position.y = initialViewBox.data.centerY - offsetY/2;
  }

  initialViewBox.updateBox(position);
  position.x = Math.round(position.x);
  position.y = Math.round(position.y);

  position.scale = Math.round(position.scale*100)/100;

    if (document.getElementById("lockView_initialViewForm") != null) {
        let elementX = document.getElementsByName("dataX")[0];
        let elementY = document.getElementsByName("dataY")[0];
        let elementScale = document.getElementsByName("dataScale")[0];
        let elementGridX = document.getElementsByName("gridX")[0];
        let elementGridY = document.getElementsByName("gridY")[0];
        elementX.value = position.x;
        elementY.value = position.y;
        elementScale.value = position.scale;
        elementGridX.value = window.innerWidth/(position.scale*canvas.scene.grid.size);
        elementGridY.value = window.innerHeight/(position.scale*canvas.scene.grid.size);
    }
}

export function closeInitialViewForm(){
    canvas.scene.sheet.render(true);
    initialViewBox.remove();
    canvas.mouseInteractionManager.target.removeListener("mousedown", mouseDownEvent );
    canvas.mouseInteractionManager.target.removeListener("mouseup", mouseUpEvent );
    canvas.mouseInteractionManager.target.removeListener("mousemove", mouseMoveEvent );
}

export class initialViewForm extends FormApplication {
    constructor(data, options) {
        super(data, options);
        this.scene;
        this.initial = canvas.scene.initial;
        this.users = [];
        this.selectedPlayer = 0;
    }

    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "lockView_initialViewForm",
            title: game.i18n.localize("LockView.SetInitialView.Title"),
            template: "./modules/LockView/templates/initialView.html",
            classes: ["sheet"]
        });
    }

    pushData(scene,initialView) {
        this.scene = scene;
        this.initial = initialView;
    }

    /**
     * Provide data to the template
     */
    getData() {
        ui.controls.initialize({control:'LockView'});
        
        const gridSpaces = {
            x: initialViewBox.data.width/canvas.scene.grid.size,
            y: initialViewBox.data.height/canvas.scene.grid.size
        }
        let users = [];
        let counter = 0;
        for (let vb of viewbox) {
            if (vb == undefined) continue;
            users.push({
                name: vb.boxName,
                userId: vb.userId,
                iteration: counter
            });
            counter++;
        }
        this.users = users;
        
        return {
            initial: this.initial,
            grid: gridSpaces,
            users: users
        } 
    }

    /**
     * Update on form submit
     * @param {*} event 
     * @param {*} formData 
     */
    async _updateObject(event, formData) {
        if (event.submitter.name == 'save') {
            let initial = {
                x: formData.dataX,
                y: formData.dataY,
                scale: formData.dataScale
            }
            this.scene.update({initial:initial})
        }
        
       // closeInitialViewForm();
    }

    activateListeners(html) {
        super.activateListeners(html);
        const dataX = html.find("input[name='dataX']");
        const dataY = html.find("input[name='dataY']");
        const dataScale = html.find("input[name='dataScale']");
        const gridX = html.find("input[name='gridX']");
        const gridY = html.find("input[name='gridY']");
        const physicalScale = html.find("button[name='physicalGrid']");
        const snapGrid = html.find("button[name='snapGrid']");
        const playerList = html.find("select[name='playerList']");
        const captureView = html.find("button[name='captureView']");
        
        dataX.on("change", event => {
            const newData = {
                x: event.target.value,
                y: initialViewBox.data.centerY,
                scale: initialViewBox.data.scale
            }
            initialViewBox.updateBox(newData);
        });

        dataY.on("change", event => {
            const newData = {
                x: initialViewBox.data.centerX,
                y: event.target.value,
                scale: initialViewBox.data.scale
            }
            initialViewBox.updateBox(newData);
        });

        dataScale.on("change", event => {
            let scale = event.target.value;
            if (scale > CONFIG.Canvas.maxZoom){
                scale = CONFIG.Canvas.maxZoom;
                html.find("input[name='dataScale']")[0].value = scale;
            }
            const newData = {
                x: initialViewBox.data.centerX,
                y: initialViewBox.data.centerY,
                scale: scale
            }
            initialViewBox.updateBox(newData);
            html.find("input[name='gridX']")[0].value = window.innerWidth/(scale*compatibilityHandler('gridSize'));
            html.find("input[name='gridY']")[0].value = window.innerHeight/(scale*compatibilityHandler('gridSize'));
        });

        gridX.on("change", event => {
            let scale = window.innerWidth/(compatibilityHandler('gridSize')*event.target.value);
            if (scale > CONFIG.Canvas.maxZoom){
                scale = CONFIG.Canvas.maxZoom;
                html.find("input[name='gridX']")[0].value = window.innerWidth/(scale*compatibilityHandler('gridSize'));
            }
            const newData = {
                x: initialViewBox.data.centerX,
                y: initialViewBox.data.centerY,
                scale: scale
            }
            initialViewBox.updateBox(newData);
            html.find("input[name='dataScale']")[0].value = scale;
            html.find("input[name='gridY']")[0].value = window.innerHeight/(scale*compatibilityHandler('gridSize'));
        });

        gridY.on("change", event => {
            let scale = window.innerHeight/(compatibilityHandler('gridSize')*event.target.value);
            if (scale > CONFIG.Canvas.maxZoom){
                scale = CONFIG.Canvas.maxZoom;
                html.find("input[name='gridY']")[0].value = window.innerHeight/(scale*compatibilityHandler('gridSize'));
            }
            const newData = {
                x: initialViewBox.data.centerX,
                y: initialViewBox.data.centerY,
                scale: scale
            }
            initialViewBox.updateBox(newData);
            html.find("input[name='dataScale']")[0].value = scale;
            html.find("input[name='gridX']")[0].value = window.innerWidth/(scale*compatibilityHandler('gridSize'));
        });

        physicalScale.on("click", event => {
            let scale = getPhysicalScale();
            if (scale > CONFIG.Canvas.maxZoom){
                scale = CONFIG.Canvas.maxZoom;
            }
            const newData = {
                x: initialViewBox.data.centerX,
                y: initialViewBox.data.centerY,
                scale: scale
            }
            initialViewBox.updateBox(newData);
            html.find("input[name='dataScale']")[0].value = scale;
            html.find("input[name='gridX']")[0].value = window.innerWidth/(scale*compatibilityHandler('gridSize'));
            html.find("input[name='gridY']")[0].value = window.innerHeight/(scale*compatibilityHandler('gridSize'));
        });

        snapGrid.on("click", event => {
            const snapDir = html.find("select[name='snapDir']")[0].value;

            let position = {};
            if (snapDir == 'topLeft') position = {x: initialViewBox.data.x, y: initialViewBox.data.y};
            else if (snapDir == 'topRight') position = {x: initialViewBox.data.x + initialViewBox.data.width, y: initialViewBox.data.y};
            else if (snapDir == 'downLeft') position = {x: initialViewBox.data.x, y: initialViewBox.data.y + initialViewBox.data.height};
            else if (snapDir == 'downRight') position = {x: initialViewBox.data.x + initialViewBox.data.width, y: initialViewBox.data.y + initialViewBox.data.height};

            const center = compatibilityHandler('getCenter', canvas.grid, position.x, position.x);
            const gridSize = this.scene.grid.size;
            let offset = {
                x:gridSize/2, 
                y:gridSize/2
            };
            if (position.x - center[0] <= 0) offset.x = -gridSize/2;
            if (position.y - center[1] <= 0) offset.y = -gridSize/2;
            position.x = center[0] + offset.x;
            position.y = center[1] + offset.y;

            let newData = {}
            if (snapDir == 'topLeft')           {newData.x = position.x + initialViewBox.data.width/2; newData.y = position.y + initialViewBox.data.height/2}
            else if (snapDir == 'topRight')     {newData.x = position.x - initialViewBox.data.width/2; newData.y = position.y + initialViewBox.data.height/2}
            else if (snapDir == 'downLeft')     {newData.x = position.x + initialViewBox.data.width/2; newData.y = position.y - initialViewBox.data.height/2}
            else if (snapDir == 'downRight')    {newData.x = position.x - initialViewBox.data.width/2; newData.y = position.y - initialViewBox.data.height/2}

            newData.scale = initialViewBox.data.scale;
            initialViewBox.updateBox(newData);
            html.find("input[name='dataX']")[0].value = newData.x;
            html.find("input[name='dataY']")[0].value = newData.y;
        });

        playerList.on("change", event => {
            let id = event.target.value.replace('player-','');
            this.selectedPlayer = parseInt(id);
        });

        captureView.on("click", event => {
            let newData;
            for (let vb of viewbox) {
                if (vb == undefined) continue;
                if (this.users[this.selectedPlayer].userId == vb.userId)
                newData = vb.currentPosition;
            }

            initialViewBox.updateBox(newData);
            html.find("input[name='dataX']")[0].value = newData.x;
            html.find("input[name='dataY']")[0].value = newData.y;
            html.find("input[name='dataScale']")[0].value = newData.scale;
            html.find("input[name='gridX']")[0].value = window.innerWidth/(newData.scale*canvas.scene.grid.size);
            html.find("input[name='gridY']")[0].value = window.innerHeight/(newData.scale*canvas.scene.grid.size);
        });
    }
}