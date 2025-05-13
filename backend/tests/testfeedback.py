import requests

def test_post_feedback(api_url):
    payload = {"feedback": "This is a test feedback."}
    response = requests.post(f"{api_url}/feedback", json=payload)
    print("POST /api/feedback")
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error parsing response:", e)

def test_get_feedback(api_url):
    response = requests.get(f"{api_url}/feedback")
    print("\nGET /api/feedback")
    print("Status Code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except Exception as e:
        print("Error parsing response:", e)

if __name__ == "__main__":
    # Adjust the base URL if your Flask API endpoint runs on a different host/port.
    api_url = "http://localhost:5050/api"
    
    test_post_feedback(api_url)
    test_get_feedback(api_url)