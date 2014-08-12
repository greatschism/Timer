
$(document).ready(function () {
    "use strict";
    var $timer = $('#timer');

    // define elements we need
    var $intervalRemaining = $timer.find('.seconds-interval-remaining');
    var $totalElapsed = $timer.find('.seconds-total-elapsed span');
    var $totalRemaining = $timer.find('.seconds-total-remaining span');

    var $intervalIndex = $timer.find('.seconds-interval-count span');
    var $currentInterval = $timer.find('.seconds-interval-current');
    var $nextInterval = $timer.find('.seconds-interval-next');

    var $startStopButton = $timer.find('.seconds-start-stop');
    var $resetButton = $timer.find('.seconds-reset');
    var $nextButton = $timer.find('.seconds-next');
    var $prevButton = $timer.find('.seconds-prev');

    var $beepLong = $timer.find('.seconds-beep-long');
    var $beepShort = $timer.find('.seconds-beep-short');

    var colors = ['rgb(23,25,31)', 'rgb(204,41,41)', 'rgb(204,120,41)', 'rgb(204,199,41)', 'rgb(133,204,41)', 'rgb(41,171,204)', 'rgb(41,106,204)', 'rgb(144,41,204)', 'rgb(204,41,141)', 'rgb(91,96,199)'];

    // Run app
    var timer = Runloop.createTimer();
    timer.useDefinition(Runloop.def);

    timer.onTick = function () {
        $totalElapsed.text(Runloop.utils.formattedDuration(this.totalElapsedTime));
        $totalRemaining.text(Runloop.utils.formattedDuration(this.totalRemainingDuration()));
        $intervalRemaining.text(Runloop.utils.formattedDuration(this.getTimeRemainingForCurrentInterval()));
    };

    timer.onIntervalChange = function (userInitiated) {
        $intervalIndex.text(this.getCurrentIntervalNumber());
        $currentInterval.text(timer.getCurrentIntervalName());
        $nextInterval.text('Next up: ' + timer.getNextIntervalName());
        $timer.css('background-color', colors[timer.getCurrentIntervalColorId()]);
        if (userInitiated === false) {
            $beepLong.get(0).play();
        }
    };

    timer.onSecondsChange = function () {
        var remaining = this.getTimeRemainingForCurrentInterval();
        if (remaining < 4000 && remaining > 0) {
            $beepShort.get(0).play();
        }
    }

    timer.onTimerComplete = function () {
        $beepShort.get(0).play();
    }

    $startStopButton.click(function (event) {
        if ($startStopButton.text() == 'start' || $startStopButton.text() == 'resume') {
            timer.start();
            $startStopButton.text('pause');
        }
        else {
            timer.stop();
            $startStopButton.text('resume');
        }
    });
    $nextButton.click(function (event) {
        timer.nextInterval();
    });
    $prevButton.click(function (event) {
        timer.prevInterval();
    });
    $resetButton.click(function (event) {
        timer.reset();
        $startStopButton.text('start');
    });

    timer.reset();


    var $forms = $('#forms');
    var $intervalTemplate = $forms.find('.interval');
    var $builderFormTemplate = $forms.find('.timer');
    var $customBuilderFormTemplate = $forms.find('.custom-timer');
    var $hiitBuilderFormTemplate = $forms.find('.hiit-timer');
    var $roundBuilderFormTemplate = $forms.find('.round-timer');
    var $circuitBuilderFormTemplate = $forms.find('.circuit-timer');

    var $builder = $('#builder');
    var $createButton = $('#create-button');
    var $previewButton = $('#preview-button');
    var $form = $('#form');
    var $timerData = $('#timer-data');
    var $builderForm;

    function createInterval(className, label, name) {
        var $interval = $intervalTemplate.clone(true);
        var $name = $interval.find('.name');

        $interval.addClass(className);
        $interval.find('.duration').val(0);
        $interval.find('.color').val(0);

        if (typeof name !== 'undefined') {
            $name.val(name);
        }
        else {
            $name.parent().remove();
        }

        $interval.find('.label').text(label);
        $interval.find('.name').text(name);
        $interval.find('.duration').text(0);

        return $interval;
    }

    function createBuilderForm() {
        var $builderForm = $builderFormTemplate.clone();
        var $select = $builderForm.find('.type');
        var $details = createDetails($select.int());
        var numSets = 2;

        $builderForm.append($details);
        $builderForm.find('.sets').val(numSets);
        $select.change(function (e) {
            $builderForm.find('.details').remove();
            $builderForm.append(createDetails($select.int()));
            $builderForm.find('.sets').val(numSets);
        });

        return $builderForm;
    }

    function createDetails(type) {
        var $details;

        switch (type) {
            case 0:
                $details = $customBuilderFormTemplate.clone(true);
                break;
            case 1:
                $details = $hiitBuilderFormTemplate.clone(true);
                break;
            case 2:
                $details = $roundBuilderFormTemplate.clone(true);
                break;
            case 3:
                $details = $circuitBuilderFormTemplate.clone(true);
                break;
            case 4:
                break;
        }
        $details.addClass('details');

        return $details;
    }

    function createCustomBuilderFormTemplate() {
        var $intervals = $customBuilderFormTemplate.find('.intervals');
        var $addButton = $intervals.find('input');

        $addButton.click(function (e) {
            var $intervals = $(this).parent('.intervals');
            var $interval = createInterval('interval', $intervals.children().length, 'Interval ' + $intervals.children().length);
            $(this).before($interval);
            $interval.find('.overview a').click();
            $interval.find('.name').select();
        });
        $addButton.click();
    }

    function createHIITBuilderFormTemplate() {
        $hiitBuilderFormTemplate.append($('<h4>Warmup</h4>'));
        $hiitBuilderFormTemplate.append(createInterval('warmup', 'Warmup', 'Warmup'));
        $hiitBuilderFormTemplate.append($('<h4>High Intensity</h4>'));
        $hiitBuilderFormTemplate.append(createInterval('high-intensity', 'High Intensity', 'High Intensity'));
        $hiitBuilderFormTemplate.append($('<h4>Low Intensity</h4>'));
        $hiitBuilderFormTemplate.append(createInterval('low-intensity', 'Low Intensity', 'Low Intensity'));
        $hiitBuilderFormTemplate.append($('<h4>Cooldown</h4>'));
        $hiitBuilderFormTemplate.append(createInterval('cooldown', 'Cooldown', 'Cooldown'));
    }

    function createRoundBuilderFormTemplate() {
        $roundBuilderFormTemplate.append($('<h4>Rounds</h4>'));
        $roundBuilderFormTemplate.append(createInterval('rounds', 'Rounds', 'Rounds'));
        $roundBuilderFormTemplate.append($('<h4>Breaks</h4>'));
        $roundBuilderFormTemplate.append(createInterval('breaks', 'Breaks', 'Breaks'));
    }

    function createCircuitBuilderFormTemplate() {
        var $exercises = $circuitBuilderFormTemplate.find('.exercises');
        var $rest = $circuitBuilderFormTemplate.find('.rest');
        var $addButton = $exercises.find('input');

        $addButton.click(function (e) {
            var $exercises = $(this).parent('.exercises');
            var $exercise = createInterval('exercise', $exercises.children().length, 'Exercise ' + $exercises.children().length);
            $(this).before($exercise);
            $exercise.find('.overview a').click();
            $exercise.find('.name').select();
        });
        $addButton.click();

        $rest.append(createInterval('intervalRest', 'End of Interval', 'End of Interval'));
        $rest.append(createInterval('setRest', 'End of Set', 'End of Set'));
    }

    function createTemplates() {
        createCustomBuilderFormTemplate();
        createHIITBuilderFormTemplate();
        createRoundBuilderFormTemplate();
        createCircuitBuilderFormTemplate();
    }

    function collate($builderForm, errors) {
        var data = {};

        var $name = $builderForm.find('.name').first();
        data.name = $name.val();
        if (data.name == '') {
            errors.push({ element: $name, message: 'Please name your timer' });
        }

        data.type = $builderForm.find('.type').int();
        data.soundScheme = 1; //$builderForm.find('.sound-scheme').int();
        data.url = ''; //$builderForm.find('.url').val();
        data.urlTitle = ''; //$builderForm.find('.url-title').val();

        switch (data.type) {
            case 0:
                collateCustom($builderForm, data, errors);
                break;
            case 1:
                collateHIIT($builderForm, data, errors);
                break;
            case 2:
                collateRound($builderForm, data, errors);
                break;
            case 3:
                collateCircuit($builderForm, data, errors);
                break;
        }

        return data;
    }

    function collateCustom($builderForm, data, errors) {
        data.intervals = [];
        $builderForm.find('.interval').each(function (index) {
            data.intervals[index] = {
                name: $(this).find('.name').val(),
                duration: $(this).find('.duration').int(),
                color: 0 //$(this).find('.color').int() || 0
            };
            if (data.intervals[index].name == '') {
                errors.push({ element: $(this).find('.name'), message: 'Please name this exercise' });
            }
            if (isNaN(data.intervals[index].duration) == true) {
                errors.push({ element: $(this).find('.duration'), message: 'Seconds must be greater than zero' });
            }
            if (data.intervals[index].duration < 1) {
                errors.push({ element: $(this).find('.duration'), message: 'Seconds must be greater than zero' });
            }
        });
    }

    function collateHIIT($builderForm, data, errors) {
        data.numberOfSets = parseInt($builderForm.find('.sets').val());
        if (isNaN(data.numberOfSets) == true) {
            errors.push({ element: $builderForm.find('.sets'), message: 'This must be a number greater than one' });
        }
        if (data.numberOfSets < 2) {
            errors.push({ element: $builderForm.find('.sets'), message: 'You must have at least two sets' });
        }

        data.warmup = {
            name: $builderForm.find('.warmup .name').val(),
            duration: $builderForm.find('.warmup .duration').int(),
            color: 0 //$builderForm.find('.warmup .color').int() || 0
        };
        if (data.warmup.name == '') {
            errors.push({ element: $builderForm.find('.warmup .name'), message: 'Please name this interval type' });
        }
        if (isNaN(data.warmup.duration) == true) {
            errors.push({ element: $builderForm.find('.warmup .duration'), message: 'This must be zero or greater' });
        }
        if (data.warmup.duration < 0) {
            errors.push({ element: $builderForm.find('.warmup .duration'), message: 'This must be zero or greater' });
        }

        data.highIntensity = {
            name: $builderForm.find('.high-intensity .name').val(),
            duration: $builderForm.find('.high-intensity .duration').int(),
            color: 0 //$builderForm.find('.high-intensity .color').int() || 0
        };
        if (data.highIntensity.name == '') {
            errors.push({ element: $builderForm.find('.high-intensity .name'), message: 'Please name this interval type' });
        }
        if (isNaN(data.highIntensity.duration) == true) {
            errors.push({ element: $builderForm.find('.high-intensity .duration'), message: 'This must be greater than zero' });
        }
        if (data.highIntensity.duration < 1) {
            errors.push({ element: $builderForm.find('.high-intensity .duration'), message: 'This must be greater than zero' });
        }

        data.lowIntensity = {
            name: $builderForm.find('.low-intensity .name').val(),
            duration: $builderForm.find('.low-intensity .duration').int(),
            color: 0 //$builderForm.find('.low-intensity .color').int() || 0
        };
        if (data.lowIntensity.name == '') {
            errors.push({ element: $builderForm.find('.low-intensity .name'), message: 'Please name this interval type' });
        }
        if (isNaN(data.lowIntensity.duration) == true) {
            errors.push({ element: $builderForm.find('.low-intensity .duration'), message: 'Seconds must be greater than zero' });
        }
        if (data.lowIntensity.duration < 1) {
            errors.push({ element: $builderForm.find('.low-intensity .duration'), message: 'Seconds must be greater than zero' });
        }

        data.cooldown = {
            name: $builderForm.find('.cooldown .name').val(),
            duration: $builderForm.find('.cooldown .duration').int(),
            color: 0 //$builderForm.find('.cooldown .color').int() || 0
        };
        if (data.cooldown.name == '') {
            errors.push({ element: $builderForm.find('.cooldown .name'), message: 'Please name this interval type' });
        }
        if (isNaN(data.cooldown.duration) == true) {
            errors.push({ element: $builderForm.find('.cooldown .duration'), message: 'Seconds must be zero or greater' });
        }
        if (data.cooldown.duration < 0) {
            errors.push({ element: $builderForm.find('.cooldown .duration'), message: 'Seconds must be zero or greater' });
        }
    }

    function collateRound($builderForm, data, errors) {
        data.numberOfSets = $builderForm.find('.sets').int();
        if (isNaN(data.numberOfSets) == true) {
            errors.push({ element: $builderForm.find('.sets'), message: 'This must be a number greater than one' });
        }
        if (data.numberOfSets < 2) {
            errors.push({ element: $builderForm.find('.sets'), message: 'You must have at least two rounds' });
        }

        data.rounds = {
            name: '',
            duration: $builderForm.find('.rounds .duration').int(),
            color: 0 //$builderForm.find('.rounds .color').int() || 0
        };
        if (isNaN(data.rounds.duration) == true) {
            errors.push({ element: $builderForm.find('.rounds .duration'), message: 'Seconds must be greater than zero' });
        }
        if (data.rounds.duration < 0) {
            errors.push({ element: $builderForm.find('.rounds .duration'), message: 'Seconds must be greater than zero' });
        }

        data.breaks = {
            name: '',
            duration: $builderForm.find('.breaks .duration').int(),
            color: 0 //$builderForm.find('.breaks .color').int() || 0
        };
        if (isNaN(data.breaks.duration) == true) {
            errors.push({ element: $builderForm.find('.breaks .duration'), message: 'Seconds must be greater than zero' });
        }
        if (data.breaks.duration < 0) {
            errors.push({ element: $builderForm.find('.breaks .duration'), message: 'Seconds must be greater than zero' });
        }
    }

    function collateCircuit($builderForm, data, errors) {
        data.numberOfSets = $builderForm.find('.sets').int();
        if (isNaN(data.numberOfSets) == true) {
            errors.push({ element: $builderForm.find('.sets'), message: 'This must be a number greater than zero' });
        }
        if (data.numberOfSets < 1) {
            errors.push({ element: $builderForm.find('.sets'), message: 'You must have at least one set' });
        }

        data.group = !($builderForm.find('.loop').is(':checked'));
        data.setRest = {
            name: '',
            duration: $builderForm.find('.setRest .duration').int(),
            color: 0 //$builderForm.find('.setRest .color').int() || 0
        };
        if (isNaN(data.setRest.duration) == true) {
            errors.push({ element: $builderForm.find('.setRest .duration'), message: 'Seconds must be zero or greater' });
        }
        if (data.setRest.duration < 0) {
            errors.push({ element: $builderForm.find('.setRest .duration'), message: 'Seconds must be zero or greater' });
        }

        data.intervalRest = {
            name: '',
            duration: $builderForm.find('.intervalRest .duration').int(),
            color: 0 //$builderForm.find('.intervalRest .color').int() || 0
        };
        if (isNaN(data.intervalRest.duration) == true) {
            errors.push({ element: $builderForm.find('.intervalRest .duration'), message: 'Seconds must be zero or greater' });
        }
        if (data.intervalRest.duration < 0) {
            errors.push({ element: $builderForm.find('.intervalRest .duration'), message: 'Seconds must be zero or greater' });
        }

        data.intervals = [];
        $builderForm.find('.exercise').each(function (index) {
            data.intervals[index] = {
                name: $(this).find('.name').val(),
                duration: $(this).find('.duration').int(),
                color: 0 //$(this).find('.color').int() || 0
            };
            if (data.intervals[index].name == '') {
                errors.push({ element: $(this).find('.name'), message: 'Please name this exercise' });
            }
            if (isNaN(data.intervals[index].duration) == true) {
                errors.push({ element: $(this).find('.duration'), message: 'Seconds must be greater than zero' });
            }
            if (data.intervals[index].duration < 1) {
                errors.push({ element: $(this).find('.duration'), message: 'Seconds must be greater than zero' });
            }
        });
    }

    $builderFormTemplate.find('.type').change(function (e) {
        $builderForm = this.parent('.timer');
    });

    $createButton.click(function (e) {
        var errors = [];
        var data = collate($builderForm, errors);

        $('.error').remove();

        if (errors.length == 0) {
            $timerData.val(JSON.stringify(data));
            
            //initiate new dev + call timer.js?
            var def = { "name": "Timer changed by code", "type": data.type, "soundScheme": 2, "url": "", "urlTitle": "", "numberOfSets": data.numberOfSets, "rounds": { "name": "", "duration": data.rounds.duration, "color": 0 }, "breaks": { "name": "", "duration": data.breaks.duration, "color": 0 } };

            timer.useDefinition(def);
            timer.reset();
            //$form.submit();
        }
        else {
            for (var i = 0; i < errors.length; i++) {
                if (i == 0) {
                    $(errors[i].element).focus();
                }
                $(errors[i].element).parents('.form-field').append('<div class="error" style="color:red">' + errors[i].message + '</div>');
            }
        }
    });

    $previewButton.click(function (e) {
        var errors = [];
        var data = collate($builderForm, errors);

        $('.error').remove();

        if (errors.length == 0) {
            timer.useDefinition(data);
            timer.reset();
        }
        else {
            for (var i = 0; i < errors.length; i++) {
                if (i == 0) {
                    $(errors[i].element).focus();
                }
                $(errors[i].element).parents('.form-field').append('<div class="error" style="color:red">' + errors[i].message + '</div>');
            }
        }
    });

    createTemplates();

    $builderForm = createBuilderForm();
    $builder.append($builderForm);

    $('input').change(function (e) {
        var className = '.' + $(this).attr('class');
        var $parent = $(this).parents('.toggle-panel');
        $parent.find(className).text($(this).val());
    });

    $('#share-code').select();
});