export interface ValidationResult {
  isValid: boolean;
  message?: string;
  riskLevel: 'safe' | 'warning' | 'danger';
}

export function validateUrl(url: string): ValidationResult {
  if (!url) return { isValid: false, message: 'URL is required', riskLevel: 'warning' };
  
  try {
    const parsed = new URL(url);
    
    // Check for HTTP (not HTTPS)
    if (parsed.protocol === 'http:') {
      return { 
        isValid: true, 
        message: 'Warning: This site uses HTTP. Your connection is not encrypted.', 
        riskLevel: 'warning' 
      };
    }

    // Check for common suspicious TLDs (simplified list)
    const suspiciousTlds = ['.xyz', '.top', '.gq', '.tk', '.ml', '.cf'];
    if (suspiciousTlds.some(tld => parsed.hostname.endsWith(tld))) {
      return {
        isValid: true,
        message: 'Caution: This domain ending is frequently used by scammers.',
        riskLevel: 'warning'
      };
    }

    return { isValid: true, riskLevel: 'safe' };
  } catch {
    return { isValid: false, message: 'Invalid URL format', riskLevel: 'danger' };
  }
}

export function validateFileExtension(filename: string, expectedType: 'installer' | 'document' | 'media'): ValidationResult {
  if (!filename) return { isValid: false, message: 'Filename is required', riskLevel: 'warning' };

  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return { isValid: false, message: 'No file extension found', riskLevel: 'warning' };

  const dangerousExtensions = ['exe', 'msi', 'bat', 'cmd', 'ps1', 'vbs', 'js', 'jar'];
  const documentExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'md'];
  const mediaExtensions = ['jpg', 'png', 'mp4', 'mov', 'mp3', 'wav'];

  // Double extension check (e.g., document.pdf.exe)
  const parts = filename.split('.');
  if (parts.length > 2) {
    const secondLast = parts[parts.length - 2].toLowerCase();
    if (documentExtensions.includes(secondLast) && dangerousExtensions.includes(ext)) {
      return {
        isValid: true,
        message: 'DANGER: This looks like a double extension attack (e.g., file.pdf.exe). Do not open.',
        riskLevel: 'danger'
      };
    }
  }

  if (expectedType === 'document' && dangerousExtensions.includes(ext)) {
    return {
      isValid: true,
      message: `Warning: You expected a document but this is an executable program (.${ext}).`,
      riskLevel: 'danger'
    };
  }

  return { isValid: true, riskLevel: 'safe' };
}
