from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route("/")
def index():
    return jsonify([1,2,3])

if __name__ == '__main__':
    app.run()
