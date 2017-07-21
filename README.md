# adapt-achievements

**Achievements** is an *extension* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework).   

This extension displays the learner's answers to questions as a total in the top navigation bar. Achievements can be based on correct and incorrect answers and a certificate can also be displayed to the user when certain criteria is met.

## Installation

This extension must be manually installed.

If **Achievements** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  

## Settings Overview

**Achievements** may be configured on two levels: course (*course.json*), article (*articles.json*) and component (*components.json*).

The attributes listed below are properly formatted as JSON in [*example.json*](https://github.com/deltanet/adapt-achievements/blob/master/example.json).

### Attributes

**Course**
The Achievements attribute group at course level contains values for **_isEnabled**, **title**, **description**, **_showOnNavbar**, **_icon**, **_countDown**, **_trackQuestion**, **_completePrompt**, **_drawer**, and **_certificate**.

>**_isEnabled** (boolean):  Turns on and off the **Achievements** extension. Can be set to disable **Achievements** when not required.

>**title** (string):  Defines the title text for the core Drawer item.  

>**description** (string):  Defines the description text for the core Drawer item.  

>**_showOnNavbar** (boolean):  Determines whether an icon and counter is displayed on the top navigation bar. The default is `true`.  

>**_icon** (string):  Defines the class name for the icon which must be included in the theme.  

>**_countDown** (boolean):  Determines whether the counter should count down from the total number of questions. The default is `false`.  

>**_trackQuestion** (string):  Defines which question status to track. Options are `"correct"`, `"incorrect"`, and `"partlyCorrect"`. The default is `"correct"`.  

>**_completePrompt** (object): This `_completePrompt` attributes group stores the properties for a Notify Prompt that can be triggered when tracking criteria is met. It contains values for **_isEnabled**, **title**, **body**, and **displayTime**.  

>>**_isEnabled** (boolean):  If set to `true`, a prompt is displayed based on the configuration of the certificate attributes.  

>>**title** (string):  Determines the title text for the prompt.  

>>**body** (string): Determines the body text for the prompt.  

>>**displayTime** (number): Determines the time in milliseconds that the prompt is on screen for. The default is `9000`.

>**_drawer** (object): This `_drawer` attributes group stores the properties for the Adapt Drawer feature. It contains values for **achievementsTitle**, **achievementsBody**, **certificateTitle**, **certificateEnabled**, **certificateDisabled**, and **_buttons**.  

>>**achievementsTitle** (string):  Determines the title text for the drawer item.  

>>**achievementsBody** (string):  Determines the body text for the drawer item.  

>>**certificateTitle** (string): Determines the title text for the certificate drawer item.  

>>**certificateEnabled** (string): Determines the drawer item body text when the certificate is available.  

>>**certificateDisabled** (string): Determines the drawer item body text before the certificate is available.  

>>**_buttons** (object): This `_buttons` attributes group stores the properties for the Buttons in the Drawer item. It contains values for **print**.  

>>>**print** (string): Defines the button text.  

>**_certificate** (object): This `_certificate` attributes group stores the properties for the certificate. It contains values for **_isEnabled**, **_completionOnPassed**, **_splitNameAt**, **_switchNames**, **_header**, **_body**, and **_footer**.  

>>**_isEnabled** (boolean):  If set to `true`, a certificate will be displayed when the set criteria is met.  

>>**_completionOnPassed** (boolean):  Defines the tracking criteria. If set to `true`, a certificate will be displayed when the course assessment is passed. If set to `false` the certificate will be available when all content is complete.  

>>**_splitNameAt** (string):  Determines how the 'Student' name from Adapt offlinestorage is split. Options are `"comma"`, `"space"`, `"space"`, and `"none"`.  

>>**_switchNames** (boolean):  If set to `true`, the student's first and last name are switched round.  

>>**_header** (string): File name (including path) of the image for the certificate header. Path should be relative to the *src* folder.

>>**_body** (string): File name (including path) of the image for the certificate body. Path should be relative to the *src* folder.

>>**_footer** (string): File name (including path) of the image for the certificate footer. Path should be relative to the *src* folder.

**Component**
The Achievements attribute group at component level contains values for **_isEnabled**, **_showPrompt**, **_classes**, and **_button**.

>**_isEnabled** (boolean):  Turns on and off the **Achievements** extension at component level.  

>**_showPrompt** (boolean):  Determines whether the Notify Prompt should display on completion.  

>**_classes** (string):  Defines a css class that is included in the theme.

>**_button** (object): This `_button` attributes group stores the properties for a button that can be displayed under the component. It contains values for **_isEnabled**, and **title**.  

>**_isEnabled** (boolean):  Turns on and off the button on the component.  

>>**title** (string):  Determines the text for the button.  

### Accessibility
Several elements of **Achievements** have been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **achievements**. These labels are not visible elements. They are utilized by assistive technology such as screen readers. Should the label texts need to be customised, they can be found within the **globals** object in [*properties.schema*](https://github.com/deltanet/adapt-achievements/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

No known limitations.

----------------------------
**Version number:**  2.0.14   
**Framework versions supported:**  ^2.0.6    
**Author / maintainer:** DeltaNet [contributors](https://github.com/deltanet/adapt-achievements/graphs/contributors)     
**Accessibility support:** Yes  
**RTL support:** Yes     
**Authoring tool support:** Yes
