export interface JWTPayload {
  // Standard claims
  sub?: string; // username
  id?: string;  // user ID
  role?: string;
  exp: number; // expiration timestamp
  iss: string;
  aud: string;
  jti: string;
  
  // Microsoft-style claims
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'?: string;
  'IsAdmin'?: string;
  [key: string]: any; // Allow any additional claims
}

export class JWTUtils {
  static parseToken(token: string): JWTPayload | null {
    try {
      console.log('Parsing JWT token...');
      
      // JWT has 3 parts separated by dots: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Invalid JWT format - expected 3 parts, got:', parts.length);
        return null;
      }

      // Decode the payload (base64url)
      const payload = parts[1];
      console.log('Raw payload (base64):', payload);
      
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      console.log('Decoded payload (JSON string):', decodedPayload);
      
      const parsedPayload = JSON.parse(decodedPayload) as JWTPayload;
          console.log('Parsed JWT payload:', JSON.stringify(parsedPayload, null, 2));
    console.log('Available claims:', Object.keys(parsedPayload));
    console.log('User ID claim:', parsedPayload.id);
    console.log('Username claim:', parsedPayload.sub);
    console.log('Role claim:', parsedPayload.role);
      
      return parsedPayload;
    } catch (error) {
      console.log('JWT parsing error:', error);
      return null;
    }
  }

  static getUserIdFromToken(token: string): number | null {
    console.log('Extracting user ID from token...');
    const payload = this.parseToken(token);
    if (payload) {
      // Try different claim formats
      const userId = payload.id || 
                    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                    payload.sub;
      
      if (userId) {
              console.log('Found user ID in payload:', userId);
      const parsedUserId = parseInt(userId, 10);
      console.log('Parsed user ID as number:', parsedUserId);
        return isNaN(parsedUserId) ? null : parsedUserId;
      }
    }
    console.log('No user ID found in token payload');
    return null;
  }

  static getUsernameFromToken(token: string): string | null {
    console.log('Extracting username from token...');
    const payload = this.parseToken(token);
    if (payload) {
      // Try different claim formats
      const username = payload.sub || 
                      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
                      payload.username;
      
      if (username) {
        console.log('Found username in payload:', username);
        return username;
      }
    }
    console.log('No username found in token payload');
    return null;
  }

  static getEmailFromToken(token: string): string | null {
    console.log('Extracting email from token...');
    const payload = this.parseToken(token);
    if (payload) {
      // Try different claim formats
      const email = payload.email || 
                   payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
      
      if (email) {
        console.log('Found email in payload:', email);
        return email;
      }
    }
    console.log('No email found in token payload');
    return null;
  }

  static isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }
} 