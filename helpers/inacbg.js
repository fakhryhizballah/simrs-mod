const crypto = require("crypto");
const axios = require("axios");

class IncBG {
    getKey() {
        return process.env["INCBG.keyRS"];
    }

    getUrlWS() {
        return process.env["INCBG.UrlWS"];
    }

    async Request(request) {
        const json = this.mc_encrypt(request, this.getKey());

        const res = await axios.post(
            this.getUrlWS(),
            json,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const data = res.data;

        // Sama seperti PHP
        const first = data.indexOf("\n") + 1;
        const last = data.lastIndexOf("\n") - 1;

        const hasilresponse = data.substring(first, data.length - first - last);

        const decrypted = this.mc_decrypt(hasilresponse, this.getKey());

        return JSON.parse(decrypted);
    }

    mc_encrypt(data, strkey) {
        const key = Buffer.from(strkey, "hex");
        if (key.length !== 32) {
            throw new Error("Needs a 256-bit key!");
        }

        const iv = crypto.randomBytes(16); // AES-256-CBC IV = 16 bytes
        const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
        const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);

        const signature = crypto
            .createHmac("sha256", key)
            .update(encrypted)
            .digest()
            .subarray(0, 10);

        const finalBuffer = Buffer.concat([signature, iv, encrypted]);
        const encoded = Buffer.from(finalBuffer).toString("base64");

        return encoded + "\n"; // mirip chunk_split PHP
    }

    mc_decrypt(str, strkey) {
        const key = Buffer.from(strkey, "hex");
        if (key.length !== 32) {
            throw new Error("Needs a 256-bit key!");
        }

        const decoded = Buffer.from(str, "base64");

        const signature = decoded.subarray(0, 10);
        const iv = decoded.subarray(10, 26); // 10 sampai 25 → 16 bytes
        const encrypted = decoded.subarray(26);

        const calc_signature = crypto
            .createHmac("sha256", key)
            .update(encrypted)
            .digest()
            .subarray(0, 10);

        if (!this.mc_compare(signature, calc_signature)) {
            return "SIGNATURE_NOT_MATCH";
        }

        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

        return decrypted.toString();
    }

    mc_compare(a, b) {
        if (a.length !== b.length) return false;

        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result === 0;
    }
}

module.exports = new IncBG();
