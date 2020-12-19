# Lock View
Lock View is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that gives the GM control over the zoom and pan capabilities of players, such as locking the zoom or pan, moving the canvas, or setting the view to a specified setting. The module was originally made to make play using a digital playmat, such as a horizontally mounted TV, easier. But the module can also be useful for digital play, for example if you have a static screen and you don't want your players to move.<br>
<br>
The module has 5 main functions:<br>
-<b>Autoscaling:</b> Scales the scene in various ways (horizontal fit, vertical fit, automatic fit, or scaled to a physical gridsize)<br>
-<b>Zoom lock:</b> Locks the zooming of the scene to prevent the user from (accidentally) messing up the autoscale<br>
-<b>Pan lock:</b> Locks the panning of the scene. If you use physical minis you don't want to accidentally pan<br>
-<b>Force initial view:</b> After loading a new scene, the view is forced to the initial view (as set in the scene configuration menu), regardless of the position of tokens<br>
-<b>Viewbox:</b> Allows the GM to see what's shown on the client's screens, and allows the GM to control the pan and zoom of those clients<br>
<br>
'Autoscaling', 'Zoom Lock', 'Pan Lock' and 'Force Initial View' can be set for each scene independently.<br>
'Zoom Lock' and 'Pan Lock' can be enabled and disabled at any time using control buttons.<br>
These functions can be applied to selected connected clients (must be set in the client's module settings screen), or to all non-GM connected clients (is set in the GM's module settings screen).<br>
<br>
<b>Note: When 'Zoom Lock' or 'Pan Lock' is enabled, this module disables all zooming and/or panning functionality, regardless of who or what is requesting that zoom or pan. This means that, for example, modules that try to pan or zoom won't work.</b>

## Usage
### Physical Play
When using a horizontally mounted screen, for the purpose of playing with physical mini's, you should do the following:<br>
<br>
<b>GM's client, module settings:</b><br>
-If you only have the TV's client connected, you can enable 'Force Enable', otherwise set 'Enable' in the TV's client<br>
<br>
<b>GM's client, scene configuration menu (for each scene):</b><br>
-Set 'Autoscale' to 'Physical Gridsize', which forces the TV's client to a specific zoom, ensuring the grid is always the same physical size<br>
-Enable 'Lock Pan' and 'Lock Zoom', which prevents the TV's client from accidentally zooming or panning<br>
<br>
<b>TV's client, module settings:</b><br>
-Set 'Enable' on if 'Force Enable' is disabled on the GM's client<br>
-Set 'Gridsize' to the desired physical size of the grid. Usually 25 mm or 1 inch. Only fill in the number, not the units<br>
-Set 'Screen Width' to the physical width of your screen (the actual screen, without bezel). Must be in the same units as 'Gridsize'<br>
<br>
Refer to the 'Settings and Controls' section below to see how the GM can manipulate the view of the TV's client.

### Digital Play
The module can also be used when playing digitally (every play has their own computer). When doing so, you can ignore the following settings:<br>
-'Gridsize' and 'Screen Width' in the module settings<br>
-'Physical Gridsize' in the scene configuration menu (Autoscale option) and in the 'Set View' dialog box<br>
<br>
You probably want to set 'Force Enable' in the GM's module settings, so the module is enabled for all connected players.<br>
Refer to the 'Settings and Controls' section below to see how the GM can manipulate the view of the player clients. 

