jQuery-Lcn-Range-Select
==============================

Range select input widget


Demo
----

[demo.html](http://htmlpreview.github.com/?https://github.com/FaiblUG/jQuery-Lcn-Range-Select/blob/master/demo.html)


Usage
-----

### 1. Include jQuery
    
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

### 2. Include input form element which should contain your range (format "startValue;endValue")
    
    <input type="text" class="range-select" value="0;100">
    
The initial value can be defined via the value attribute:
    
    value="0;100"
    
It is also possible to override the min, max and unit options:
    
    data-min="0"
    data-max="100"
    data-unit="%"
    
### 3. Include Scripts and Styles
    
    <link rel="stylesheet" href="dist/jquery.lcnRangeSelect.css">
    <script src="dist/jquery.lcnRangeSelect.js"></script>
    
### 4. Initialize Widget
    
    <script>jQuery('input.range-select').lcnRangeSelect();</script>   
