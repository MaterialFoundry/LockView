# Lock View
Lock View is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that gives the GM control over the zoom and pan capabilities of players, such as locking the zoom or pan, moving the canvas, or setting the view to a specified setting.<br>
The module was originally made as a companion app for my <a href="https://github.com/CDeenen/MaterialPlane">Material Plane</a> module, and to make play using a digital playmat, 
such as a horizontally mounted TV, easier.<br>
Over time, however, the module's features have expanded greatly, including many functions that can be useful for digital play.<br>
<br>
The module has 6 main functions:<br>
<ul>
    <li><b>Autoscaling:</b> Scales the scene in various ways (horizontal fit, vertical fit, automatic fit, or scaled to a physical gridsize)</li>
    <li><b>Zoom lock:</b> Locks the zooming of the scene to prevent the user from (accidentally) messing up the autoscale</li>
    <li><b>Pan lock:</b> Locks the panning of the scene. If you use physical minis you don't want to accidentally pan</li>
    <li><b>Bounding box:</b> Limit zoom and pan to stay within a bounding box</li>
    <li><b>Force initial view:</b> After loading a new scene, the view is forced to the initial view (as set in the scene configuration menu), regardless of the position of tokens</li>
    <li><b>Viewbox:</b> Allows the GM to see what's shown on players screens, and allows the GM to control the pan and zoom of those players</li>
