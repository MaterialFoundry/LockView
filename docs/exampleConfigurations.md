Below you will find some example configurations for common situations.<br>
Each configuration gives a short description of its goals and the settings to achieve that.<br>
These configurations are meant as a starting point, do look at other settings to customize your experience.

* [In-Person Play (With Miniatures)](#in-person-play-with-miniatures)
* [Landing Page/Spashscreen/Static Background](#landing-pagesplashscreenstatic-background)
* [Static Display](#static-display)

## In-Person Play (With Miniatures)
For in-person play on a horizontally mounted display we want to achieve the following:

* Give the GM control over what the display user can see, so a separate mouse isn't necessary for the display user.
* (With miniatures) Prevent unintentional zooming and panning for the display user, because this can result in the minis not being in the correct place.
* (With miniatures) Autoscale scenes so the grid corresponds with a real world size (for example, 25mm or 1").
* Hide all UI elements for a clean display.
* Force the initial view so the scene loads the way you want it.

<b>GM:</b><br>

* [User Configuration](./moduleSettings/userConfigurator.md): Tick Enable and Viewbox for the display user. Enable makes sure that the scene configuration is applied, while Viewbox allows the GM to control the view (so a mouse is not required for the display client).
* [Scene Config](./sceneConfig/sceneConfig.md) for each applicable scene, or the [Scene Configurator](./moduleSettings/sceneConfigurator.md):<br>
    * (With miniatures) In the Locks section, enable Lock Pan and Lock Zoom. This prevents accidental zooming or panning.
    * (With miniatures) In the Autoscale section, set Autoscale to Physical Grid Size. This makes sure the scene is zoomed to the grid corresponds with real world dimensions
    * In the Hide UI Elements section set Hide On to Always, so the elements are always hidden. Then select all the elements.
    * In the Force Initial View section enable Force Initial View, and configure the initial view with the [Initial View Configurator](./sceneConfig/initialView.md#initial-view-configurator).

<b>GM or Display User:</b><br>
(Only required when physical miniatures are used)<br>

* [Module Settings](./moduleSettings/moduleSettings.md), Physical Grid Size section:
    * Measure the width (<u>not</u> the diagonal that's usually used to define display sizes) of your display and enter it into Display Width. Unit (mm, inch, etc) is not important, as long as you use the same unit in the next step. Do not include the unit, it should be, for example, "930", not "930mm".
    * Enter the desired grid size in Grid Size, for example 25mm or 1". Unit should be the same as Display Width.
    * If you've set it for the display user, you are done. The GM can set Force GM-Set Settings, which will apply the GM's Display Width and Grid Size to all users.

## Landing Page/Splashscreen/Static Background
Many GMs use a landing page or splashscreen as a first scene of a session. This scene usually has some nice artwork and sometimes some stats. Alternatively, you could use this configuration for an intermediate scene to introduce a new location (such as a nice 3D render of a location).

We want to achieve the following:

* Autoscale the scene so it fills the display.
* Prevent zooming and panning.
* (Optional) Make sure the sidebar collapses when the scene loads.
* (Optional) Hide all UI elements (except for the sidebar, in case the user needs to configure something).

<b>GM:</b><br>

* [User Configuration](./moduleSettings/userConfigurator.md): Tick Enable for all users. Enable makes sure that the scene configuration is applied.
* [Scene Config](./sceneConfig/sceneConfig.md) for each applicable scene, or the [Scene Configurator](./moduleSettings/sceneConfigurator.md):<br>
    * In the Locks section, enable Lock Pan and Lock Zoom. This prevents zooming and panning.
    * In the Autoscale section, set Autoscale to Automatic Fit (Inside). This makes sure the scene is zoomed to fill the display.
    * (Optional) In the Sidebar section, set On Scene Load to Collapse. This will collapse the sidebar when the scene is loaded.
    * (Optional) In the Hide UI Elements section set Hide On to Always or Sidebar Collapse. Then select all the elements except Sidebar.

## Static Display
A static display, in this context, refers to a display that displays a scene that does not change, unless explicitly done by the GM. A usecase would be an in-person setup with a display to the side that shows images, maps, etc.

We want to achieve the following:

* Configure a display user as static, so it does not change scenes when a new scene is activated.
* (Optional) Add zoom and pan locks to prevent accidental zooming/panning.
* (Optional) Add autoscaling to fit the scene to the display.
* (Optional) Hide all UI elements for a clean display.
* (Optional, if autoscaling is disabled) Force the initial view so the scene loads the way you want it.

<b>GM:</b><br>

* [User Configuration](./moduleSettings/userConfigurator.md): Tick Static for the display user.
* [Scene Config](./sceneConfig/sceneConfig.md) for each applicable scene, or the [Scene Configurator](./moduleSettings/sceneConfigurator.md):<br>
    * (Optional) In the Locks section, enable Lock Pan and Lock Zoom. This prevents accidental zooming or panning.
    * (Optional) In the Autoscale section, set Autoscale to one of the fit options.
    * In the Hide UI Elements section set Hide On to Always, so the elements are always hidden. Then select all the elements.
    * In the Force Initial View section enable Force Initial View, and configure the initial view with the [Initial View Configurator](./sceneConfig/initialView.md#initial-view-configurator).