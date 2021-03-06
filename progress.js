$(function() {
    var dateHeaders = $("h1").filter(function(index, header) {
	// Lame test for YYYY-MM-DD
	return $(header).text().length == 10;
    });

    var statsHeaders = $.map(dateHeaders, function(header, index) {
	var date = $(header).text();
	return {
	    date: date,
	    statsHeader: header
	}
    });

    var stats = $.map(statsHeaders, function(header, index) {
	var date = header.date;
	var statsHeader = header.statsHeader;
	var statsList = $(statsHeader).nextAll("ul")[0];
	var listItems = $(statsList).children("li");
	var validItems = $(listItems).filter(function(index) {
	    var raw = $(listItems[index]).text();
	    var value = raw.split(" ")[0];
	    return $.isNumeric(value);
	});
	var dailyStats = $.map(validItems, function(item, index) {
	    var raw = $(item).text();
	    var value = raw.split(" ")[0];
	    var unit = raw.slice(value.length, raw.length).trim();
	    return {
		value: value,
		unit: unit
	    };
	});

	return {
	    date: date,
	    stats: dailyStats
	};
    });

    var container = $("<div />");
    container.css("margin-bottom", "100px");
    $("body").prepend(container);

    container.width(800);
    container.height(400);

    var data = statsToFlots(stats);

    console.log(JSON.stringify(data));

    var options = {
	legend: {
	    position: "nw"
	},
	xaxis: {
	    mode: "time"
	},
	series: {
	    points: {
		show: true
	    },
	    lines: {
		show: true
	    }
	}
    };

    $.plot(container, data, options);
});

function statsToFlots(allStats) {
    var series = { };
    allStats.forEach(function(dailyStats) {
	dailyStats.stats.forEach(function(stats) {
	    var seriesData = series[stats.unit];
	    if (seriesData == null) {
		seriesData = {
		    label: stats.unit,
		    data: []
		};
	    }

	    var flotDate = dateToFlots(dailyStats.date);
	    var flotValue = valueToFlots(stats.value);

	    seriesData.data.push([flotDate, flotValue]);

	    series[stats.unit] = seriesData;
	});
    });

    var seriesList = []
    for (var s in series) {
	seriesList.push(series[s]);
    }

    return seriesList;
}

function dateToFlots(date) {
    return (new Date(date)).getTime();
}

function valueToFlots(value) {
    if (value.indexOf("$") == 0) {
	value = value.slice(1, value.length);
    }

    return parseInt(value, 10);
}
