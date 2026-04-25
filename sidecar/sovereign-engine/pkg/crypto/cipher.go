package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"io"
)

/**
 * AMRIKYY LAB :: SOVEREIGN CIPHER (AES-256-GCM)
 * PURPOSE: Application-layer encryption to bypass transport-layer limitations (mTLS) on Vercel.
 */

// Encrypt wraps the plaintext with AES-256-GCM using the provided secret.
func Encrypt(plaintext []byte, secret string) (string, error) {
	// Key must be 32 bytes for AES-256
	key := make([]byte, 32)
	copy(key, []byte(secret))

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, plaintext, nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt unwraps the ciphertext with AES-256-GCM.
func Decrypt(cryptoText string, secret string) ([]byte, error) {
	key := make([]byte, 32)
	copy(key, []byte(secret))

	data, err := base64.StdEncoding.DecodeString(cryptoText)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, fmt.Errorf("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	return gcm.Open(nil, nonce, ciphertext, nil)
}
