# Lock View
Lock View is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that was made to make play using a digital playmat, such as a horizontally mounted TV, easier.<br>
The module has 4 main functions:<br>
-Autoscaling: Scales the grid so the on-screen grid corresponds with a real-world measurement<br>
-Zoom lock: Locks the zooming of the scene to prevent the user from (accidentally) messing up the autoscale<br>
-Pan lock: Locks the panning of the scene. If you use physical minis you don't want to accidentally pan<br>
-Viewbox: so the GM can see what's shown on the TV, and allows the GM to control the pan and zoom<br>
<br>
'Autoscaling', 'Zoom Lock' and 'Pan Lock' can be set for each scene independently.<br>
'Zoom Lock' and 'Pan Lock' can be enabled and disabled at any time using control buttons.<br>
These functions can be applied to selected connected clients (must be set in the client's module settings screen), or for all non-GM connected clients (is set in the GM's module settings screen).<br>

### Scene Settings
In the scene settings screen, in 'Ambience and Atmosphere', you can find the following settings:
<ul>
<li><b>Pan Lock</b> - Initial 'Pan Lock' setting</li>
<li><b>Zoom Lock</b> - Initial 'Zoom Lock' setting</li>
<li><b>Autoscale</b> - Automatically scales the gridsize to make it correspond to a physical gridsize (in mm or inch) set in the settings</li>
</ul>
The 'Pan Lock' and 'Zoom Lock' settings determine the initial settings. These are applied when a scene is loaded for the first time, or after closing the scene configuration screen.<br>
When closing the scene configuration screen and 'Autoscale' is enabled, the connected client's view will be reset to the initial position and calculated scale.<br>

![sceneSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/SceneSettings.png)

### Module Settings
There are some more settings in the module settings screen:<br>
<ul>
<li><b>Enable</b> - Checking this box enables the module for the client. You only want to have this enabled for the client that is connected to the TV</li>
<li><b>Screen Width</b> - Fill in the physical screen width in mm or inch of the TV</li>
<li><b>Gridsize</b> - Fill in the desired gridsize in mm or inch (must be the same unit as 'Screen Width'). This is usually 25 mm or 1 inch</li>
<li><b>Force Enable</b> - GM only. Forces all non-GM clients to enable the module</li>
<li><b>Lock Override</b> - Enter a keybinding that allows you to override the zoom and pan lock while the keys are pressed</li>
</ul>

![moduleSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/ModuleSettings.png)

### Control Buttons
On the left of the screen, there are new control buttons for the GM:<br>
<ul>
<li><b>Reset View</b> - Resets the view of enabled clients back to the initial view, as set in the scene configuration screen</li>
<li><b>Pan Lock</b> - Shows the current state of the 'Pan Lock'. If on, panning is disabled</li>
<li><b>Zoom Lock</b> - Shows the current state of the 'Zoom Lock'. If on, zooming is disabled</li>
<li><b>Viewbox</b> - Draws a square on the canvas that shows what enabled clients can see. The color of the square corresponds with the 'Player Color'</li>
<li><b>Edit Viewbox</b> - Allows the GM to edit the viewbox, and the client's view. Right-click dragging drags the viewbox and pans the client's sceen, the scrollwheel increases or decreases the size of the viewbox and zooms the client's screen in or out</li>
</ul>
<b>Note:</b> The behaviour of the control buttons has changed compared to v1.0.1<br>

![controlButtons](https://github.com/CDeenen/LockView/blob/master/img/examples/ControlButtons.png)

### Viewbox

![viewBox](https://github.com/CDeenen/LockView/blob/master/img/examples/ViewBox.png)

### Future plans
<ol>
<li>Add a button on the left of the screen that gives control over the viewbox, such as moving and scaling it (thus panning and scaling the player's scene)</li>
<li>Find a way to disable panning when a token is moved to the edge of the screen</li>
<li>Check compatibility with modules that move tokens around, for example, using teleport</li>
<li>Remove TV settings from GMs settings page</ls>
</ol>

## Software Versions & Module Incompatibilities
<b>Foundry VTT:</b> Tested on 0.6.6<br>
<b>Module Incompatibilities:</b> None known<br>

## Feedback
If you have any suggestions or bugs to report, feel free to contact me on Discord (Cris#6864), or send me an email: cdeenen@outlook.com.

## Credits
<b>Main author:</b> Cristian Deenen (Cris#6864 on Discord)<br>
<b>Other:</b> The tooltip class was modified from the vtta-party module by Sebastian Will from <a href="https://www.vttassets.com">VTTA Assets</a><br>
settings-extender was written by <a href="https://gitlab.com/foundry-azzurite/settings-extender">Azzurite</a> 