# adapt-achievements

**Achievements** is an *extension* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework).   

This extension displays the learner's answers to questions as a total in the navigation bar. Achievements can be based on correct and incorrect answers.  

## Installation

This extension must be manually installed.

If **Achievements** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  

## Settings Overview

**Achievements** may be configured on two levels: course (*course.json*), and article (*articles.json*).

The attributes listed below are properly formatted as JSON in [*example.json*](https://github.com/deltanet/adapt-achievements/blob/master/example.json).

### Attributes

**Course**
The Achievements attribute group at course level contains values for **_isEnabled**, **title**, **description**, **_showOnNavbar**, **_icon**, **_countDown**, **_trackQuestion**, and **_drawer**.

>**_isEnabled** (boolean):  Turns on and off the **Achievements** extension. Can be set to disable **Achievements** when not required.

>**title** (string):  Defines the title text for the core Drawer item.  

>**description** (string):  Defines the description text for the core Drawer item.  

>**_showOnNavbar** (boolean):  Determines whether an icon and counter is displayed on the top navigation bar. The default is `true`.  

>**_icon** (string):  Defines the class name for the icon which must be included in the theme.  

>**_countDown** (boolean):  Determines whether the counter should count down from the total number of questions. The default is `false`.  

>**_trackQuestion** (string):  Defines which question status to track. Options are `"correct"`, `"incorrect"`, and `"partlyCorrect"`. The default is `"correct"`.  

>**_drawer** (object): This `_drawer` attributes group stores the properties for the Adapt Drawer feature. It contains values for **achievementsTitle**, and **achievementsBody**.  

>>**achievementsTitle** (string):  Determines the title text for the drawer item.  

>>**achievementsBody** (string):  Determines the body text for the drawer item.    

### Accessibility
Several elements of **Achievements** have been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **achievements**. These labels are not visible elements. They are utilized by assistive technology such as screen readers. Should the label texts need to be customised, they can be found within the **globals** object in [*properties.schema*](https://github.com/deltanet/adapt-achievements/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div>

## Limitations

No known limitations.

----------------------------
**Version number:**  2.1.2   
**Framework versions supported:**  ^2.0.6    
**Author / maintainer:** DeltaNet [contributors](https://github.com/deltanet/adapt-achievements/graphs/contributors)     
**Accessibility support:** Yes  
**RTL support:** Yes     
**Authoring tool support:** Yes
