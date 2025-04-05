from PIL import Image
import os
import base64
from io import BytesIO

def convert_image(image_data, output_format):
    """
    Convert image to the specified format and return base64 encoded string
    
    Args:
        image_data: The binary image data
        output_format: Target format (JPEG, PNG, GIF, BMP, TIFF, WEBP, PDF)
        
    Returns:
        Base64 encoded string of the converted image
    """
    try:
        with Image.open(BytesIO(image_data)) as img:
            output_buffer = BytesIO()
            img.save(output_buffer, format=output_format)
            output_buffer.seek(0)
            encoded_image = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
            return encoded_image
    except Exception as e:
        raise ValueError(f"Error converting image: {str(e)}")

# Original script functionality kept for backward compatibility
if __name__ == "__main__":
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
