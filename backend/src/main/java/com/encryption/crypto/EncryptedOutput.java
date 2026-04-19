package com.encryption.crypto;

public class EncryptedOutput {
    
    private byte[] iv;
    private byte[] salt;
    private byte[] ciphertext;
    private byte[] gcmTag;

    public EncryptedOutput() {}

    public EncryptedOutput(byte[] iv, byte[] salt, byte[] ciphertext, byte[] gcmTag) {
        this.iv = iv;
        this.salt = salt;
        this.ciphertext = ciphertext;
        this.gcmTag = gcmTag;
    }

    // Legacy constructor for backward compatibility
    public EncryptedOutput(byte[] iv, byte[] ciphertext, byte[] gcmTag) {
        this.iv = iv;
        this.ciphertext = ciphertext;
        this.gcmTag = gcmTag;
    }

    public byte[] getIv() {
        return iv;
    }

    public void setIv(byte[] iv) {
        this.iv = iv;
    }

    public byte[] getSalt() {
        return salt;
    }

    public void setSalt(byte[] salt) {
        this.salt = salt;
    }

    public byte[] getCiphertext() {
        return ciphertext;
    }

    public void setCiphertext(byte[] ciphertext) {
        this.ciphertext = ciphertext;
    }

    public byte[] getGcmTag() {
        return gcmTag;
    }

    public void setGcmTag(byte[] gcmTag) {
        this.gcmTag = gcmTag;
    }

    /**
     * Combines IV + Salt + Ciphertext + GCM Tag into a single byte array for storage/transmission
     */
    public byte[] toByteArray() {
        byte[] result = new byte[iv.length + salt.length + ciphertext.length + gcmTag.length];
        int offset = 0;
        System.arraycopy(iv, 0, result, offset, iv.length);
        offset += iv.length;
        System.arraycopy(salt, 0, result, offset, salt.length);
        offset += salt.length;
        System.arraycopy(ciphertext, 0, result, offset, ciphertext.length);
        offset += ciphertext.length;
        System.arraycopy(gcmTag, 0, result, offset, gcmTag.length);
        return result;
    }
}
