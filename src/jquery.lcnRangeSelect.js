(function($) {
  var
    isDragging = false;
    $currentHandle = null,
    defaultMinValue = 0,
    defaultMaxValue = 100,
    defaultUnit = '%'
  ;

  function updateWidget($container) {
    var
      options = getOptions($container),
      $handles = $container.find('.handle'),
      $handle1 = $container.find('.handle1'),
      $handle2 = $container.find('.handle2'),
      $selectedRange = $container.find('.selected-range'),
      width = $container.width()
    ;

    var sliderWidth = $handles.width();
    var stepWidth = width/options.stepsCount;

    value1 = $handle1.attr('data-value');
    value2 = $handle2.attr('data-value');

    $handles.each(function(idx, handle) {
      var $handle = $(handle);
      var value = $handle.attr('data-value');
      var x = value * stepWidth;
      $handle.css({ left: x - sliderWidth/2 });
      $container.find($handle.attr('data-value-target')).html($handle.attr('data-value') + options.unit);
    });

    var selectedRangeLeftPos = $handle1.position().left + (sliderWidth / 2);
    var selectedRangeWidth = $handle2.position().left + (sliderWidth / 2) - selectedRangeLeftPos;

    $selectedRange.css({
      left: selectedRangeLeftPos,
      width: selectedRangeWidth
    });
    $container.find('input').val(value1+';'+value2).trigger('change');
  }

  function getOptions($container) {

    //TODO: cache result!

    var $input = $container.find('input');
    var options = {
      minValue: defaultMinValue,
      maxValue: defaultMaxValue,
      unit: defaultUnit
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

    options.stepsCount = Math.round((options.maxValue - options.minValue));

    return options;
  }

  function init($input) {

    $container = $('<div class="range-select-wrapper"></div>');
    $input.wrap($container);
    $container = $input.parent();

    var options = getOptions($container);

    var value1 = options.minValue;
    var value2 = options.maxValue;

    if ($input.val()) {
      var values = $input.val().split(';');
      value1 = parseInt(values[0], 10);
      value2 = parseInt(values[1], 10);
    }

    $container.append('<div class="handle handle1" data-value="' + value1 + '" data-value-target=".value1"></div>');
    $container.append('<div class="handle handle2" data-value="' + value2 + '" data-value-target=".value2"></div>');
    $container.append('<div class="values"><span class="value1"></span> - <span class="value2"></span></div>');
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

  $(document).on('mousemove touchmove', function (e) {
    if (isDragging) {
      var $container = $currentHandle.closest('.range-select-wrapper');

      var options = getOptions($container);

      var width = $container.width();

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
      var value = Math.round(xPos / stepWidth);

      value = Math.max(options.minValue, value);
      value = Math.min(options.maxValue, value);

      var $otherHandle = $container.find('.handle').not($currentHandle[0]);

      if ($currentHandle.hasClass('handle1')) {
        value = Math.min(parseInt($container.find('.handle2').attr('data-value'), 10) - 1, value);
      }
      else {
        value = Math.max(parseInt($container.find('.handle1').attr('data-value'), 10) + 1, value);
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

})(jQuery);