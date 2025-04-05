import os
import sys
import io
import base64
import qrcode
from qrcode.image.svg import SvgImage
from barcode import Code128
from barcode.writer import ImageWriter  # for PNG output

def generate_qr_code_png(text, output_path):
    """
    Generates a QR code image in PNG format.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)
    print(f"QR Code (PNG) saved to {output_path}")

def generate_qr_code_svg(text, output_path):
    """
    Generates a QR code image in SVG format.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
        image_factory=SvgImage
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image()
    img.save(output_path)
    print(f"QR Code (SVG) saved to {output_path}")

def generate_qr_code_base64(text):
    """
    Generates a QR code in PNG format and returns it as a base64-encoded string.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    img_bytes = buffer.getvalue()
    img_str = base64.b64encode(img_bytes).decode('utf-8')
    return img_str

def generate_barcode_png(text, output_path):
    """
    Generates a Code128 barcode image in PNG format.
    """
    barcode_obj = Code128(text, writer=ImageWriter())
    with open(output_path, 'wb') as f:
        barcode_obj.write(f)
    print(f"Barcode (PNG) saved to {output_path}")

def generate_barcode_svg(text, output_path):
    """
    Generates a Code128 barcode image in SVG format.
    By default, Code128 uses an SVG writer if no writer is provided.
    """
    barcode_obj = Code128(text)
    with open(output_path, 'wb') as f:  # changed mode from 'w' to 'wb'
        barcode_obj.write(f)
    print(f"Barcode (SVG) saved to {output_path}")

def generate_barcode_base64(text):
    """
    Generates a Code128 barcode in PNG format and returns it as a base64-encoded string.
    """
    barcode_obj = Code128(text, writer=ImageWriter())
    buffer = io.BytesIO()
    barcode_obj.write(buffer)
    img_bytes = buffer.getvalue()
    img_str = base64.b64encode(img_bytes).decode('utf-8')
    return img_str

def main():
    if len(sys.argv) < 2:
        print("Usage: python qrnbarcodegen.py <URL>")
        sys.exit(1)
    
    input_text = sys.argv[1]
    cwd = os.getcwd()
    
    # Define output file paths
    qr_png_path = os.path.join(cwd, "qr_code.png")
    qr_svg_path = os.path.join(cwd, "qr_code.svg")
    barcode_png_path = os.path.join(cwd, "barcode.png")
    barcode_svg_path = os.path.join(cwd, "barcode.svg")
    
    # Generate QR Code in PNG and SVG formats
    generate_qr_code_png(input_text, qr_png_path)
    generate_qr_code_svg(input_text, qr_svg_path)
    
    # Generate Barcode in PNG and SVG formats
    generate_barcode_png(input_text, barcode_png_path)
    generate_barcode_svg(input_text, barcode_svg_path)
    
    # Get base64-encoded barcode to return to a frontend
    barcode_b64 = generate_barcode_base64(input_text)
    print("\nBarcode (base64):")
    print(barcode_b64)
    
    # Get base64-encoded QR code to return to a frontend
    qr_b64 = generate_qr_code_base64(input_text)
    print("\nQR Code (base64):")
    print(qr_b64)

if __name__ == "__main__":
    main()