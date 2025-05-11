import requests
import os

def test_post_feedback(api_url):
    payload = {"feedback": "This is a test feedback."}
    response = requests.post(f"{api_url}/api/feedback", json=payload)
    print("POST /api/feedback")
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error parsing response:", e)

def test_get_feedback(api_url):
    response = requests.get(f"{api_url}/api/feedback")
    print("\nGET /api/feedback")
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error parsing response:", e)

if __name__ == "__main__":
    # Use environment variable or default to local development
    api_url = os.environ.get("API_URL", "http://localhost:5050")
    
    test_post_feedback(api_url)
    test_get_feedback(api_url)