import * as MODULE from "../lockview.js";

export function renderSceneConfig(app,html){ 
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
            <option value="4" ${autoScaleSelected[4]}>${autoScaleOptions[4]}</option>
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
}

export function closeSceneConfig(app,html){let lockPan = html.find("input[name ='LV_lockPan']").is(":checked");
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
        let initX,initY;
        if (canvas.scene.data.initial != undefined && canvas.scene.data.initial != null){
            initX = canvas.scene.data.initial.x;
            initY = canvas.scene.data.initial.y;
        }
        canvas.scene.setFlag('LockView','initX',initX);
        canvas.scene.setFlag('LockView','initY',initY);
        MODULE.sendLockView_update(lockPan,lockZoom,autoScale,forceInit);
        MODULE.updateSettings();

        //set & render ui controls
        ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "PanLock").active = lockPan;
        ui.controls.controls.find(controls => controls.name == "LockView").tools.find(tools => tools.name == "ZoomLock").active = lockZoom;
        ui.controls.render()
    }
}