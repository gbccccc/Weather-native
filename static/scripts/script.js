window.onload = init

const ipInfoKey = "63511c0996acf1"
const googleApiKey = "AIzaSyAG1FPkDpKn_pC2Kr9-hgNzodkHb9hyY8E"

let forecasts;
let hourly;

function init() {
  let stateSelection = document.getElementById("state")
  for (let stateAbbr in stateMapping) {
    let option = new Option(stateMapping[stateAbbr], stateAbbr)
    stateSelection.appendChild(option)
  }
}

function onClear() {
  document.getElementById("result-section").style.display = "none"
  document.getElementById("detail-section").style.display = "none"
  document.getElementById("no-record-section").style.display = "none"
  hideCharts()
}

function noResult() {
  document.getElementById("no-record-section").style.display = "block"
}

function submitAddress() {
  let autoDetection = document.getElementById("auto-detect").checked
  if (autoDetection) {
    let xhrAutoDetect = new XMLHttpRequest()
    xhrAutoDetect.open("GET", `https://ipinfo.io/?token=${ipInfoKey}`)
    xhrAutoDetect.onload = (event) => {
      let responseJson = JSON.parse(event.target.response)
      let xhrTomorrow = new XMLHttpRequest();
      locArray = responseJson.loc.split(",")
      xhrTomorrow.open("GET", `/weather?lat=${parseInt(locArray[0])}&lng=${parseInt(locArray[1])}`);
      xhrTomorrow.onload = (event) => {
        handleWeatherStats(event.target.response, `${responseJson.city}, ${responseJson.region}, ${responseJson.country}`)
      }
      xhrTomorrow.send();
    }
    xhrAutoDetect.send()
  } else {
    let addressForm = document.getElementById("address-form")
    if (addressForm.reportValidity()) {
      let formData = new FormData(document.getElementById("address-form"))
      let addressArray = []
      for (let entry of formData.entries()) {
        addressArray.push(entry[1].replaceAll(" ", "+"))
      }
      let addressStr = addressArray.join()

      let xhrGeocoding = new XMLHttpRequest()
      xhrGeocoding.open("GET",
        `https://maps.googleapis.com/maps/api/geocode/json?address=${addressStr}&key=${googleApiKey}`)
      xhrGeocoding.onload = (event) => {
        let responseJson = JSON.parse(event.target.response)
        if (responseJson.results.length === 0) {
          onClear()
          noResult()
          return
        }

        let location = responseJson.results[0].geometry.location
        let xhrTomorrow = new XMLHttpRequest();
        xhrTomorrow.open("GET", `/weather?lat=${location.lat}&lng=${location.lng}`);
        xhrTomorrow.onload = (event) =>
          handleWeatherStats(event.target.response, responseJson.results[0].formatted_address)
        xhrTomorrow.send();
      }
      xhrGeocoding.send()
    }
  }
}

function handleWeatherStats(response, address) {
  onClear()
  let responseJson = JSON.parse(response)
  if (!(responseJson.current.data && responseJson.forecast.data)) {
    noResult()
    return
  }
  forecasts = responseJson.forecast.data.timelines[0].intervals
  hourly = responseJson.hourly.data.timelines[0].intervals

  displayCurrentWeather(responseJson.current, address)
  displayForecastWeather()
  document.getElementById("result-section").style.display = "block"
}

function displayCurrentWeather(currentWeather, address) {
  let weatherStats = currentWeather.data.timelines[0].intervals[0].values

  document.getElementById("card-address").innerText = address
  document.getElementById("card-weather-icon").setAttribute("src",
    `/static/images/weather-symbols/${weatherMapping[weatherStats.weatherCode].iconName}`)
  document.getElementById("card-weather-icon").setAttribute("alt",
    weatherMapping[weatherStats.weatherCode].iconName)
  document.getElementById("card-temperature").innerText = weatherStats.temperature
  document.getElementById("card-weather").innerText = weatherMapping[weatherStats.weatherCode].description
  document.getElementById("card-humidity").innerText = weatherStats.humidity
  document.getElementById("card-pressure").innerText = weatherStats.pressureSeaLevel
  document.getElementById("card-wind-speed").innerText = weatherStats.windSpeed
  document.getElementById("card-visibility").innerText = weatherStats.visibility
  document.getElementById("card-cloud-cover").innerText = weatherStats.cloudCover
  document.getElementById("card-uv-level").innerText = weatherStats.uvIndex
}


