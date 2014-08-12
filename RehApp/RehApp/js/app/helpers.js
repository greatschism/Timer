var Runloop = Runloop || {};

Runloop.utils = (function (window, undefined) {
    "use string";
    var utils = {};

    utils.lpad = function (string, pad, length) {
        return (new Array(length + 1).join(pad) + string).slice(-length);
    };

    utils.rpad = function (string, pad, length) {
        return (string + new Array(length + 1).join(pad)).slice(0, length);
    };

    utils.systemTime = function () {
        return (new Date()).getTime();
    };

    utils.formattedDuration = function (milliseconds) {
        var seconds = Math.floor(milliseconds / 1000);

        var hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        var minutes = Math.floor(seconds / 60);
        seconds -= (minutes * 60);

        return this.lpad(minutes, 0, 2) + ':' + this.lpad(seconds, 0, 2);

        // old formatted duration code
        // var hours = Math.floor(milliseconds / 3600000);
        // milliseconds -= hours * 3600000;

        // var minutes = Math.floor(milliseconds / 60000);
        // milliseconds -= minutes * 60000;

        // var seconds = Math.floor(milliseconds / 1000);
        // milliseconds -= seconds * 1000;

        // Just hundreths
        // milliseconds = Math.round(milliseconds / 10);

        // return this.lpad(hours, 0, 2) + ':' + this.lpad(minutes, 0, 2) + ':' + this.lpad(seconds, 0, 2) + ':' + this.lpad(milliseconds, 0, 3);
    };

    return utils;
})();