You can configure Lock View in the module settings.<br>
Some settings are available to all users, some are available to Control users, and some are available to gamemasters.

| Setting    | Type     | Access    | Description   |
|------------|----------|-----------|---------------|
| Documentation | Button    | Everyone  | Opens this documentation.  |
| User Configurator     | Button    | Gamemaster    | Opens the [User Configurator](./userConfigurator.md).    |
| Scene Configurator    | Button    | Gamemaster    | Opens the [Scene Configurator](./sceneConfigurator.md).    |
| Clone View Configurator   | Button    | Control users | Opens the [Clone View Configurator](./cloneViewConfigurator.md). |
| Control Buttons Configurator  | Button    | Control users | Opens the [Control Buttons Configurator](./controlButtonsConfigurator.md).   |
| Mouse Viewbox Editing    | Checkbox  | Gamemaster | When this setting and [Edit Viewbox](../viewbox.md#edit-viewbox) is enabled, scrolling and right-click dragging the mouse will change the view of the viewbox' user instead of yours. |
| Pan Canvas to Ping Behavior   | Select    | Gamemaster | When using Pan Canvas to Ping (shift + hold left mouse button), all users normally pan to that spot. However, since Lock View can lock pan and zoom, you can control whether these locks should apply:<br><b>-Prevent All Locked Movement</b>: Do not allow zooming or panning if their respective lock is enabled.<br><b>-Allow Panning, Prevent Zooming</b>: Do not allow zooming if Zoom Lock is enabled.<br><b>-Allow Zooming, Prevent Panning</b>: Do not allow panning if Pan Lock is enabled.<br><b>Allow All Movement</b>: Do not prevent any movement, regardless of how the locks are configured. |
| Physical Grid Size | Number | Everyone/Gamemaster | Sets the physical dimensions of your display, see [here](../sceneConfig/autoscale.md#physical-grid-size). |