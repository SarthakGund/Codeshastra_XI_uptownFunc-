import requests

base_url = "http://127.0.0.1:5050/api"

def test_generate_barcode(text):
    url = f"{base_url}/generate-barcode"
    data = {"text": text}
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print("Barcode generated successfully.")
    else:
        print("Failed to generate barcode.")
    print("Barcode Response:")
    print(response.json())

def test_generate_qrcode(text):
    url = f"{base_url}/generate-qrcode"
    data = {"text": text}
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print("QR Code generated successfully.")
    else:
        print("Failed to generate QR Code.")
    print("QR Code Response:")
    print(response.json())


test_text = "https://github.com/"
test_generate_barcode(test_text)
test_generate_qrcode(test_text)