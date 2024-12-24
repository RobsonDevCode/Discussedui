import {useTokenClient } from "../Sevices/Login/TokenClient";
import {v4 as uuidv4} from 'uuid';
import CryptoJS from 'crypto-js';

export const useEncryptor = () => {
    const tokenClient = useTokenClient();
    const encryptPassword = async(password: string): Promise<[encryptedPassword: string, keyId: string]> => {
        try {
            const { key, iv, keyId } = await generateAndSaveCredentials();
    
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

   const encryptEmail = async(email: string): Promise<[encryptedEmail: string, keyId: string]> => { 

        const {key, iv, keyId} = await generateAndSaveCredentials();

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

    const encryptCredentails= async(email: string, password: string): Promise<[encryptedPassword: string, encryptedEmail: string, keyId: string]> => { 
        const {key, iv, keyId} = await generateAndSaveCredentials();

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
    
    const generateAndSaveCredentials = async() =>  {
        const key = CryptoJS.lib.WordArray.random(32); // 32 bytes = 256 bits
        const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits
    
        const keyBase64 = CryptoJS.enc.Base64.stringify(key);
        const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
        const keyId = uuidv4();
    
        // Save credentials securely
        await tokenClient.postCredentials(keyBase64, ivBase64, keyId);
    
        return {
            key: keyBase64,
            iv: ivBase64,
            keyId: keyId
        };
    }

    return{encryptPassword, 
           encryptCredentails, 
           encryptEmail
    }
}