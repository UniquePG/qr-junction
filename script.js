/**
 * Ultimate QR Code Generator
 * A modular, feature-rich QR code generator with multiple content types
 */

document.addEventListener('DOMContentLoaded', function () {
    // QR Code Generator Module
    const QRGenerator = (function () {
        // Private variables
        let qrious = null;

        // QR code data formatters
        const formatters = {
            url: (input) => input,
            text: (input) => input,
            instagram: (username) => `https://www.instagram.com/${username}`,
            facebook: (username) => `https://www.facebook.com/${username}`,
            whatsapp: (data) => {
                const number = data.number.replace(/\+/g, '').replace(/\s/g, '');
                return `https://wa.me/${number}${data.message ? `?text=${encodeURIComponent(data.message)}` : ''}`;
            },
            linkedin: (data) => {
                if (data.type === 'profile') {
                    return `https://www.linkedin.com/in/${data.username}`;
                } else {
                    return `https://www.linkedin.com/company/${data.username}`;
                }
            },
            telegram: (data) => {
                if (data.type === 'user') {
                    return `https://t.me/${data.username}`;
                } else if (data.type === 'group') {
                    return `https://t.me/joinchat/${data.username}`;
                } else if (data.type === 'channel') {
                    return `https://t.me/s/${data.username}`;
                }
            },
            snapchat: (username) => `https://www.snapchat.com/add/${username}`,
            twitter: (username) => `https://twitter.com/${username}`,
            contact: (data) => {
                let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
                if (data.name) vcard += `FN:${data.name}\n`;
                if (data.phone) vcard += `TEL:${data.phone}\n`;
                if (data.email) vcard += `EMAIL:${data.email}\n`;
                if (data.address) vcard += `ADR:;;${data.address};;;\n`;
                if (data.website) vcard += `URL:${data.website}\n`;
                vcard += 'END:VCARD';
                return vcard;
            },
            phone: (number) => `tel:${number}`,
            sms: (data) => `SMSTO:${data.number}:${data.message}`,
            email: (data) => {
                const { address, subject, body } = data;
                return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            },
            wifi: (data) => {
                const { ssid, password, encryption, hidden } = data;
                let wifiString = `WIFI:S:${ssid};T:${encryption};P:${password};`;
                if (hidden) wifiString += 'H:true;';
                return wifiString + ';';
            },
            image: (dataUrl) => createDownloadableDataUrl(dataUrl, 'image'),
            video: (dataUrl) => createDownloadableDataUrl(dataUrl, 'video'),
        };

        // Generate QR code
        function generateQRCode(type, data, options) {
            const qrData = formatters[type](data);
            const canvas = document.createElement('canvas');
            options.container.innerHTML = ''; // Clear previous QR code
            options.container.appendChild(canvas);

            qrious = new QRious({
                element: canvas,
                value: qrData,
                size: options.size,
                level: options.errorCorrection,
                background: '#ffffff',
                foreground: '#000000',
            });

            options.downloadButton.style.display = 'block';
        }

        // Utility function to create downloadable data URLs
        function createDownloadableDataUrl(dataUrl, type) {
            const mimeType = dataUrl.split(';')[0].split(':')[1];
            const extension = mimeType.split('/')[1];
            const fileName = `${type}_${Date.now()}.${extension}`;
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Downloading File...</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body>
                    <a id="download-link" href="${dataUrl}" download="${fileName}">Download File</a>
                    <script>
                        document.getElementById('download-link').click();
                    </script>
                </body>
                </html>
            `;
            return 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
        }

        // Public API
        return {
            generateQRCode,
        };
    })();

    // DOM Elements
    const qrcodeContainer = document.getElementById('qrcode');
    const errorMessage = document.getElementById('error-message');
    const downloadBtn = document.getElementById('download-btn');
    const generateBtn = document.getElementById('generate-btn');

    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            // Remove active class from all tabs and tab contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to the clicked tab
            this.classList.add('active');

            // Show the corresponding tab content
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Event Listeners
    generateBtn.addEventListener('click', function () {
        try {
            const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
            const size = parseInt(document.getElementById('qr-size').value);
            const errorCorrection = 'M'; // Default to Medium

            let data = {};
            switch (activeTab) {
                case 'url':
                    data = document.getElementById('url-input').value.trim();
                    if (!data) throw new Error('Please enter a URL');
                    break;
                case 'text':
                    data = document.getElementById('text-input').value.trim();
                    if (!data) throw new Error('Please enter some text');
                    break;
                case 'instagram':
                    data = document.getElementById('instagram-input').value.trim();
                    if (!data) throw new Error('Please enter an Instagram username');
                    break;
                case 'facebook':
                    data = document.getElementById('facebook-input').value.trim();
                    if (!data) throw new Error('Please enter a Facebook username or ID');
                    break;
                case 'whatsapp':
                    data = {
                        number: document.getElementById('whatsapp-number-input').value.trim(),
                        message: document.getElementById('whatsapp-message-input').value.trim(),
                    };
                    if (!data.number) throw new Error('Please enter a phone number');
                    break;
                case 'linkedin':
                    data = {
                        type: document.getElementById('linkedin-type-input').value,
                        username: document.getElementById('linkedin-input').value.trim(),
                    };
                    if (!data.username) throw new Error('Please enter a LinkedIn username or company ID');
                    break;
                case 'contact':
                    data = {
                        name: document.getElementById('name-input').value.trim(),
                        phone: document.getElementById('phone-contact-input').value.trim(),
                        email: document.getElementById('email-contact-input').value.trim(),
                        address: document.getElementById('address-input').value.trim(),
                        website: document.getElementById('website-input').value.trim(),
                    };
                    break;
                case 'phone':
                    data = document.getElementById('phone-input').value.trim();
                    if (!data) throw new Error('Please enter a phone number');
                    break;
                case 'sms':
                    data = {
                        number: document.getElementById('sms-number-input').value.trim(),
                        message: document.getElementById('sms-message-input').value.trim(),
                    };
                    if (!data.number) throw new Error('Please enter a phone number');
                    break;
                case 'email':
                    data = {
                        address: document.getElementById('email-address-input').value.trim(),
                        subject: document.getElementById('email-subject-input').value.trim(),
                        body: document.getElementById('email-body-input').value.trim(),
                    };
                    if (!data.address) throw new Error('Please enter an email address');
                    break;
                case 'wifi':
                    data = {
                        ssid: document.getElementById('ssid-input').value.trim(),
                        password: document.getElementById('wifi-password-input').value,
                        encryption: document.getElementById('encryption-input').value,
                        hidden: document.getElementById('hidden-ssid-input').checked,
                    };
                    if (!data.ssid) throw new Error('Please enter a network name (SSID)');
                    break;
                default:
                    throw new Error('Unsupported QR code type');
            }

            QRGenerator.generateQRCode(activeTab, data, {
                container: qrcodeContainer,
                size,
                errorCorrection,
                downloadButton: downloadBtn,
            });
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });

    downloadBtn.addEventListener('click', function () {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) {
            errorMessage.textContent = 'No QR code available to download.';
            return;
        }

        const imageData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `qrcode-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});