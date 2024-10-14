import datetime
import json
import os

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
    print(request.args["lat"])
    print(request.args["lng"])
    return json.JSONEncoder().encode({"message": "received"})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
