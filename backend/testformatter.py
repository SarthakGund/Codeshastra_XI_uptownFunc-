import requests

url = 'http://localhost:5050/api/excel-to-csv'
file_path = './files/downloads-data.xlsx' 

with open(file_path, 'rb') as f:
    files = {'file': (file_path, f, 'text/csv')}
    response = requests.post(url, files=files)

if response.status_code == 200:
    with open('./files/downloads-data.csv', 'wb') as f:
        f.write(response.content)
    print("File converted successfully")
else:
    print(f"Error: {response.text}")