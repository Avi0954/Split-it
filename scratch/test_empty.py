
import requests

url = "http://localhost:8000/groups/"
# Try empty body
response = requests.post(url)
print("Empty POST: ", response.status_code, response.text)

# Try JSON body
response = requests.post(url, json={"name": "JSON Group"})
print("JSON POST: ", response.status_code, response.text)
