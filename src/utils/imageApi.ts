const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL + '/api';

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
  try {
    const response = await fetch(`${API_ENDPOINT}/generate-qrcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
      mode: 'cors',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate QR code: ${response.status}`);
    }
    
    const result = await response.json();
    return result.qr_code;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

export async function generateBarcode(data: BarcodeRequest): Promise<string> {
  const response = await fetch(`${API_ENDPOINT}/generate-barcode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
    mode: 'cors',
    cache: 'no-cache',
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
  
  const response = await fetch(`${API_ENDPOINT}/convert-image`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    mode: 'cors',
    cache: 'no-cache',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to convert image');
  }
  
  const result = await response.json();
  return result.converted_image;
}