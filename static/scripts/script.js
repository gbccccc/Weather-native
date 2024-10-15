window.onload = init

const googleApiKey = "AIzaSyAG1FPkDpKn_pC2Kr9-hgNzodkHb9hyY8E"

let forecasts;

function init() {
  let stateSelection = document.getElementById("state")
  for (let stateAbbr in stateMapping) {
    let option = new Option(stateMapping[stateAbbr], stateAbbr)
    stateSelection.appendChild(option)
  }
}

function submitAddress() {
  let autoDetection = document.getElementById("auto-detect").checked
  if (autoDetection) {

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
      xhrGeocoding.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?address="
        + addressStr + "&key=" + googleApiKey)
      xhrGeocoding.onload = (event) => {
        let responseJson = JSON.parse(event.target.response)
        let location = responseJson.results[0].geometry.location
        let xhrTomorrow = new XMLHttpRequest();
        xhrTomorrow.open("GET", "/weather?lat=" + location.lat + "&lng=" + location.lng);
        xhrTomorrow.onload = (event) =>
          handleWeatherStats(event.target.response, responseJson.results[0].formatted_address)
        xhrTomorrow.send();
      }
      xhrGeocoding.send()
    }
  }
}

function handleWeatherStats(response, address) {
  document.getElementById("result-section").style.display = "none"
  let responseJson = JSON.parse(response)
  displayCurrentWeather(responseJson.current, address)
  displayForecastWeather(responseJson.forecast)
  document.getElementById("result-section").style.display = "block"
}

function displayCurrentWeather(currentWeather, address) {
  let weatherStats = currentWeather.data.timelines[0].intervals[0].values

  document.getElementById("card-address").innerText = address
  document.getElementById("card-weather-icon").setAttribute("src",
    "/static/images/weather-symbols/" + weatherMapping[weatherStats.weatherCode].iconName)
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

function displayForecastWeather(forecastWeather) {
  console.log(forecastWeather)
  forecasts = forecastWeather.data.timelines[0].intervals

  let resultTableBody = document.getElementById("result-table").children[0]
  let tableChildren = resultTableBody.children
  while (tableChildren.length > 1) {
    tableChildren[1].remove()
  }
  
  for (let forecast of forecasts) {
    let tableRow = document.createElement("tr")

    tableRow.setAttribute("class", "result-table-row")
    let tableData = document.createElement("td")
    tableData.innerText = forecast.startTime
    tableRow.appendChild(tableData)

    tableData = document.createElement("td")
    let statusIcon = document.createElement("img")
    statusIcon.setAttribute("class", "table-status-icon")
    statusIcon.setAttribute("src",
      "/static/images/weather-symbols/" + weatherMapping[forecast.values.weatherCode].iconName)
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