function displayForecastWeather() {
  let resultTableBody = document.getElementById("result-table").children[0]
  let tableChildren = resultTableBody.children
  while (tableChildren.length > 1) {
    tableChildren[1].remove()
  }

  for (let i = 0; i < forecasts.length; i++) {
    let forecast = forecasts[i]
    let tableRow = document.createElement("tr")

    tableRow.setAttribute("class", "result-table-row")
    tableRow.setAttribute("onclick", `displayDetail(${i})`)

    let tableData = document.createElement("td")
    tableData.innerText = formatDate(new Date(forecast.startTime))
    tableRow.appendChild(tableData)

    tableData = document.createElement("td")
    let statusIcon = document.createElement("img")
    statusIcon.setAttribute("class", "table-status-icon")
    statusIcon.setAttribute("src",
      `/static/images/weather-symbols/${weatherMapping[forecast.values.weatherCode].iconName}`)
    statusIcon.setAttribute("alt", weatherMapping[forecast.values.weatherCode].iconName)
    tableData.appendChild(statusIcon)
    tableData.append(weatherMapping[forecast.values.weatherCode].description)
    tableRow.appendChild(tableData)

    tableData = document.createElement("td")
    tableData.innerText = forecast.values.temperatureMax
    tableRow.appendChild(tableData)

    tableData = document.createElement("td")
    tableData.innerText = forecast.values.temperatureMin
    tableRow.appendChild(tableData)

    tableData = document.createElement("td")
    tableData.innerText = forecast.values.windSpeed
    tableRow.appendChild(tableData)

    resultTableBody.append(tableRow)
  }
}

