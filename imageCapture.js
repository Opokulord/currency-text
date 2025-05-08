// === Upload Image for OCR ===
function captureCurrency() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) recognizeCurrencyText(file);
    };
    input.click();
}

// === Live Camera View with Capture and Cancel ===
function captureFromCamera() {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const overlay = document.createElement('div');
    const gridOverlay = document.createElement('div');
    const focusIndicator = document.createElement('div');
    const settingsMenu = document.createElement('div');
    const stabilizerIndicator = document.createElement('div');

    const captureBtn = document.createElement('button');
    const cancelBtn = document.createElement('button');
    const switchCameraBtn = document.createElement('button');
    const flashBtn = document.createElement('button');
    const zoomControls = document.createElement('div');
    const loadingIndicator = document.createElement('div');
    const settingsBtn = document.createElement('button');
    const gridBtn = document.createElement('button');
    const focusBtn = document.createElement('button');
    const stabilizerBtn = document.createElement('button');

    // Grid overlay
    gridOverlay.style = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: none;
    `;
    gridOverlay.innerHTML = `
        <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(to right, transparent 33.33%, rgba(255,255,255,0.2) 33.33%, rgba(255,255,255,0.2) 66.66%, transparent 66.66%),
                linear-gradient(to bottom, transparent 33.33%, rgba(255,255,255,0.2) 33.33%, rgba(255,255,255,0.2) 66.66%, transparent 66.66%);
        "></div>
    `;

    // Focus indicator
    focusIndicator.style = `
        position: absolute;
        width: 60px;
        height: 60px;
        border: 2px solid #fff;
        border-radius: 50%;
        display: none;
        pointer-events: none;
        animation: focusPulse 1s infinite;
    `;

    // Settings menu
    settingsMenu.style = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        border-radius: 10px;
        padding: 15px;
        display: none;
        z-index: 1000;
    `;

    // Stabilizer indicator
    stabilizerIndicator.style = `
        position: absolute;
        top: 20px;
        left: 20px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        display: none;
    `;
    stabilizerIndicator.textContent = '📷 Stabilizing...';

    // Loading indicator
    loadingIndicator.innerHTML = `
        <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        ">
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 10px;
            "></div>
            <p>Initializing camera...</p>
        </div>
    `;
    loadingIndicator.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    document.body.appendChild(loadingIndicator);

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes focusPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    overlay.style = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); display: flex;
        flex-direction: column; justify-content: center;
        align-items: center; z-index: 9999;
    `;

    video.autoplay = true;
    video.style = `
        max-width: 90%; border-radius: 10px;
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        position: relative;
    `;
    overlay.appendChild(video);
    overlay.appendChild(gridOverlay);
    overlay.appendChild(focusIndicator);
    overlay.appendChild(settingsMenu);
    overlay.appendChild(stabilizerIndicator);

    // Camera controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        align-items: center;
    `;

    // Zoom controls
    zoomControls.style = `
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
    `;
    const zoomInBtn = document.createElement('button');
    const zoomOutBtn = document.createElement('button');
    zoomInBtn.textContent = '🔍+';
    zoomOutBtn.textContent = '🔍-';
    [zoomInBtn, zoomOutBtn].forEach(btn => {
        btn.style = `
            padding: 8px 16px;
            font-size: 16px;
            border: none;
            border-radius: 8px;
            background-color: #6c757d;
            color: white;
            cursor: pointer;
        `;
        btn.setAttribute('aria-label', btn.textContent === '🔍+' ? 'Zoom in' : 'Zoom out');
    });
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomInBtn);

    // Settings button
    settingsBtn.textContent = '⚙️ Settings';
    settingsBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        background-color: #6c757d;
        color: white;
        cursor: pointer;
    `;
    settingsBtn.setAttribute('aria-label', 'Camera settings');

    // Grid button
    gridBtn.textContent = '📏 Grid';
    gridBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        background-color: #6c757d;
        color: white;
        cursor: pointer;
    `;
    gridBtn.setAttribute('aria-label', 'Toggle grid overlay');

    // Focus button
    focusBtn.textContent = '🎯 Focus';
    focusBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        background-color: #6c757d;
        color: white;
        cursor: pointer;
    `;
    focusBtn.setAttribute('aria-label', 'Toggle auto focus');

    // Stabilizer button
    stabilizerBtn.textContent = '📷 Stabilizer';
    stabilizerBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        background-color: #6c757d;
        color: white;
        cursor: pointer;
    `;
    stabilizerBtn.setAttribute('aria-label', 'Toggle image stabilization');

    captureBtn.textContent = '📸 Capture';
    captureBtn.style = `
        padding: 12px 24px;
        font-size: 18px; font-weight: bold;
        border: none; border-radius: 10px;
        background-color: #28a745; color: white;
        cursor: pointer; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    `;
    captureBtn.setAttribute('aria-label', 'Capture photo');

    switchCameraBtn.textContent = '🔄 Switch Camera';
    switchCameraBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none; border-radius: 8px;
        background-color: #007bff;
        color: white; cursor: pointer;
    `;
    switchCameraBtn.setAttribute('aria-label', 'Switch between front and back camera');

    flashBtn.textContent = '⚡ Flash';
    flashBtn.style = `
        padding: 10px 20px;
        font-size: 16px;
        border: none; border-radius: 8px;
        background-color: #ffc107;
        color: black; cursor: pointer;
    `;
    flashBtn.setAttribute('aria-label', 'Toggle flash');

    cancelBtn.textContent = '✖ Cancel';
    cancelBtn.style = `
        padding: 10px 20px;
        font-size: 16px; background-color: #dc3545;
        color: white; border: none; border-radius: 8px;
        cursor: pointer;
    `;
    cancelBtn.setAttribute('aria-label', 'Close camera');

    controlsContainer.appendChild(zoomControls);
    controlsContainer.appendChild(captureBtn);
    controlsContainer.appendChild(switchCameraBtn);
    controlsContainer.appendChild(flashBtn);
    controlsContainer.appendChild(settingsBtn);
    controlsContainer.appendChild(gridBtn);
    controlsContainer.appendChild(focusBtn);
    controlsContainer.appendChild(stabilizerBtn);
    controlsContainer.appendChild(cancelBtn);
    overlay.appendChild(controlsContainer);
    document.body.appendChild(overlay);

    let currentFacingMode = 'environment'; // Start with back camera
    let stream = null;
    let currentZoom = 1;
    let isFlashOn = false;
    let isGridOn = false;
    let isAutoFocusOn = true;
    let isStabilizerOn = false;
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    // Check if device is mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    async function startCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: currentFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    zoom: currentZoom
                }
            };

            // Add torch/flash support for mobile devices
            if (isMobile) {
                constraints.video.torch = isFlashOn;
            }

            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            loadingIndicator.remove();

            // Start image stabilization if enabled
            if (isStabilizerOn) {
                startImageStabilization();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
            document.body.removeChild(overlay);
            loadingIndicator.remove();
        }
    }

    // Start with back camera
    startCamera();

    // Settings menu toggle
    settingsBtn.onclick = () => {
        settingsMenu.style.display = settingsMenu.style.display === 'none' ? 'block' : 'none';
    };

    // Grid toggle
    gridBtn.onclick = () => {
        isGridOn = !isGridOn;
        gridOverlay.style.display = isGridOn ? 'block' : 'none';
        gridBtn.style.backgroundColor = isGridOn ? '#28a745' : '#6c757d';
    };

    // Focus toggle
    focusBtn.onclick = () => {
        isAutoFocusOn = !isAutoFocusOn;
        focusBtn.style.backgroundColor = isAutoFocusOn ? '#28a745' : '#6c757d';
    };

    // Stabilizer toggle
    stabilizerBtn.onclick = () => {
        isStabilizerOn = !isStabilizerOn;
        stabilizerBtn.style.backgroundColor = isStabilizerOn ? '#28a745' : '#6c757d';
        if (isStabilizerOn) {
            startImageStabilization();
        } else {
            stabilizerIndicator.style.display = 'none';
        }
    };

    // Image stabilization
    function startImageStabilization() {
        stabilizerIndicator.style.display = 'block';
        setTimeout(() => {
            stabilizerIndicator.style.display = 'none';
        }, 2000);
    }

    // Tap to focus
    video.addEventListener('click', (e) => {
        if (!isAutoFocusOn) return;
        
        const rect = video.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        focusIndicator.style.left = `${x - 30}px`;
        focusIndicator.style.top = `${y - 30}px`;
        focusIndicator.style.display = 'block';
        
        setTimeout(() => {
            focusIndicator.style.display = 'none';
        }, 1000);
    });

    switchCameraBtn.onclick = () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        startCamera();
    };

    flashBtn.onclick = async () => {
        if (isMobile) {
            isFlashOn = !isFlashOn;
            flashBtn.style.backgroundColor = isFlashOn ? '#28a745' : '#ffc107';
            flashBtn.textContent = isFlashOn ? '⚡ Flash On' : '⚡ Flash Off';
            startCamera();
        } else {
            alert('Flash is only available on mobile devices');
        }
    };

    zoomInBtn.onclick = () => {
        if (currentZoom < 4) {
            currentZoom += 0.5;
            startCamera();
        }
    };

    zoomOutBtn.onclick = () => {
        if (currentZoom > 1) {
            currentZoom -= 0.5;
            startCamera();
        }
    };

    captureBtn.onclick = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        document.body.removeChild(overlay);

        canvas.toBlob(blob => recognizeCurrencyText(blob));
    };

    cancelBtn.onclick = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        document.body.removeChild(overlay);
        loadingIndicator.remove();
    };

    // Keyboard accessibility
    overlay.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'Escape':
                cancelBtn.click();
                break;
            case 'Enter':
                captureBtn.click();
                break;
            case 'f':
                flashBtn.click();
                break;
            case 'g':
                gridBtn.click();
                break;
            case 's':
                settingsBtn.click();
                break;
            case '+':
                zoomInBtn.click();
                break;
            case '-':
                zoomOutBtn.click();
                break;
        }
    });
}

// === OCR Processing with Enhanced Currency Extraction ===
function recognizeCurrencyText(imageBlob) {
    const resultElement = document.getElementById('result');
    resultElement.innerHTML = '<span class="loading-spinner"></span> Processing...';

    Tesseract.recognize(imageBlob, 'eng')
        .then(({ data: { text } }) => {
            console.log("Recognized text:", text);
            const result = extractCurrencyAmount(text);

            if (result) {
                document.getElementById('amount').value = result.amount;
                resultElement.innerHTML = `Recognized: ${result.currency || ''} ${result.amount}`;

                // Set the source currency if detected
                if (result.currency) {
                    const fromSelect = document.getElementById('fromCurrency');
                    for (let option of fromSelect.options) {
                        if (option.value.toUpperCase() === result.currency.toUpperCase()) {
                            fromSelect.value = option.value;
                            break;
                        }
                    }
                }
                
                // Set the target currency if detected
                if (result.targetCurrency) {
                    const toSelect = document.getElementById('toCurrency');
                    for (let option of toSelect.options) {
                        if (option.value.toUpperCase() === result.targetCurrency.toUpperCase()) {
                            toSelect.value = option.value;
                            break;
                        }
                    }
                    
                    // Trigger the conversion automatically
                    document.getElementById('convertButton').click();
                }
            } else {
                resultElement.innerHTML = 'No recognizable currency amount found.';
            }
        })
        .catch(error => {
            resultElement.innerHTML = 'Error recognizing text.';
            console.error(error);
        });
}

// === Enhanced Function to Extract Amount and Currency from Text ===
function extractCurrencyAmount(text) {
    // Basic pattern to match simple currency amounts
    const basicRegex = /(GHS|USD|EUR|GBP|NGN|CAD|AUD|CHF|JPY|CNY|ZAR|INR|₵|\$|€|£)?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/i;
    
    // Advanced pattern to match phrases like "convert 100$ to cedis"
    const advancedRegex = /(?:convert\s+)?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)(?:\s*)([$€£₵]|USD|EUR|GBP|GHS|NGN|CAD|AUD|CHF|JPY|CNY|ZAR|INR|cedis|dollars|euros|pounds)/i;
    
    // Pattern to capture "to [currency]" phrases
    const toRegex = /to\s+([a-zA-Z]+)/i;

    // First try the advanced pattern for complex phrases
    let match = text.match(advancedRegex);
    let toMatch = text.match(toRegex);
    
    // If advanced pattern fails, try the basic pattern
    if (!match) {
        match = text.match(basicRegex);
    }

    if (match) {
        // Handle amount
        let amount = match[1] ? match[1].replace(/,/g, '') : match[2].replace(/,/g, '');
        
        // Handle currency
        let currencySymbol = match[1] && match[1].length === 1 ? match[1] : 
                            (match[2] && match[2].length === 1 ? match[2] : null);
        
        let currencyCode = currencySymbol ? null : 
                          (match[1] && match[1].length > 1 ? match[1] : 
                          (match[2] && match[2].length > 1 ? match[2] : null));
        
        // Map common symbols to currency codes
        const symbolToCurrency = {
            '$': 'USD',
            '₵': 'GHS',
            '€': 'EUR',
            '£': 'GBP'
        };
        
        // Determine the currency
        let currency = null;
        if (currencySymbol && symbolToCurrency[currencySymbol]) {
            currency = symbolToCurrency[currencySymbol];
        } else if (currencyCode) {
            // Handle currency names
            const currencyNames = {
                'CEDIS': 'GHS',
                'DOLLARS': 'USD',
                'EUROS': 'EUR',
                'POUNDS': 'GBP',
                'NAIRA': 'NGN'
            };
            
            currencyCode = currencyCode.toUpperCase();
            currency = currencyNames[currencyCode] || currencyCode;
        }
        
        // Extract target currency from "to [currency]" phrase
        let targetCurrency = null;
        if (toMatch) {
            const targetText = toMatch[1].toUpperCase();
            const targetMap = {
                'CEDIS': 'GHS',
                'DOLLARS': 'USD',
                'EUROS': 'EUR',
                'POUNDS': 'GBP',
                'NAIRA': 'NGN'
            };
            targetCurrency = targetMap[targetText] || targetText;
        }
        
        return { amount, currency, targetCurrency };
    }
    
    return null;
}

// === Unified Capture Option Menu ===
function openCaptureOptions() {
    const menu = document.createElement('div');
    menu.style = `
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white; border-radius: 10px;
        padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000; display: flex;
        flex-direction: column; gap: 10px; align-items: center;
    `;

    const uploadBtn = document.createElement('button');
    uploadBtn.innerText = '📁 Upload Image';
    uploadBtn.onclick = () => {
        document.body.removeChild(menu);
        captureCurrency();
    };

    const cameraBtn = document.createElement('button');
    cameraBtn.innerText = '📷 Capture From Camera';
    cameraBtn.onclick = () => {
        document.body.removeChild(menu);
        captureFromCamera();
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = '✖ Cancel';
    cancelBtn.style = 'background: #ccc;';
    cancelBtn.onclick = () => {
        document.body.removeChild(menu);
    };

    [uploadBtn, cameraBtn, cancelBtn].forEach(btn => {
        btn.style = `
            padding: 10px 20px; border: none;
            border-radius: 5px; font-size: 16px;
            cursor: pointer;
        `;
    });

    menu.appendChild(uploadBtn);
    menu.appendChild(cameraBtn);
    menu.appendChild(cancelBtn);
    document.body.appendChild(menu);
}
