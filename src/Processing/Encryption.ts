import { TokenClient } from "../Sevices/Login/TokenClient";
import {v4 as uuidv4} from 'uuid';
import CryptoJS from 'crypto-js';

export class Encryptor {
    static async encryptPassword(password: string): Promise<[encryptedPassword: string, keyId: string]> {
        try {
            const { key, iv, keyId } = await this.generateAndSaveCredentials();
    
            // Encrypt the password
            const encryptedPassword = CryptoJS.AES.encrypt(password, CryptoJS.enc.Base64.parse(key), {
                iv: CryptoJS.enc.Base64.parse(iv), // Parse Base64 back into WordArray
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
    
            // Return ciphertext (Base64) and keyId
            return [
                encryptedPassword.ciphertext.toString(CryptoJS.enc.Base64),
                keyId
            ];
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async encryptEmail(email: string): Promise<[encryptedEmail: string, keyId: string]>{ 

        const {key, iv, keyId} = await this.generateAndSaveCredentials();

        const encryptedEmail = CryptoJS.AES.encrypt(email, CryptoJS.enc.Base64.parse(key), { 
            iv: CryptoJS.enc.Base64.parse(iv), 
            mode: CryptoJS.mode.CBC, 
            padding: CryptoJS.pad.Pkcs7
        }); 

        return [
          encryptedEmail.ciphertext.toString(CryptoJS.enc.Base64),
          keyId  
        ];
    }

    static async encryptCredentails(email: string, password: string): Promise<[encryptedPassword: string, encryptedEmail: string, keyId: string]>{ 
        const {key, iv, keyId} = await this.generateAndSaveCredentials();

        const encryptedEmail = CryptoJS.AES.encrypt(email, CryptoJS.enc.Base64.parse(key), { 
            iv: CryptoJS.enc.Base64.parse(iv), 
            mode: CryptoJS.mode.CBC, 
            padding: CryptoJS.pad.Pkcs7
        });

        const encryptedPassword = CryptoJS.AES.encrypt(password, CryptoJS.enc.Base64.parse(key), {
            iv: CryptoJS.enc.Base64.parse(iv), // Parse Base64 back into WordArray
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        return [
            encryptedPassword.ciphertext.toString(CryptoJS.enc.Base64),
            encryptedEmail.ciphertext.toString(CryptoJS.enc.Base64), 
            keyId
        ]
    }
    
    static async generateAndSaveCredentials() {
        const key = CryptoJS.lib.WordArray.random(32); // 32 bytes = 256 bits
        const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits
    
        const keyBase64 = CryptoJS.enc.Base64.stringify(key);
        const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
    
        const tokenClient = new TokenClient();
        const keyId = uuidv4();
    
        // Save credentials securely
        await tokenClient.postCredentials(keyBase64, ivBase64, keyId);
    
        return {
            key: keyBase64,
            iv: ivBase64,
            keyId: keyId
        };
    }
}