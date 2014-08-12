var Runloop = window.Runloop || {};

Runloop.createTimer = (function (window, undefined) {
    "use strict";
    var TIMER_TYPE_CUSTOM = 0;
    var TIMER_TYPE_HIIT = 1;
    var TIMER_TYPE_ROUND = 2;
    var TIMER_TYPE_CIRCUIT = 3;
    var TIMER_TYPE_COMPOUND = 4;
    var TIMER_TYPE_TABATA = 5;

    var createTimer = function () {
        var intervals = [];
        var totalNonRestIntervals = 0;
        var intervalElapsedTime = 0;
        var currentIntervalIndex = 0;
        var currentTime = 0;
        var previousTime = 0;
        var previousFullSecond = 0;
        var intervalId = 0;
        var intervalSumsMemoizeResults;

        var timer = {};
        timer.totalElapsedTime = 0;

        timer.onTick = function () { };
        timer.onSecondsChange = function () { };
        timer.onIntervalChange = function (userInitiated) { };
        timer.onTimerComplete = function () { };

        // private functions
        function resetMemoization() {
            intervalSumsMemoizeResults = [0];
        }

        function createInterval(def) {
            return {
                name: def.name,
                duration: def.duration * 1000,
                color: def.color
            };
        }

        function intervalsForDefinition(def) {
            var _intervals;

            switch (def.type) {
                case TIMER_TYPE_CUSTOM:
                    _intervals = intervalsForCustomTimerDefinition(def);
                    break;
                case TIMER_TYPE_HIIT:
                    _intervals = intervalsForHIITTimerDefinition(def);
                    break;
                case TIMER_TYPE_ROUND:
                    _intervals = intervalsForRoundTimerDefinition(def);
                    break;
                case TIMER_TYPE_CIRCUIT:
                    _intervals = intervalsForCircuitTimerDefinition(def);
                    break;
                case TIMER_TYPE_COMPOUND:
                    _intervals = intervalsForCompoundTimerDefinition(def);
                    break;
                case TIMER_TYPE_TABATA:
                    _intervals = intervalsForTabataTimerDefinition(def);
                    break;
                default:
            }
            return _intervals;
        }

        function intervalsForCustomTimerDefinition(def) {
            var _intervals = [];
            var interval;
            var index = 0;
            var count = 0, total = 0;
            var i;

            for (i = 0; i < def.intervals.length; i++) {
                if (def.intervals[i].rest !== true) {
                    total += 1;
                }
            }

            for (i = 0; i < def.intervals.length; i++) {
                if (def.intervals[i].rest !== true) {
                    count += 1;
                }

                interval = createInterval(def.intervals[i]);
                interval.number = count + '/' + total;
                _intervals[index++] = interval;
            }

            return _intervals;
        }

        function intervalsForHIITTimerDefinition(def) {
            var interval;
            var index = 0;
            var i;
            var number = 0;

            var _intervals = [];
            totalNonRestIntervals = def.numberOfSets;

            if (def.warmup && def.warmup.duration > 0) {
                interval = createInterval(def.warmup);
                interval.number = number + '/' + def.numberOfSets;
                interval.isRest = true;
                _intervals[index++] = interval;
            }

            for (i = 0; i < def.numberOfSets; i++) {
                if (i > 0) {
                    interval = createInterval(def.lowIntensity);
                    interval.number = number + '/' + def.numberOfSets;
                    interval.isRest = true;
                    _intervals[index++] = interval;
                }

                number += 1;
                interval = createInterval(def.highIntensity);
                interval.number = number + '/' + def.numberOfSets;
                _intervals[index++] = interval;
            }

            if (def.cooldown && def.cooldown.duration > 0) {
                interval = createInterval(def.cooldown);
                interval.number = number + '/' + def.numberOfSets;
                interval.isRest = true;
                _intervals[index++] = interval;
            }

            return _intervals;
        }

        function intervalsForRoundTimerDefinition(def) {
            var interval;
            var index = 0;
            var i;
            var _intervals = [];
            var number = 0;

            totalNonRestIntervals = def.numberOfSets;

            for (i = 0; i < def.numberOfSets; i++) {
                if (i > 0) {
                    interval = createInterval(def.breaks);
                    interval.isRest = true;
                    interval.name = 'End of Round ' + i;
                    interval.number = number + '/' + def.numberOfSets;
                    _intervals[index++] = interval;
                }

                number += 1;

                interval = createInterval(def.rounds);
                interval.name = 'Round ' + (i + 1);
                interval.number = number + '/' + def.numberOfSets;
                _intervals[index++] = interval;
            }

            return _intervals;
        }

        function intervalsForCircuitTimerDefinition(def) {
            var _intervals;
            if (def.group === true) {
                _intervals = intervalsForGroupedCircuitTimerDefinition(def);
            }
            else {
                _intervals = intervalsForUngroupedCircuitTimerDefinition(def);
            }
            return _intervals;
        }

        function intervalsForGroupedCircuitTimerDefinition(def) {
            var _intervals = [];
            var interval;
            var countSet = 0;
            var countExercise = 0;
            var set, exercise;
            var index = 0;

            for (exercise = 0; exercise < def.intervals.length; exercise++) {
                countSet = 0;
                countExercise += 1;

                if (exercise > 0 && def.setRest.duration > 0) {
                    interval = createInterval(def.setRest);
                    interval.name = 'Rest';
                    interval.isRest = true;
                    interval.number = countExercise + '-' + countSet + '/' + def.intervals.length + '-' + def.numberOfSets;
                    _intervals[index++] = interval;
                }
                else if (exercise > 0 && def.intervalRest.duration > 0) {
                    interval = createInterval(def.intervalRest);
                    interval.name = 'Rest';
                    interval.isRest = true;
                    interval.number = countExercise + '-' + countSet + '/' + def.intervals.length + '-' + def.numberOfSets;
                    _intervals[index++] = interval;
                }

                for (set = 0; set < def.numberOfSets; set++) {
                    if (set > 0 && def.intervalRest.duration > 0) {
                        interval = createInterval(def.intervalRest);
                        interval.name = 'Rest';
                        interval.isRest = true;
                        interval.number = countExercise + '-' + countSet + '/' + def.intervals.length + '-' + def.numberOfSets;
                        _intervals[index++] = interval;
                    }

                    countSet += 1;

                    interval = createInterval(def.intervals[exercise]);
                    interval.number = countExercise + '-' + countSet + '/' + def.intervals.length + '-' + def.numberOfSets;
                    _intervals[index++] = interval;
                }
            }

            return _intervals;
        }

        function intervalsForUngroupedCircuitTimerDefinition(def) {
            var _intervals = [];
            var interval;
            var countSet = 0;
            var countExercise = 0;
            var set, exercise;
            var index = 0;

            for (set = 0; set < def.numberOfSets; set++) {
                countSet += 1;
                countExercise = 0;

                if (set > 0) {
                    if (def.setRest.duration > 0) {
                        interval = createInterval(def.setRest);
                        interval.name = 'Rest';
                        interval.isRest = true;
                        interval.number = countSet + '-' + countExercise + '/' + def.numberOfSets + '-' + def.intervals.length;
                        _intervals[index++] = interval;
                    }
                    else if (def.intervalRest.duration > 0) {
                        interval = createInterval(def.intervalRest);
                        interval.name = 'Rest';
                        interval.isRest = true;
                        interval.number = countSet + '-' + countExercise + '/' + def.numberOfSets + '-' + def.intervals.length;
                        _intervals[index++] = interval;
                    }
                }

                for (exercise = 0; exercise < def.intervals.length; exercise++) {
                    if (exercise > 0 && def.intervalRest.duration > 0) {
                        interval = createInterval(def.intervalRest);
                        interval.name = 'Rest';
                        interval.isRest = true;
                        interval.number = countSet + '-' + countExercise + '/' + def.numberOfSets + '-' + def.intervals.length;
                        _intervals[index++] = interval;
                    }

                    countExercise += 1;

                    interval = createInterval(def.intervals[exercise]);
                    interval.number = countSet + '-' + countExercise + '/' + def.numberOfSets + '-' + def.intervals.length;
                    _intervals[index++] = interval;
                }
            }

            return _intervals;
        }

        function intervalsForCompoundTimerDefinition(def) {
            var _intervals = [];
            var interval;
            var i, j, k;
            var index = 0;
            var subDef;
            var subIntervals;
            var total = 0, count = 0;

            for (i = 0; i < def.numberOfSets; i++) {
                if (i > 0 && def.circuitRest.duration > 0) {
                    interval = createInterval(def.circuitRest);
                    interval.name = 'Rest';
                    interval.isRest = true;
                    _intervals[index++] = interval;
                }
                else if (i > 0 && def.timerRest.duration > 0) {
                    interval = createInterval(def.timerRest);
                    interval.name = 'Rest';
                    interval.isRest = true;
                    _intervals[index++] = interval;
                }

                for (j = 0; j < def.timers.length; j++) {
                    if (j > 0 && def.timerRest.duration > 0) {
                        interval = createInterval(def.timerRest);
                        interval.name = 'Rest';
                        interval.isRest = true;
                        _intervals[index++] = interval;
                    }

                    subIntervals = intervalsForDefinition(def.timers[j]);

                    for (k = 0; k < subIntervals.length; k++) {
                        _intervals[index++] = subIntervals[k];
                    }
                }
            }

            // find total intervals that arent rest
            for (i = 0; i < _intervals.length; i++) {
                if (_intervals[i].isRest !== true) {
                    total += 1;
                }
            }

            for (i = 0; i < _intervals.length; i++) {
                if (_intervals[i].isRest !== true) {
                    count += 1;
                }

                _intervals[i].number = count + '/' + total;
            }

            return _intervals;
        }

        function intervalsForTabataTimerDefinition(def) {
            var interval;
            var compoundDef = {
                "name": def.name,
                "soundScheme": def.soundScheme,
                "timers": []
            };

            if (def.warmup.duration > 0) {
                interval = createInterval(def.warmup);

            }

        }

        timer.useDefinition = function (def) {
            resetMemoization();
            intervals = intervalsForDefinition(def);
        };

        timer.timeElapsedBeforeIntervalWithIndex = function (index) {
            var result = intervalSumsMemoizeResults[index];
            var previousIndex;
            if (typeof result !== 'number') {
                previousIndex = index - 1;
                result = this.timeElapsedBeforeIntervalWithIndex(previousIndex) + intervals[previousIndex].duration;
                intervalSumsMemoizeResults[index] = result;
            }
            return result;
        };

        timer.totalDuration = function () {
            return this.timeElapsedBeforeIntervalWithIndex(intervals.length);
        };

        timer.totalRemainingDuration = function () {
            // add 999ms to result so that when timers are counting down they look correct.
            // This is only required with not displaying ms
            return this.totalDuration() - currentTime + 999;
        };

        timer.getTimeElapsedForCurrentInterval = function () {
            return intervalElapsedTime;
        };

        timer.getTimeRemainingForCurrentInterval = function () {
            // add 999ms to result so that when timers are counting down they look correct.
            // This is only required with not displaying ms
            return intervals[currentIntervalIndex].duration - intervalElapsedTime + 999;
        };

        timer.getCurrentIntervalNumber = function () {
            return intervals[currentIntervalIndex].number;
        };

        timer.getCurrentIntervalName = function () {
            return intervals[currentIntervalIndex].name;
        };

        timer.getCurrentIntervalColorId = function () {
            return intervals[currentIntervalIndex].color;
        };

        timer.getNextIntervalName = function () {
            var interval = intervals[currentIntervalIndex + 1];
            return (typeof interval === 'undefined') ? 'End of Timer' : interval.name;
        };

        timer.intervalDuration = function () {
            intervalElapsedTime = 0;
        };

        timer.getIsPlaying = function () {
            return (intervalId !== 0);
        }

        timer.reset = function () {
            currentTime = 0;
            currentIntervalIndex = 0;
            intervalElapsedTime = 0;
            previousFullSecond = 0;
            this.totalElapsedTime = 0;

            this.stop();
            this.onTick();
            this.onIntervalChange(true);
        };

        timer.nextInterval = function () {
            if (currentIntervalIndex < intervals.length - 1) {
                timer.jumpToInterval(currentIntervalIndex + 1);
            }
        };

        timer.prevInterval = function () {
            if (currentIntervalIndex > 0) {
                timer.jumpToInterval(currentIntervalIndex - 1);
            }
        };

        timer.jumpToInterval = function (index) {
            if (index >= 0 && index < intervals.length) {
                currentIntervalIndex = index;
                intervalElapsedTime = 0;
                currentTime = this.timeElapsedBeforeIntervalWithIndex(index);
                previousFullSecond = 0;
                this.onTick();
                this.onIntervalChange(true);
            }
        };

        timer.tick = function () {
            var systemTime = Runloop.utils.systemTime();
            var elapsed = systemTime - previousTime;
            var intervalRemainingTime, intervalSecond;

            if (intervalId !== 0) {
                currentTime = Math.min(currentTime + elapsed, this.timeElapsedBeforeIntervalWithIndex(intervals.length));
                intervalElapsedTime += elapsed;
                intervalSecond = Math.floor(intervalElapsedTime / 1000);
                this.totalElapsedTime += elapsed;

                intervalRemainingTime = intervals[currentIntervalIndex].duration - intervalElapsedTime;

                if (intervalRemainingTime < 0) {
                    intervalElapsedTime = intervalRemainingTime * -1;

                    if (currentIntervalIndex < (intervals.length - 1)) {
                        currentIntervalIndex += 1;
                        this.onIntervalChange(false);
                    }
                    else {
                        intervalElapsedTime = intervals[currentIntervalIndex].duration;
                        previousFullSecond = intervalSecond; // this stops the seconds changed callback
                        this.stop();
                        this.onTimerComplete();
                    }
                }

                if (intervalSecond != previousFullSecond) {
                    previousFullSecond = intervalSecond;
                    this.onSecondsChange();
                }

                this.onTick();

                previousTime = systemTime;
            }
        };

        timer.start = function () {
            if (intervalId === 0) {
                var that = this;
                previousTime = Runloop.utils.systemTime();
                this.tick();
                intervalId = setInterval(function () { that.tick() }, 1000 / 30); // 60 fps
            }
        };

        timer.stop = function () {
            if (intervalId !== 0) {
                clearInterval(intervalId);
                intervalId = 0;
            }
        };

        return timer;
    }

    return createTimer;
})(window);



