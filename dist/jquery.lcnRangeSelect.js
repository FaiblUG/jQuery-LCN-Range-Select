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
    defaultStep = 1
  ;

  function updateWidget($container) {
    var
      options = getOptions($container),
      $handles = $container.find('.handle'),
      $handle1 = $container.find('.handle1'),
      $selectedRange = $container.find('.selected-range'),
      width = $container.innerWidth()
      ;

    var stepWidth = width / options.stepsCount;

    value1 = $handle1.attr('data-value');
    if (!options.isSingleValue) {
      var $handle2 = $container.find('.handle2');
      value2 = $handle2.attr('data-value');
    }



    $handles.each(function(idx, handle) {
      var $handle = $(handle);
      var value = $handle.attr('data-value');
      var x = ((value - options.minValue) * stepWidth) / options.step;
      $handle.css({ left: x });
      $container.find($handle.attr('data-value-target')).html($handle.attr('data-value') + options.unit);
    });

    var selectedRangeLeftPos = $handle1.position().left;
    if (options.isSingleValue) {
      $container.find('input').val(value1).trigger('change');
    }
    else {
      var selectedRangeWidth = $handle2.position().left - selectedRangeLeftPos;
      $selectedRange.css({
        left: selectedRangeLeftPos,
        width: selectedRangeWidth
      });
      $container.find('input').val(value1+';'+value2).trigger('change');
    }


  }

  function getOptions($container) {
    var $input = $container.find('input');
    var options = {
      minValue: defaultMinValue,
      maxValue: defaultMaxValue,
      unit: defaultUnit,
      step: defaultStep,
      isSingleValue: _isSingleValue($input)
    };

    if ($input.attr('data-min') !== undefined) {
      options.minValue = parseInt($input.attr('data-min'), 10);
    }

    if ($input.attr('data-max') !== undefined) {
      options.maxValue = parseInt($input.attr('data-max'), 10);
    }

    if ($input.attr('data-unit') !== undefined) {
      options.unit = $input.attr('data-unit');
    }

    if ($input.attr('data-step') !== undefined) {
      options.step = parseFloat($input.attr('data-step'));
    }

    options.stepsCount = (options.maxValue - options.minValue) / options.step;

    return options;
  }

  function init($input) {

    $container = $('<div class="range-select-wrapper"></div>');
    $input.wrap($container);
    $container = $input.parent();

    var options = getOptions($container);

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
      $container.append('<div class="values"><span class="value1"></span> - <span class="value2"></span></div>');
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
      var $container = $currentHandle.closest('.range-select-wrapper');

      var options = getOptions($container);

      var width = $container.innerWidth();

      if (!e.offsetX && e.originalEvent.touches) {
        // touch events
        var targetOffset = $(e.target).offset();
        e.offsetX = e.originalEvent.touches[0].pageX - targetOffset.left;
      }
      else if(typeof e.offsetX === "undefined" || typeof e.offsetY === "undefined") {
        // firefox compatibility
        var targetOffset = $(e.target).offset();
        e.offsetX = e.pageX - targetOffset.left;
      }

      var xPos = e.target.offsetLeft + e.offsetX;

      var stepWidth = width/options.stepsCount;
      var value = options.minValue + (Math.round(xPos / stepWidth)) * options.step;

      value = Math.max(options.minValue, value);
      value = Math.min(options.maxValue, value);

      if (!options.isSingleValue) {
        var $otherHandle = $container.find('.handle').not($currentHandle[0]);

        if ($currentHandle.hasClass('handle1')) {
          value = Math.min(parseInt($container.find('.handle2').attr('data-value'), 10) - 1, value);
        }
        else {
          value = Math.max(parseInt($container.find('.handle1').attr('data-value'), 10) + 1, value);
        }
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
