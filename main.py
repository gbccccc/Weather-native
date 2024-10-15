import json
import requests

from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def root():
    return render_template("index.html")


@app.get("/hello")
def hello_world():
    return json.JSONEncoder().encode({"message": "hello world!"})


@app.get("/weather")
def weather():
    testing = True
    if testing:
        with open("current.json") as jsonFile:
            currentResult = json.load(jsonFile)
        with open("forecast.json") as jsonFile:
            forecastResult = json.load(jsonFile)
        return json.JSONEncoder().encode({"current": currentResult, "forecast": forecastResult})

    headers = {
        "accept": "application/json",
        "Accept-Encoding": "gzip"
    }

    url = "https://api.tomorrow.io/v4/timelines?location=" + request.args["lat"] + ", " + request.args["lng"] + \
          "&fields=temperature&fields=windSpeed&fields=humidity&fields=pressureSeaLevel&fields=uvIndex&fields" \
          "=weatherCode&fields=visibility&fields=cloudCover&fields=&units=imperial&timesteps=current&timezone=America" \
          "%2FLos_Angeles&apikey=0H4oNBZe7IJKfOGHp3AcaYRirN7aYsxS"
    response = requests.get(url, headers=headers)
    currentResult = json.JSONDecoder().decode(response.text)

    url = "https://api.tomorrow.io/v4/timelines?location=" + request.args["lat"] + ", " + request.args["lng"] + \
          "&fields=temperatureMin&fields=temperatureMax&fields=windSpeed&fields=humidity" \
          "&fields=weatherCode&fields=precipitationProbability&fields=precipitationType&fields" \
          "=sunriseTime&fields=sunsetTime&fields=visibility&units=imperial&timesteps" \
          "=1d&startTime=now&endTime=nowPlus5d&timezone=America%2FLos_Angeles&apikey" \
          "=0H4oNBZe7IJKfOGHp3AcaYRirN7aYsxS"
    response = requests.get(url, headers=headers)
    forecastResult = json.JSONDecoder().decode(response.text)

    return json.JSONEncoder().encode({"current": currentResult, "forecast": forecastResult})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
