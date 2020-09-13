# Lock View
Lock View is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that was made to make play using a digital playmat, such as a horizontally mounted TV, easier.<br>
The module has 4 main functions:<br>
-Autoscaling the grid so the on-screen grid corresponds with a real-world measurement<br>
-Disabling zooming<br>
-Disabling panning<br>
-Adding a viewbox so the GM can see what's shown on the TV<br>

### Scene Settings
In the scene settings screen, in 'Ambience and Atmosphere', you can find the following settings:
<ul>
<li><b>Autoscale</b> - Automatically scales the gridsize to make it correspond to a physical gridsize (in mm or inch) set in the settings</li>
<li><b>Zoom Lock</b> - Locks the zoom/fixes the scale, to prevent the user from accidentally messing up the autoscale. Can also be used without 'Autoscale'. This ignores the 'zoom' at 'Initial View Position' in the scene configuration screen</li>
<li><b>Pan Lock</b> - Locks the panning of the scene. If you use physical minis you don't want to accidentally pan</li>
</ul>
<b>Note:</b> When a token is moved to the edge of the screen and in some other cases, the scene is automatically panned. I have not yet found a way to disable this.<br>

![sceneSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/ControlButtons.png)

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
On the left of the screen, there are new control buttons for the GM:
<ul>
<li><b>Reset View</b> - Resets the view of enabled clients back to the initial view, as set in the scene configuration screen</li>
<li><b>Pan Override</b> - Overrides the pan lock</li>
<li><b>Zoom Override</b> - Overrrides the zoom lock</li>
<li><b>Viewbox</b> - Draws a square on the canvas that shows what enabled clients can see. The color of the square corresponds with the 'Player Color'</li>
</ul>

![controlButtons](https://github.com/CDeenen/LockView/blob/master/img/examples/controlButtons.png)

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

## Changelog
<b>v1.0.0</b> - 09-09-2020 - Initial release<br>
<b>v1.0.1</b> - 12-09-2020 - Fix: Refresh no longer needed after changing scene configuration. Added: Lock override keybinding, reset button, lock override buttons, viewbox button, force enable tickbox<br>