const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

export interface QRCodeRequest {
  text: string;
}

export interface BarcodeRequest {
  text: string;
}

export interface ImageConversionRequest {
  image: File;
  format: string;
}

export async function generateQRCode(data: QRCodeRequest): Promise<string> {
  const response = await fetch(`${API_URL}/generate-qrcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate QR code');
  }
  
  const result = await response.json();
  return result.qr_code;
}

export async function generateBarcode(data: BarcodeRequest): Promise<string> {
  const response = await fetch(`${API_URL}/generate-barcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate barcode');
  }
  
  const result = await response.json();
  return result.barcode;
}

export async function convertImage(data: ImageConversionRequest): Promise<string> {
  const formData = new FormData();
  formData.append('image', data.image);
  formData.append('format', data.format);
  
  const response = await fetch(`${API_URL}/convert-image`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to convert image');
  }
  
  const result = await response.json();
  return result.converted_image;
}