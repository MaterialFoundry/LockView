import * as MODULE from "../lockview.js";
import * as SOCKET from "./socket.js";

/*
 * Push Lock View settings onto the scene configuration menu
 */
export function renderSceneConfig(app,html){ 
    let lockPan_Default = false;
    let lockZoom_Default = false;
    let autoScale = 0;
    let forceInit = false;
    let boundingBox = false;
    let excludeSidebar = false;
    let blackenSidebar = false;

    if(app.object.data.flags["LockView"]){
        if (app.object.data.flags["LockView"].lockPanInit){
        lockPan_Default = app.object.getFlag('LockView', 'lockPanInit');
        } 
        else app.object.setFlag('LockView', 'lockPanInit', false);

        if (app.object.data.flags["LockView"].lockZoomInit){
        lockZoom_Default = app.object.getFlag('LockView', 'lockZoomInit');
        } 
        else app.object.setFlag('LockView', 'lockZoomInit', false);

        if (app.object.data.flags["LockView"].autoScale){
        autoScale = app.object.getFlag('LockView', 'autoScale');
        } else app.object.setFlag('LockView', 'autoScale', 0);

        if (app.object.data.flags["LockView"].forceInit){
        forceInit = app.object.getFlag('LockView', 'forceInit');
        } else app.object.setFlag('LockView', 'forceInit', false);

        if (app.object.data.flags["LockView"].boundingBoxInit){
            boundingBox = app.object.getFlag('LockView', 'boundingBoxInit');
        } else app.object.setFlag('LockView', 'boundingBoxInit', false);

        if (app.object.data.flags["LockView"].excludeSidebar){
            excludeSidebar = app.object.getFlag('LockView', 'excludeSidebar');
        } else app.object.setFlag('LockView', 'excludeSidebar', false);

        if (app.object.data.flags["LockView"].blackenSidebar){
            blackenSidebar = app.object.getFlag('LockView', 'blackenSidebar');
        } else app.object.setFlag('LockView', 'blackenSidebar', false);
    } 
    
    let autoScaleOptions = [
        game.i18n.localize("LockView.Scene.Autoscale.Off"),
        game.i18n.localize("LockView.Scene.Autoscale.Hor"),
        game.i18n.localize("LockView.Scene.Autoscale.Vert"),
        game.i18n.localize("LockView.Scene.Autoscale.Auto"),
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
    <header class="form-header">
        <h3><i class="fas fa-lock"/></i> Lock View</h3>
    </header>
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
        <label>${game.i18n.localize("LockView.Scene.boundingBox")}</label>
        <input id="LockView_boundingBox" type="checkbox" name="LV_boundingBox" data-dtype="Boolean" ${boundingBox ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.boundingBox_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.Autoscale.Label")}</label>
            <select name="LV_autoScale" id="action" value=${autoScale}>
            <option value="0" ${autoScaleSelected[0]}>${autoScaleOptions[0]}</option>
            <option value="1" ${autoScaleSelected[1]}>${autoScaleOptions[1]}</option>
            <option value="2" ${autoScaleSelected[2]}>${autoScaleOptions[2]}</option>
            <option value="3" ${autoScaleSelected[3]}>${autoScaleOptions[3]}</option>
            <option value="4" ${autoScaleSelected[4]}>${autoScaleOptions[4]}</option>
            </select>
        <p class="notes">${game.i18n.localize("LockView.Scene.Autoscale_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.ExcludeSidebar")}</label>
        <input id="LockView_excludeSidebar" type="checkbox" name="LV_excludeSidebar" data-dtype="Boolean" ${excludeSidebar ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.excludeSidebar_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.BlackenSidebar")}</label>
        <input id="LockView_blackenSidebar" type="checkbox" name="LV_blackenSidebar" data-dtype="Boolean" ${blackenSidebar ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.blackenSidebar_Hint")}</p>
    </div>
    <div class="form-group">
        <label>${game.i18n.localize("LockView.Scene.ForceInit")}</label>
        <input id="LockView_forceInit" type="checkbox" name="LV_forceInit" data-dtype="Boolean" ${forceInit ? 'checked' : ''}>
        <p class="notes">${game.i18n.localize("LockView.Scene.ForceInit_Hint")}</p>
    </div>
    `
    const submitBtn = html.find("button[name = 'submit']");
    submitBtn.before(fxHtml);
}

/*
 * On closing the scene configuration menu, save the settings and update the view of all users
 */
export async function closeSceneConfig(app,html){let lockPan = html.find("input[name ='LV_lockPan']").is(":checked");
    let lockZoom = html.find("input[name ='LV_lockZoom']").is(":checked");
    let autoScale = html.find("select[name='LV_autoScale']")[0].value;
    let forceInit = html.find("input[name ='LV_forceInit']").is(":checked");
    let boundingBox = html.find("input[name ='LV_boundingBox']").is(":checked");
    let excludeSidebar = html.find("input[name ='LV_excludeSidebar']").is(":checked");
    let blackenSidebar = html.find("input[name ='LV_blackenSidebar']").is(":checked");
    await app.object.setFlag('LockView', 'lockPan',lockPan);
    await app.object.setFlag('LockView', 'lockPanInit',lockPan);
    await app.object.setFlag('LockView', 'lockZoom',lockZoom);
    await app.object.setFlag('LockView', 'lockZoomInit',lockZoom);
    await app.object.setFlag('LockView', 'autoScale',autoScale);
    await app.object.setFlag('LockView', 'forceInit', forceInit);
    await app.object.setFlag('LockView', 'boundingBox', boundingBox);
    await app.object.setFlag('LockView', 'boundingBoxInit', boundingBox);
    await app.object.setFlag('LockView', 'excludeSidebar', excludeSidebar);
    await app.object.setFlag('LockView', 'blackenSidebar', blackenSidebar);

    if (app.entity.data._id == canvas.scene.data._id){

        //Apply the new settings
        await MODULE.applySettings(true);

        //Send new settings to users
        await SOCKET.sendUpdate( {pan:lockPan, zoom:lockZoom, aScale:autoScale, fInit:forceInit, bBox:boundingBox, force:true} );
        await MODULE.forceConstrain();
        //set & render ui controls
        ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock").active = lockPan;
        ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock").active = lockZoom;
        ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "BoundingBox").active = boundingBox;
        canvas.scene.setFlag('LockView', 'editViewbox', false);
        ui.controls.controls.find(controls => controls.name == "LockView").activeTool = undefined;
        ui.controls.render()
    }
}