/*
 * Add a lockview tab to the drawing configuration dialog
 */
export function drawingConfigApp(app, html, data){
  let boundingBox_mode = 0;
    if (data.object.shape.type != 'r') return;
    if (app.object.flags["LockView"]){
      if (app.object.flags["LockView"].boundingBox_mode)
        boundingBox_mode = app.object.getFlag('LockView', 'boundingBox_mode');
      else 
        app.object.setFlag('LockView', 'boundingBox_mode', 0);
    }

    const options = [
      game.i18n.localize("LockView.boundingBox.Mode0"),
      game.i18n.localize("LockView.boundingBox.Mode1"),
      game.i18n.localize("LockView.boundingBox.Mode2")
    ];
    let optionsSelected = [
      "",
      "",
      ""
    ];
    optionsSelected[boundingBox_mode] = "selected"
  
    const tab = `<a class="item" data-tab="lockview">
    <i class="fas fa-lock"></i> Lock View
    </a>`;
    const contents = `
      <div class="tab" data-tab="lockview">
        <p class="notes">${game.i18n.localize("LockView.boundingBox.Note")}</p>
        <div class="form-group">
          <label>${game.i18n.localize("LockView.boundingBox.Label")}</label>
          <select name="LV_boundingBox" id="boundingBox" value=1>
            <option value="0" ${optionsSelected[0]}>${options[0]}</option>
            <option value="1" ${optionsSelected[1]}>${options[1]}</option>
            <option value="2" ${optionsSelected[2]}>${options[2]}</option>
          </select>
        </div>
      </div>
      `
      html.find(".tabs .item").last().after(tab);
      html.find(".tab").last().after(contents);
  }
  
/*
 * On closing the drawing configuration dialog, set a flag to the drawing
 */
export function closeDrawingConfigApp(app,html){
  if (app.object.shape.type != 'r') return;
  const boundingBox = html.find("select[name='LV_boundingBox']")[0].value;
  app.object.setFlag('LockView', 'boundingBox_mode', boundingBox);
}