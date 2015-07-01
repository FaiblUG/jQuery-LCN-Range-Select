(function (root, factory) {
  var $ = root.jQuery;

  if (typeof define === 'function' && define.amd) {
    // AMD
    if ($) {
      define([], factory.bind(null, $));
    }
    else {
      define(['jquery'], factory);
    }
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    if ($) {
      module.exports = factory($);
    }
    else {
      module.exports = factory(require('jquery'));
    }
  } else {
    // Browser globals (root is window)
    if ($) {
      factory($); // no global needed as we store it as a jQuery plugin on jQuery.fn
    }
    else {
      throw 'Missing required jQuery dependency';
    }
  }
}(this, function ($) {

  var
    isDragging = false;
    $currentHandle = null,
    defaultMinValue = 0,
    defaultMaxValue = 100,
    defaultUnit = '%',
    defaultStep = 1,
    defaultDirection = 'ltr',
    supportedDirections = ['ltr', 'btt']
  ;

  function updateWidget($container) {
    var
      options = getOptions($container),
      $handles = $container.find('.handle'),
      $handle1 = $container.find('.handle1'),
      $selectedRange = $container.find('.selected-range')
      ;

    var size;
    if (options.direction === 'ltr') {
      size = $container.innerWidth();
    }
    else if (options.direction === 'btt') {
      size = $container.innerHeight();
    }

    var stepSize = size / options.stepsCount;

    value1 = $handle1.attr('data-value');
    if (!options.isSingleValue) {
      var $handle2 = $container.find('.handle2');
      value2 = $handle2.attr('data-value');
    }



    $handles.each(function(idx, handle) {
      var $handle = $(handle);
      var value = $handle.attr('data-value');
      var pos = ((value - options.minValue) * stepSize) / options.step;

      if (options.direction === 'ltr') {
        $handle.css({left: pos});
      }
      else if (options.direction === 'btt') {
        if (idx === 0) {
          pos = pos - $handle.width() / 2;
        }
        else {
          pos = pos - $handle.width() / 2;
        }
        $handle.css({bottom: pos});
      }

      $container.find($handle.attr('data-value-target')).html($handle.attr('data-value') + options.unit);
    });


    if (options.isSingleValue) {
      $container.find('input').val(value1).trigger('change');
    }
    else {
      if (options.direction === 'ltr') {
        var selectedRangeLeftPos = $handle1.position().left;
        var selectedRangeWidth = $handle2.position().left - selectedRangeLeftPos;
        $selectedRange.css({
          left: selectedRangeLeftPos,
          width: selectedRangeWidth
        });
      }
      else if (options.direction === 'btt') {
        var selectedRangeTopPos = $handle2.position().top + $handle2.width() / 2;
        var selectedRangeHeight = $handle1.position().top + $handle2.width() / 2 - selectedRangeTopPos;
        $selectedRange.css({
          top: selectedRangeTopPos,
          height: selectedRangeHeight
        });
      }

      $container.find('input').val(value1+';'+value2).trigger('change');
    }


  }

  function getOptions($container) {
    $input = $container[0].nodeName === 'INPUT' ? $container : $container.find('input');

    var options = {
      minValue: defaultMinValue,
      maxValue: defaultMaxValue,
      unit: defaultUnit,
      step: defaultStep,
      direction: defaultDirection,
      isSingleValue: _isSingleValue($input)
    };

    if ($input.attr('data-min') !== undefined) {
      options.minValue = parseFloat($input.attr('data-min'));
    }

    if ($input.attr('data-max') !== undefined) {
      options.maxValue = parseFloat($input.attr('data-max'));
    }

    if ($input.attr('data-unit') !== undefined) {
      options.unit = $input.attr('data-unit');
    }

    if ($input.attr('data-step') !== undefined) {
      options.step = parseFloat($input.attr('data-step'));
    }

    if ($input.attr('data-direction') !== undefined) {
        if (supportedDirections.indexOf($input.attr('data-direction')) === -1) {
            throw new Error('Unsupported direction: '+$input.attr('data-direction'));
        }
        else {
            options.direction = $input.attr('data-direction');
        }
    }

    options.stepsCount = (options.maxValue - options.minValue) / options.step;

    return options;
  }

  function init($input) {
    var options = getOptions($input);
    $container = $('<div>');
    $container.addClass('range-select-wrapper');
    $container.addClass('direction-'+options.direction);

    $input.wrap($container);
    $container = $input.parent();




    var value1 = options.minValue;
    if (!options.isSingleValue) {
      var value2 = options.maxValue;
    }



    if ($input.val()) {
      if (options.isSingleValue) {
        value1 = parseFloat($input.val());
      }
      else {
        var values = $input.val().split(';');
        value1 = parseFloat(values[0]);
        value2 = parseFloat(values[1]);
      }
    }

    $container.append('<div class="handle handle1" data-value="' + value1 + '" data-value-target=".value1"></div>');
    if (options.isSingleValue) {
      $container.append('<div class="values"><span class="value1"></span></div>');
    }
    else {
      $container.append('<div class="handle handle2" data-value="' + value2 + '" data-value-target=".value2"></div>');
      if (options.direction === 'ltr') {
        $container.append('<div class="values"><span class="value1"></span> - <span class="value2"></span></div>');
      }
      else if (options.direction === 'btt') {
        $container.append('<div class="values"><span class="value2"></span> - <span class="value1"></span></div>');
      }
    }

    $container.append('<div class="selected-range"></div>');

    updateWidget($container);

    $container.on('mousedown touchstart', '.handle', function(e) {
      if (!isDragging) {
        isDragging = true;
        e.preventDefault();
        $currentHandle = $(e.target);
        $(document).one('mouseup touchend', function() {
          isDragging = false;
          $currentHandle = null;
        });
      }
    });

    $(window).on('resize', updateWidget.bind(null, $container));
  }


  function _isSingleValue($input) {
    return $input.attr('data-single-value') !== undefined && $input.attr('data-single-value') !== 'false';
  }

  $(document).on('mousemove touchmove', function (e) {
    if (isDragging) {

      var $draggingTarget = $(e.target);

      $draggingWrapper = $draggingTarget.closest('.range-select-wrapper');
      if ($draggingWrapper.length === 0) {
        return;
      }

      if ($currentHandle.hasClass('handle1')) {
        $draggingHandle = $draggingWrapper.find('.handle1');
      }
      else if ($currentHandle.hasClass('handle2')) {
        $draggingHandle = $draggingWrapper.find('.handle2');
      }

      if ($draggingHandle[0] !== $currentHandle[0]) {
        return;
      }


      var $container = $currentHandle.closest('.range-select-wrapper');

      var options = getOptions($container);



      if (!e.offsetX && e.originalEvent.touches) {
        // touch events
        var targetOffset = $draggingTarget.offset();
        e.offsetX = e.originalEvent.touches[0].pageX - targetOffset.left;
        e.offsetY = e.originalEvent.touches[0].pageY - targetOffset.top;
      }
      else if(typeof e.offsetX === "undefined" || typeof e.offsetY === "undefined") {
        // firefox compatibility
        var targetOffset = $draggingTarget.offset();
        e.offsetX = e.pageX - targetOffset.left;
        e.offsetY = e.pageY - targetOffset.top;
      }

      var xPos = e.offsetX;
      var yPos = e.offsetY;
      if ($draggingTarget.hasClass('handle')) {
        xPos += e.target.offsetLeft;
        yPos += e.target.offsetTop;
      }

      var size;
      var pos;
      if (options.direction === 'ltr') {
        size = $container.innerWidth();
        pos = xPos;
      }
      else if (options.direction === 'btt') {
        size = $container.innerHeight();
        pos = size - yPos;
      }

      var stepSize = size/options.stepsCount;
      var value = options.minValue + (Math.round(pos / stepSize)) * options.step;

      value = Math.max(options.minValue, value);
      value = Math.min(options.maxValue, value);

      if (!options.isSingleValue) {
        var $otherHandle = $container.find('.handle').not($currentHandle[0]);

        if ($currentHandle.hasClass('handle1')) {
          value = Math.min(parseFloat($container.find('.handle2').attr('data-value')) - options.step, value);
        }
        else {
          value = Math.max(parseFloat($container.find('.handle1').attr('data-value')) + options.step, value);
        }
      }

      if (options.step < 0.1) {
        value = Math.round(value * 100) / 100
      }
      else if (options.step < 1) {
        value = Math.round(value * 10) / 10
      }

      $currentHandle.attr('data-value', value);

      updateWidget($container);
    }
  });


  $.fn.lcnRangeSelect = function() {
    return this.each(function() {
      init($(this));
    });

  };

  $(function() { $('input.range-select[data-auto-init]').lcnRangeSelect(); });

  return $.fn.lcnRangeSelect;
}));