function formatDate(date) {
  return `${weekdayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

function formatTime(date) {
  let hour = date.getHours()
  let ampm = hour >= 12 ? "PM" : "AM"
  hour %= 12
  hour = hour === 0 ? 12 : hour
  return `${hour}:${date.getMinutes()}${ampm}`
}

function displayDetail(forecastIndex) {
  document.getElementById("result-section").style.display = "none"
  document.getElementById("detail-section").style.display = "none"

  let forecast = forecasts[forecastIndex]
  document.getElementById("detail-date").innerText = formatDate(new Date(forecast.startTime))
  document.getElementById("detail-status").innerText = weatherMapping[forecast.values.weatherCode].description
  document.getElementById("detail-temp-high").innerText = forecast.values.temperatureMax
  document.getElementById("detail-temp-low").innerText = forecast.values.temperatureMin
  document.getElementById("detail-status-icon").setAttribute("src",
    `/static/images/weather-symbols/${weatherMapping[forecast.values.weatherCode].iconName}`)
  document.getElementById("detail-status-icon").setAttribute("alt",
    "${weatherMapping[forecast.values.weatherCode].iconName}")
  document.getElementById("detail-precipitation").innerText = precipitationMapping[forecast.values.precipitationType]
  document.getElementById("detail-rain-chance").innerText = forecast.values.precipitationProbability
  document.getElementById("detail-wind-speed").innerText = forecast.values.windSpeed
  document.getElementById("detail-humidity").innerText = forecast.values.humidity
  document.getElementById("detail-visibility").innerText = forecast.values.visibility
  document.getElementById("detail-sunrise").innerText = formatTime(new Date(forecast.values.sunriseTime))
  document.getElementById("detail-sunset").innerText = formatTime(new Date(forecast.values.sunsetTime))

  document.getElementById("detail-section").style.display = "block"
}

function onClickChartsButton() {
  if (document.getElementById("display-charts-button").className === "hiding-charts") {
    displayCharts()
  } else {
    hideCharts()
  }
}

function displayCharts() {
  document.getElementById("weather-charts").style.display = "block"
  document.getElementById("display-charts-button").className = "showing-charts"

  displayMinMaxTemperatureChart()
  displayHourlyChart()
}

function displayMinMaxTemperatureChart() {
  let data = []
  for (forecast of forecasts) {
    data.push([new Date(forecast.startTime).getTime(), forecast.values.temperatureMin, forecast.values.temperatureMax])
  }

  ;(async () => {
    Highcharts.chart('min-max-temp-chart', {
      chart: {
        type: 'arearange',
        zooming: {
          type: 'x'
        },
        scrollablePlotArea: {
          minWidth: 600,
          scrollPositionX: 1
        }
      },
      title: {
        text: 'Temperature Ranges (Min, Max)'
      },
      xAxis: {
        type: 'datetime',
        accessibility: {
          rangeDescription: 'Range: Jan 1st 2017 to Dec 31 2017.'
        }
      },
      yAxis: {
        title: {
          text: null
        }
      },
      tooltip: {
        crosshairs: true,
        shared: true,
        valueSuffix: '°F',
        xDateFormat: '%A, %b %e'
      },
      legend: {
        enabled: false
      },
      series: [{
        name: 'Temperatures',
        data: data,
        color: {
          linearGradient: {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, '#ff5900'],
            [1, '#03bafc']
          ]
        }
      }]
    });
  })();
}

function displayHourlyChart() {
  /**
   * This is a complex demo of how to set up a Highcharts chart, coupled to a
   * dynamic source and extended by drawing image sprites, wind arrow paths
   * and a second grid on top of the chart. The purpose of the demo is to inpire
   * developers to go beyond the basic chart types and show how the library can
   * be extended programmatically. This is what the demo does:
   *
   * - Loads weather forecast from www.yr.no in form of a JSON service.
   * - When the data arrives async, a Meteogram instance is created. We have
   *   created the Meteogram prototype to provide an organized structure of the
   *   different methods and subroutines associated with the demo.
   * - The parseYrData method parses the data from www.yr.no into several parallel
   *   arrays. These arrays are used directly as the data option for temperature,
   *   precipitation and air pressure.
   * - After this, the options structure is built, and the chart generated with
   *   the parsed data.
   * - On chart load, weather icons and the frames for the wind arrows are
   *   rendered using custom logic.
   */

  function Meteogram(container) {
    // Parallel arrays for the chart data, these are populated as the JSON file
    // is loaded
    this.symbols = [];
    this.humidity = [];
    this.precipitationsError = []; // Only for some data sets
    this.winds = [];
    this.temperatures = [];
    this.pressures = [];

    // Initialize
    this.container = container;

    // Run
    this.parseYrData();
  }

  /**
   * Draw blocks around wind arrows, below the plot area
   */
  Meteogram.prototype.drawBlocksForWindArrows = function (chart) {
    const xAxis = chart.xAxis[0];

    for (
      let pos = xAxis.min, max = xAxis.max, i = 0;
      pos <= max + 36e5; pos += 36e5,
        i += 1
    ) {

      // Get the X position
      const isLast = pos === max + 36e5,
        x = Math.round(xAxis.toPixels(pos)) + (isLast ? 0.5 : -0.5);

      // Draw the vertical dividers and ticks
      const isLong = this.resolution > 36e5 ?
        pos % this.resolution === 0 :
        i % 2 === 0;

      chart.renderer
        .path([
          'M', x, chart.plotTop + chart.plotHeight + (isLong ? 0 : 28),
          'L', x, chart.plotTop + chart.plotHeight + 32,
          'Z'
        ])
        .attr({
          stroke: chart.options.chart.plotBorderColor,
          'stroke-width': 1
        })
        .add();
    }

    // Center items in block
    chart.get('windbarbs').markerGroup.attr({
      translateX: chart.get('windbarbs').markerGroup.translateX + 8
    });

  };

  /**
   * Build and return the Highcharts options structure
   */
  Meteogram.prototype.getChartOptions = function () {
    return {
      chart: {
        renderTo: this.container,
        marginBottom: 70,
        marginRight: 40,
        marginTop: 50,
        plotBorderWidth: 1,
        height: 310,
        alignTicks: false,
        scrollablePlotArea: {
          minWidth: 720
        }
      },

      defs: {
        patterns: [{
          id: 'precipitation-error',
          path: {
            d: [
              'M', 3.3, 0, 'L', -6.7, 10,
              'M', 6.7, 0, 'L', -3.3, 10,
              'M', 10, 0, 'L', 0, 10,
              'M', 13.3, 0, 'L', 3.3, 10,
              'M', 16.7, 0, 'L', 6.7, 10
            ].join(' '),
            stroke: '#68CFE8',
            strokeWidth: 1
          }
        }]
      },

      title: {
        text: 'Hourly Weather (For Next 5 Days)',
        align: 'center',
        style: {
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }
      },

      tooltip: {
        shared: true,
        useHTML: true,
        headerFormat:
          '<small>{point.x:%A, %b %e, %H:%M}<br>'
      },

      xAxis: [{ // Bottom X axis
        type: 'datetime',
        tickInterval: 2 * 36e5, // two hours
        minorTickInterval: 36e5, // one hour
        tickLength: 0,
        gridLineWidth: 1,
        gridLineColor: 'rgba(128, 128, 128, 0.1)',
        startOnTick: false,
        endOnTick: false,
        minPadding: 0,
        maxPadding: 0,
        offset: 30,
        showLastLabel: true,
        labels: {
          format: '{value:%H}'
        },
        crosshair: true
      }, { // Top X axis
        linkedTo: 0,
        type: 'datetime',
        tickInterval: 24 * 3600 * 1000,
        labels: {
          format: '{value:<span style="font-size: 12px; font-weight: ' +
            'bold">%a</span> %b %e}',
          align: 'left',
          x: 3,
          y: 8
        },
        opposite: true,
        tickLength: 20,
        gridLineWidth: 1
      }],

      yAxis: [{ // temperature axis
        title: {
          text: null
        },
        labels: {
          format: '{value}°',
          style: {
            fontSize: '10px'
          },
          x: -3
        },
        plotLines: [{ // zero plane
          value: 0,
          color: '#BBBBBB',
          width: 1,
          zIndex: 2
        }],
        maxPadding: 0.3,
        minRange: 8,
        tickInterval: 1,
        gridLineColor: 'rgba(128, 128, 128, 0.1)'

      }, { // precipitation axis
        title: {
          text: null
        },
        labels: {
          enabled: false
        },
        gridLineWidth: 0,
        tickLength: 0,
        minRange: 10,
        min: 0

      }, { // Air pressure
        allowDecimals: false,
        title: { // Title on top of axis
          text: 'inHg',
          offset: 0,
          align: 'high',
          rotation: 0,
          style: {
            fontSize: '10px',
            color: '#ffd500'
          },
          textAlign: 'left',
          x: 3
        },
        labels: {
          style: {
            fontSize: '8px',
            color: '#ffd500'
          },
          y: 2,
          x: 3
        },
        gridLineWidth: 0,
        opposite: true,
        showLastLabel: false
      }],

      legend: {
        enabled: false
      },

      plotOptions: {
        series: {
          pointPlacement: 'between'
        }
      },


      series: [{
        name: 'Temperature',
        data: this.temperatures,
        type: 'spline',
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true
            }
          }
        },
        tooltip: {
          pointFormat: '<span style="color:{point.color}">\u25CF</span>' +
            ' ' +
            '{series.name}: <b>{point.y}°C</b><br/>'
        },
        zIndex: 1,
        color: '#FF3333',
        negativeColor: '#48AFE8'
      }, {
        name: 'Humidity',
        data: this.precipitationsError,
        type: 'column',
        color: 'url(#precipitation-error)',
        yAxis: 1,
        groupPadding: 0,
        pointPadding: 0,
        tooltip: {
          valueSuffix: '%',
          pointFormat: '<span style="color:{point.color}">\u25CF</span>' +
            ' ' +
            '{series.name}: <b>{point.minvalue} mm - ' +
            '{point.maxvalue} mm</b><br/>'
        },
        grouping: false,
        dataLabels: {
          enabled: this.hasPrecipitationError,
          filter: {
            operator: '>',
            property: 'maxValue',
            value: 0
          },
          style: {
            fontSize: '8px',
            color: 'gray'
          }
        }
      }, {
        name: 'Humidity',
        data: this.humidity,
        type: 'column',
        color: '#68CFE8',
        yAxis: 1,
        groupPadding: 0,
        pointPadding: 0,
        grouping: false,
        dataLabels: {
          enabled: !this.hasPrecipitationError,
          filter: {
            operator: '>',
            property: 'y',
            value: 0
          },
          style: {
            fontSize: '8px',
            color: '#666'
          }
        },
        tooltip: {
          valueSuffix: '%'
        }
      }, {
        name: 'Air pressure',
        color: "#ffd500",
        data: this.pressures,
        marker: {
          enabled: false
        },
        shadow: false,
        tooltip: {
          valueSuffix: ' inHg'
        },
        dashStyle: 'shortdot',
        yAxis: 2
      }, {
        name: 'Wind',
        type: 'windbarb',
        id: 'windbarbs',
        color: Highcharts.getOptions().colors[1],
        lineWidth: 1.5,
        data: this.winds,
        vectorLength: 18,
        yOffset: -15,
        tooltip: {
          valueSuffix: ' mph'
        }
      }]
    };
  };

  /**
   * Post-process the chart from the callback function, the second argument
   * Highcharts.Chart.
   */
  Meteogram.prototype.onChartLoad = function (chart) {

    this.drawBlocksForWindArrows(chart);

  };

  /**
   * Create the chart. This function is called async when the data file is loaded
   * and parsed.
   */
  Meteogram.prototype.createChart = function () {
    this.chart = new Highcharts.Chart(this.getChartOptions(), chart => {
      this.onChartLoad(chart);
    });
  };

  Meteogram.prototype.error = function () {
    document.getElementById('loading').innerHTML =
      '<i class="fa fa-frown-o"></i> Failed loading data, please try again ' +
      'later';
  };

  /**
   * Handle the data. This part of the code is not Highcharts specific, but deals
   * with yr.no's specific data format
   */
  Meteogram.prototype.parseYrData = function () {
    // Loop over hourly (or 6-hourly) forecasts
    hourly.forEach((node, i) => {

      const x = new Date(node.startTime).getTime()

      // Populate the parallel arrays
      this.temperatures.push({
        x,
        y: node.values.temperature
      });

      this.humidity.push({
        x,
        y: node.values.humidity
      });

      if (i % 2 === 0) {
        this.winds.push({
          x,
          value: node.values.windSpeed,
          direction: node.values.windDirection
        });
      }

      this.pressures.push({
        x,
        y: node.values.pressureSeaLevel
      });
    });

    // Create the chart when the data is loaded
    this.createChart();
  };

  new Meteogram("hourly-chart")
}

function hideCharts() {
  document.getElementById("weather-charts").style.display = "none"
  document.getElementById("display-charts-button").className = "hiding-charts"
}

const stateMapping = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DE": "Delaware",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NV": "Nevada",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
};

const weatherMapping = {
  1000: {
    "description": "Clear",
    "iconName": "clear_day.svg"
  },
  1100: {
    "description": "Mostly Clear",
    "iconName": "mostly_clear_day.svg"
  },
  1101: {
    "description": "Partly Cloudy",
    "iconName": "partly_cloudy_day.svg"
  },
  1102: {
    "description": "Mostly Cloudy",
    "iconName": "mostly_cloudy.svg"
  },
  1001: {
    "description": "Cloudy",
    "iconName": "cloudy.svg"
  },
  2100: {
    "description": "Light Fog",
    "iconName": "fog_light.svg"
  },
  2000: {
    "description": "Fog",
    "iconName": "fog.svg"
  },
  4000: {
    "description": "Drizzle",
    "iconName": "drizzle.svg"
  },
  4200: {
    "description": "Light Rain",
    "iconName": "rain_light.svg"
  },
  4001: {
    "description": "Rain",
    "iconName": "rain.svg"
  },
  4201: {
    "description": "Heavy Rain",
    "iconName": "rain_heavy.svg"
  },
  5001: {
    "description": "Flurries",
    "iconName": "flurries.svg"
  },
  5100: {
    "description": "Light Snow",
    "iconName": "snow_light.svg"
  },
  5000: {
    "description": "Snow",
    "iconName": "snow.svg"
  },
  5101: {
    "description": "Heavy Snow",
    "iconName": "snow_heavy.svg"
  },
  6000: {
    "description": "Freezing Drizzle",
    "iconName": "freezing_drizzle.svg"
  },
  6200: {
    "description": "Light Freezing Drizzle",
    "iconName": "freezing_rain_light.svg"
  },
  6001: {
    "description": "Freezing Rain",
    "iconName": "freezing_rain.svg"
  },
  6201: {
    "description": "Heavy Freezing Rain",
    "iconName": "freezing_rain_heavy.svg"
  },
  7102: {
    "description": "Light Ice Pellets",
    "iconName": "ice_pellets_light.svg"
  },
  7000: {
    "description": "Ice Pellets",
    "iconName": "ice_pellets.svg"
  },
  7101: {
    "description": "Heavy Ice Pellets",
    "iconName": "ice_pellets_heavy.svg"
  },
  8000: {
    "description": "Thunderstorm",
    "iconName": "tstorm.svg"
  }
}
weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

precipitationMapping = {
  0: "N/A",
  1: "Rain",
  2: "Snow",
  3: "Freezing Rain",
  4: "Ice Pellets"
}