</ul>
'Autoscaling', 'Zoom Lock', 'Pan Lock', 'Bounding Box' and 'Force Initial View' can be set for each scene independently.<br>
'Zoom Lock', 'Pan Lock' and 'Bounding Box' can be enabled and disabled at any time using control buttons.<br>
These functions can be applied to selected connected players (must be set in the GM's module settings).<br>
<br>
<b>Note:</b> When 'Zoom Lock' or 'Pan Lock' are enabled, this module disables all zooming and/or panning functionality, regardless of who or what is requesting that zoom or pan. This means that, for example, modules that try to pan or zoom won't work.

## Usage
### Physical Play
When using a horizontally mounted screen, for the purpose of playing with physical minis, you should do the following:<br>
<br>
<b>GM's client, module settings:</b><br>
-Enable the module and viewbox for the player that is connected to the TV in the User Configuration screen<br>
<br>
<b>GM's client, scene configuration menu (for each scene):</b><br>
-Set 'Autoscale' to 'Physical Gridsize', which forces the TV's client to a specific zoom, ensuring the grid is always the same physical size<br>
-Enable 'Lock Pan' and 'Lock Zoom', which prevents the TV's client from accidentally zooming or panning<br>
<br>
<b>TV's client, module settings:</b><br>
-Set 'Gridsize' to the desired physical size of the grid. Usually 25 mm or 1 inch. Only fill in the number, not the units<br>
-Set 'Screen Width' to the physical width of your screen (the actual screen, without bezel). Must be in the same units as 'Gridsize'<br>
<br>
Refer to the 'Settings and Controls' section below to see how the GM can manipulate the view of the TV's client.

### Digital Play
The module can also be used when playing digitally (every player has their own computer). When doing so, you can ignore the following settings:<br>
-'Gridsize' and 'Screen Width' in the module settings<br>
-'Physical Gridsize' in the scene configuration menu (Autoscale option) and in the 'Set View' dialog box<br>
<br>
In the User Configuration screen, enable the module and viewbox for each player whose view you want to control/view.<br>
Refer to the 'Settings and Controls' section below to see how the GM can manipulate the view of the player clients. 

## Settings and Controls
### Module Settings
In the module settings, as a GM you will find a button to open the player configuration screen, where you can enable the module and viewbox for each player.<br>
The module must be enabled for each player if you want to use any of the functions of this module, except for displaying the viewbox, which has its own enable setting.<br>
<br>
All connected players will also see two more settings which are only relevant if 'Autoscaling' is set to 'Physical Gridsize' (see below), as these settings allow the module to calculate the correct grid scale.<br>
<br>
The settings are:
<ul>
<li><b>Screen Width</b> - Fill in the physical screen width in mm or inch of the TV</li>
<li><b>Gridsize</b> - Fill in the desired gridsize in mm or inch (must be the same unit as 'Screen Width'). This is usually 25 mm or 1 inch</li>
</ul>

![moduleSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/ModuleSettings.png)

### Scene Settings
In the scene configuration screen, you'll find a new Lock View section with the following settings:<br>
<ul>
<li><b>Pan Lock</b> - Initial 'Pan Lock' setting</li>
<li><b>Zoom Lock</b> - Initial 'Zoom Lock' setting</li>
<li><b>Bounding box:</b> Initial 'Bounding Box' settings</li>
<li><b>Autoscale</b> - Automatically scales the screen</li>
<li><b>Exclude Sidebar</b> - Exclude the area behind the sidebar from the bounding box or autoscaling. This can be enabled because the sidebar can obscure parts of the map</li>
<li><b>Blacken Sidebar</b> - Blackens the background of the sidebar to prevent users from seeing outsie of the bounding box or canvas (only works if 'Exclude Sidebar' is enabled)</li>
<li><b>Force Initial View</b> - Forces the view to the 'Initial View Position' after loading the scene. Only works if 'Autoscale' is set to 'Off'</li>
</ul>
Autoscale can be set to the following options:<br>
<ul>
<li><b>Off</b> - Autoscale disabled</li>
<li><b>Horizontal Fit</b> - Automatically scales the scene to fit the browser window. Horizontal fit, so it may cut off vertical parts of the scene</li>
<li><b>Vertical Fit</b> - Automatically scales the scene to fit the browser window. Vertical fit, so it may cut off horizontal parts of the scene</li>
<li><b>Automatic Fit</b> - Automatically chooses horizontal or vertical fit so no non-image background will ever be seen</li>
<li><b>Physical Gridsize</b> - Scales the scene so the on-screen gridsize corresponds with a real world value (for example 25mm or 1"). The gridsize is determined by setting the 'Screen Width' and 'Gridsize' in the module settings. These settings are local, which means that they can be different for each connected client</li>
</ul>
<b>Note 1:</b> The 'Pan Lock', 'Zoom Lock' and 'Bounding Box' settings determine the initial settings. These are applied when a scene is loaded, or after closing the scene configuration screen. After that, you can enable or disable them by pressing the control buttons (see below).<br>
<b>Note 2:</b> 'Horizontal Fit', 'Vertical Fit', 'Automatic Fit' and 'Physical Gridsize' are applied when a scene is loaded, or after closing the scene configuration screen. After that, the player can zoom and pan around (if Zoom Lock or Pan Lock are disabled)<br>

![sceneSettings](https://github.com/CDeenen/LockView/blob/master/img/examples/SceneSettings.png)

### Control Buttons
On the left of the screen, there are new control buttons for the GM that display and toggle the current setting on the scene.<br>
From the top to the bottom:<br>
<ul>
<li><b>Set View</b> - Creates a dialog box with options to set the view, see below</li>
<li><b>Pan Lock</b> - Shows/switches the current state of 'Pan Lock'. If on, panning is disabled</li>
<li><b>Zoom Lock</b> - Shows/switches the current state of 'Zoom Lock'. If on, zooming is disabled</li>
<li><b>Bounding Box</b> - Shows/switches the current state of 'Bounding Box'. If on, zoom and pan are limited to the bounding box</li>
<li><b>Viewbox</b> - Draws a square on the canvas that shows what enabled players can see. The color of the square corresponds with the 'Player Color'</li>
<li><b>Edit Viewbox</b> - Allows the GM to edit the viewbox, and the players' view. Right-click dragging drags the viewbox and pans the players' sceen, the scrollwheel increases or decreases the size of the viewbox and zooms the players' screen in or out</li>
</ul>

![controlButtons](https://github.com/CDeenen/LockView/blob/master/img/examples/ControlButtons.png)

#### Set View Dialog
After clicking the 'Set View' control button, a dialog box appears that gives multiple options to control the view of players. There's 2 dropdown menu's, and 3 number boxes<br>
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

## Bounding Box
The bounding box function limits how much a user can zoom or pan. It needs to be enabled, either in the scene configuration screen, or using control buttons. This function ensures that they always stay within a defined box.<br>
To enable the bounding box function on a scene load, you can enable the function in the scene configuration screen. The function can also be enabled on the fly by pressing the control button.<br>
<br>
By default this box is the canvas size (size of your background image), so users will not see the background color and padding.<br>
It is also possible to define a bounding box by drawing a rectangle (control buttons => drawing tools => draw rectangle). After drawing the rectangle, you can edit it (double clicking the rectangle) to set the rectangle as a bounding box. This can be done in the Lock View tab, where you have the following options:
<ul>
<li><b>Disabled:</b> The rectangle is not used as a bounding box</li>
<li><b>Owned Tokens:</b> Use the rectangle as bounding box if a token that's owned by the user is within the rectangle. You can set multiple rectangles to 'Owned Tokens'. Moving a token from one 'Owned Tokens' rectangle to another forces the view to the new rectangle. If you have multiple owned tokens in different 'Owned Tokens' rectangles, the bounding box will extend to fit all of these rectangles</li>
<li><b>Always:</b> The rectangle is always used as bounding box, also if no tokens are within the rectangle. This overrides all other rectangles. Only one rectangle should be set to 'Always'. If more rectangles are set to 'Always', only one is chosen</li>
</ul>

![drawingConfiguration](https://github.com/CDeenen/LockView/blob/master/img/examples/DrawingConfiguration.png)

## Viewbox
The viewbox is a function that allows the GM so see what players can see. 
If enabled (enable for the player in the User Configuration screen in the module settings, and enable the 'Viewbox' control button), 
a rectangle is drawn that corresponds with the view of the player. The color of the rectangle is the player color.<br>
<br>
It is possible for the GM to control the view of the players by enabling the 'Edit Viewbox' control button. If enabled, the GM can pan by left-click dragging and zoom by using the scroll wheel.<br>

![viewBox](https://github.com/CDeenen/LockView/blob/master/img/examples/ViewBox.png)

<h1>Feedback</h1>
If you have any suggestions or bugs to report, feel free to contact me on Discord (Cris#6864), or send me an email: cdeenen@outlook.com.

<h1>Credits</h1>
<b>Main author:</b> Cristian Deenen (Cris#6864 on Discord)<br>
<b>Other:</b> 
-The tooltip class was modified from the vtta-party module by Sebastian Will from <a href="https://www.vttassets.com">VTTA Assets</a><br>
<br>
If you enjoy using my modules, please consider supporting me on <a href="https://www.patreon.com/materialfoundry">Patreon</a>.

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
