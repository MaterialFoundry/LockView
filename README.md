# Lock View
Lock View is a <a href="https://foundryvtt.com/">Foundry VTT</a> module that was made to make play using a digital playmat, such as a horizontally mounted TV, easier.<br>
It has the following functionality that can be switched on or off in the scene configuration screen:<br>
<ul>
<li><b>Autoscale</b> - Automatically scales the gridsize to make it correspond to a physical gridsize (in mm or inch) set in the settings</li>
<li><b>Zoom Lock</b> - Locks the zoom/fixes the scale, to prevent the user from accidentally messing up the autoscale. Can also be used without 'Autoscale'. This ignores the 'zoom' at 'Initial View Position' in the scene configuration screen</li>
<li><b>Pan Lock</b> - Locks the panning of the scene. If you use physical minis you don't want to accidentally pan</li>
</ul>
<b>Note 1:</b> When using both 'Autoscale' and 'Pan Lock', when loading a scene and after closing the scene configuration screen, the scene will automatically set the view position to the 'Initial View Position' as set in the scene configuration screen.<br>
<b>Note 2:</b> When a token is moved to the edge of the screen, the scene is automatically panned. I have not yet found a way to disable this.<br>

### Settings
The above mentioned settings can be changed for each scene individually, in the scene configuration screen.<br>
There are some more settings in the module settings screen:<br>
<ul>
<li><b>Enable</b> - Checking this box enables the module for the client. You only want to have this enabled for the client that is connected to the TV</li>
<li><b>Screen Width</b> - Fill in the physical screen width in mm or inch of the TV</li>
<li><b>Gridsize</b> - Fill in the desired gridsize in mm or inch (must be the same unit as 'Screen Width'). This is usually 25 mm or 1 inch</li>
<li><b>Display Viewbox</b> - Draws a square on the GM's screen that corresponds with the borders of the display of players that have the module enabled</li>
</ul>

### Future plans
<ol>
<li>Add a button on the left of the screen that gives control voer the viewbox, such as moving and scaling it (thus panning and scaling the player's scene), and enabling/disabling the viewbox (instead of a checkbox in the settings)</li>
<li>Find a way to disable panning when a token is moved to the edge of the screen</li>
<li>Check compatibility with modules that move tokens around, for example, using teleport</li>
</ol>

## Software Versions & Module Incompatibilities
<b>Foundry VTT:</b> Tested on 0.6.6<br>
<b>Module Incompatibilities:</b> None known<br>

## Feedback
If you have any suggestions or bugs to report, feel free to contact me on Discord (Cris#6864), or send me an email: cdeenen@outlook.com.

## Credits
<b>Author:</b> Cristian Deenen (Cris#6864 on Discord)<br>

## Changelog
<b>v1.0.0</b> - 09-09-2020 - Initial release<br>