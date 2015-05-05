jQuery-Lcn-Range-Select
==============================

Range select input widget


Demo
----

[demo.html](http://cdn.rawgit.com/FaiblUG/jQuery-Lcn-Range-Select/master/demo.html)


Usage
-----

### 1. Include jQuery
    
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

### 2. Include input form element which should contain your range (format "startValue;endValue")

The class range-select is required. If you add the attribute data-auto-init, then the input element will be automatically enhanced when the domReady event is fired. 
    
    <input type="text" class="range-select" data-auto-init value="0;100">

### 3. Include Scripts and Styles
    
    <link rel="stylesheet" href="dist/jquery.lcnRangeSelect.css">
    <script src="dist/jquery.lcnRangeSelect.js"></script>

    
### Options

#### The initial value can be defined via the value attribute:
    
    value="0;100"
    
#### It is also possible to override the min, max, step and unit options:
    
    data-min="0"
    data-max="100"
    data-step="5"
    data-unit="%"

#### If you only need a single value instead of a range, you can add the data-single-value attribute.

    data-single-value

The value of the input form field then only consists of a single number and not a number pair.

#### Initialize the widget manually

If you omit the data-auto-init attribute on your input tag or if you create input tags dynamically after the domReady event has fired, you need to initialize the widget manually:
    
    <script>jQuery('input.range-select').lcnRangeSelect();</script>

   