## Settings and Controls
### Scene Settings
In the scene settings screen, in 'Ambience and Atmosphere', you can find the following settings:
<ul>
<li><b>Pan Lock</b> - Initial 'Pan Lock' setting</li>
<li><b>Zoom Lock</b> - Initial 'Zoom Lock' setting</li>
<li><b>Autoscale</b> - Automatically scales the screen</li>
<li><b>Force Initial View</b> - Forces the view to the 'Initial View Position' after loading the scene. Only works if 'Autoscale' is set to 'Off'</li>
</ul>
Autoscale can be set to the following options:
<ul>
<li><b>Off</b> - Autoscale disabled</li>
<li><b>Horizontal Fit</b> - Automatically scales the scene to fit the browser window. Horizontal fit, so it may cut off vertical parts of the scene</li>
<li><b>Vertical Fit</b> - Automatically scales the scene to fit the browser window. Vertical fit, so it may cut off horizontal parts of the scene</li>
<li><b>Automatic Fit</b> - Automatically chooses horizontal or vertical fit so no non-image background will ever be seen</li>
<li><b>Physical Gridsize</b> - Scales the scene so the on-screen gridsize corresponds with a real world value (for example 25mm or 1")</li>
</ul>
<b>Note 1:</b> The 'Pan Lock' and 'Zoom Lock' settings determine the initial settings. These are applied when a scene is loaded, or after closing the scene configuration screen. After that, you can enable or disable the Pan and Zoom lock by pressing the control buttons (see below).<br>
<b>Note 2:</b> 'Horizontal Fit', 'Vertical Fit', 'Automatic Fit' and 'Physical Gridsize' are applied when a scene is loaded, or after closing the scene configuration screen. After that, the player can zoom and pan around (if Zoom Lock or Pan Lock are disabled)<br>
<b>Note 3:</b> When using 'Physical Gridsize', the on-screen gridsize is determined by setting the 'Screen Width' and 'Gridsize' in the module settings. These settings are local, which means that they can be different for each connected client.<br>
<br>

![sceneSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/SceneSettings.png)

### Module Settings
There are some more settings in the module settings screen:<br>
<ul>
<li><b>Enable</b> - Checking this box enables the module for the client. You only want to have this enabled for the client that is connected to the TV, or for player whose view you want to control</li>
<li><b>Screen Width</b> - Fill in the physical screen width in mm or inch of the TV</li>
<li><b>Gridsize</b> - Fill in the desired gridsize in mm or inch (must be the same unit as 'Screen Width'). This is usually 25 mm or 1 inch</li>
<li><b>Force Enable</b> - GM only. Forces all non-GM clients to enable the module</li>
<li><b>Lock Override</b> - Enter a keybinding that allows you to override the zoom and pan lock while the keys are pressed</li>
</ul>

![moduleSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/ModuleSettings.png)

### Control Buttons
On the left of the screen, there are new control buttons for the GM:<br>
<ul>
<li><b>Set View</b> - Creates a dialog box with options to set the view, see below</li>
<li><b>Pan Lock</b> - Shows the current state of the 'Pan Lock'. If on, panning is disabled</li>
<li><b>Zoom Lock</b> - Shows the current state of the 'Zoom Lock'. If on, zooming is disabled</li>
<li><b>Viewbox</b> - Draws a rectangle on the canvas that shows what enabled clients can see. The color of the rectangle corresponds with the 'Player Color'</li>
<li><b>Edit Viewbox</b> - Allows the GM to edit the viewbox, and the client's view. Right-click dragging drags the viewbox and pans the client's sceen, the scrollwheel increases or decreases the size of the viewbox and zooms the client's screen in or out</li>
</ul>
<br>

![controlButtons](https://github.com/CDeenen/LockView/blob/master/img/examples/ControlButtons2.png)

#### Set View Dialog
After clicking the 'Set View' control button, a dialog box appears that gives multiple options to control the view of connected clients. There's 2 dropdown menu's, and 3 number boxes<br>
<br>
<b>Top dropdown menu (X & Y movement)</b><br>
<ul>
<li><b>Reset to initial view</b> - Resets the view to the initial view position, as set in the scene configuration screen</li>
<li><b>Horizontal fit</b> - Scale and move the view so the scene fits horizontally</li>
<li><b>Vertical fit</b> - Scale and move the view so the scene fits vertically</li>
<li><b>Automatic Fit</b> - Automatically chooses horizontal or vertical fit so no non-image background will ever be seen</li>
<li><b>Move grid spaces</b> - Moves the view in grid-units, relative to the current view. So setting X to 1 will move the view 1 gridspace to the right</li>
<li><b>Move to coordinates</b> - Moves the view to the absolute coordinates as set in the number boxes</li>
</ul>

<b>Bottom dropdown menu (Zooming)</b><br>
<ul>
<li><b>Ignore scale</b> - No zooming will occur</li>
<li><b>Set scale</b> - Zooms to the scale size set in the 'Scale' box</li>
<li><b>Reset scale</b> - Resets the zoom to the initial zoom factor, as set in the scene configuration screen</li>
<li><b>Physical gridscale</b> - Automatically scales the gridsize to make it correspond to a physical gridsize (in mm or inch), as set in the module settings </li>
</ul>

![setViewDialog](https://github.com/CDeenen/LockView/blob/master/img/examples/SetViewDialog.png)

### Viewbox

![viewBox](https://github.com/CDeenen/LockView/blob/master/img/examples/ViewBox.png)

## Software Versions & Module Incompatibilities
<b>Foundry VTT:</b> Tested on 0.6.6 and 0.7.3<br>
<b>Module Incompatibilities:</b> Modules that try to pan or zoom, such as LookAtThat<br>

## Feedback
If you have any suggestions or bugs to report, feel free to contact me on Discord (Cris#6864), or send me an email: cdeenen@outlook.com.

## Credits
<b>Main author:</b> Cristian Deenen (Cris#6864 on Discord)<br>
<b>Other:</b> 
-The tooltip class was modified from the vtta-party module by Sebastian Will from <a href="https://www.vttassets.com">VTTA Assets</a><br>
-settings-extender was written by <a href="https://gitlab.com/foundry-azzurite/settings-extender">Azzurite</a> 
<br>
Please consider supporting me on <a href="https://www.patreon.com/materialfoundry">Patreon</a>.

## Abandonment
Abandoned modules are a (potential) problem for Foundry, because users and/or other modules might rely on abandoned modules, which might break in future Foundry updates.<br>
I consider this module abandoned if all of the below cases apply:
<ul>
  <li>This module/github page has not received any updates in at least 3 months</li>
  <li>I have not posted anything on "the Foundry" and "the League of Extraordinary Foundry VTT Developers" Discord servers in at least 3 months</li>
  <li>I have not responded to emails or PMs on Discord in at least 1 month</li>
  <li>I have not announced a temporary break from development, unless the announced end date of this break has been passed by at least 3 months</li>
</ul>
If the above cases apply (as judged by the "League of Extraordinary Foundry VTT Developers" admins), I give permission to the "League of Extraordinary Foundry VTT Developers" admins to assign one or more developers to take over this module, including requesting the Foundry team to reassign the module to the new developer(s).<br>
I require the "League of Extraordinary Foundry VTT Developers" admins to send me an email 2 weeks before the reassignment takes place, to give me one last chance to prevent the reassignment.<br>
I require to be credited for my work in all future releases.
