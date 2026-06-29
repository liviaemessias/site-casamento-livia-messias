(function () {
  function removeAccents(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function formatPixField(id, value) {
    const stringValue = String(value || "");

    return id + stringValue.length.toString().padStart(2, "0") + stringValue;
  }

  function crc16(payload) {
    let crc = 0xffff;

    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;

      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;

        crc &= 0xffff;
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function generatePayload(settings, gift) {
    const pixKey = settings.pix_key;

    const merchantName = removeAccents(settings.merchant_name)
      .toUpperCase()
      .slice(0, 25);

    const merchantCity = removeAccents(settings.merchant_city)
      .toUpperCase()
      .slice(0, 15);

    const amount = Number(gift.price || 0).toFixed(2);
    const shortGiftId = gift.id.replace(/-/g, "").substring(0, 10).toUpperCase();
    const txid = `GIFT${shortGiftId}`;
    const description = removeAccents(`Presente ${gift.name}`).slice(0, 60);

    const merchantAccountInfo =
      formatPixField("00", "BR.GOV.BCB.PIX") +
      formatPixField("01", pixKey) +
      formatPixField("02", description);

    const additionalData = formatPixField("05", txid);

    const payloadWithoutCRC =
      formatPixField("00", "01") +
      formatPixField("26", merchantAccountInfo) +
      formatPixField("52", "0000") +
      formatPixField("53", "986") +
      formatPixField("54", amount) +
      formatPixField("58", "BR") +
      formatPixField("59", merchantName) +
      formatPixField("60", merchantCity) +
      formatPixField("62", additionalData) +
      "6304";

    return payloadWithoutCRC + crc16(payloadWithoutCRC);
  }

  function getQrCodeUrl(payload, size = 260) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(payload)}`;
  }

  window.PixPayment = {
    generatePayload,
    getQrCodeUrl,
  };
})();
