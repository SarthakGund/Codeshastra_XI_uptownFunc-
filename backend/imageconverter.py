from PIL import Image
import os

input_file="./images/sunflower.jpg"

try: 
    with Image.open(input_file) as img:
        input_format = img.format
        output_format=['JPEG','PNG','GIF','BMP','TIFF','WEBP','PDF']
        print("Select the output image format required:")
        for i, format in enumerate(output_format):
            print(f"{i+1}.{format}")
        choice = int(input("Enter your choice for your desired output:"))
        if choice>=1 and choice<=len(output_format):
            output_format=output_format[choice-1]
            output_file=os.path.splitext(input_file)[0] + '.' + output_format.lower()
            img.save(output_file, output_format)
        else:
            print("Invalid choice. Please select a valid option.")
except IOError as e:
    print(f"Error opening image file: {e}")
