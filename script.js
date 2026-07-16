let apiInstance = null;

/**
 * Bypasses the gateway gate, requests hardware permissions and updates layout states
 */
async function friendlyStart() {
    const gateElement = document.getElementById("er-friendly-gate");
    const loaderElement = document.getElementById("desktop-loading");
    const containerElement = document.getElementById("jaas-container");
    const fullscreenBtn = document.getElementById("fullscreen-btn");

    // Hide the primary gate and show the loading visual
    gateElement.classList.add("hidden");
    loaderElement.classList.remove("hidden");

    // Prompt user for local hardware interface streams
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach(track => track.stop()); // Release devices immediately after access verification
    } catch (err) {
        alert("PERMISSION_REQUIRED: Active microphone/camera system streams are required to bridge into the secure briefing. Please grant access and try again.");
        loaderElement.classList.add("hidden");
        gateElement.classList.remove("hidden");
        return;
    }

    // Build the container frame
    setTimeout(() => {
        loaderElement.classList.add("hidden");
        containerElement.classList.remove("hidden");
        if (fullscreenBtn) fullscreenBtn.classList.remove("hidden");

        initializeMeeting();
    }, 1200);
}

/**
 * Initializes the encrypted Jitsi room iframe directly within the container wrapper
 */
function initializeMeeting() {
    const domain = "8x8.vc"; 
    const options = {
        roomName: "vpaas-magic-cookie-3cdad222ce27409992f2b37f6b8d554e/Election_Runners_Command",
        parentNode: document.querySelector('#jaas-container'),
        width: "100%",
        height: "100%",
        configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableThirdPartyRequests: true,
            disableDeepLinking: true
        },
        interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false, // Prevents annoying mobile store app overlay redirects
            SHOW_CHROME_EXTENSION_BANNER: false
        }
    };
    
    apiInstance = new JitsiMeetExternalAPI(domain, options);
}

/**
 * Toggles responsive fullscreen display modes for Jitsi wrapper elements
 */
function toggleFullscreen() {
    const wrapper = document.getElementById("video-wrapper");
    if (!document.fullscreenElement) {
        wrapper.requestFullscreen().catch(err => {
            console.error(`Fullscreen request failed: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

/**
 * General Web Event Onload Lifecycle Handler
 */
document.addEventListener("DOMContentLoaded", function() {
    // 1. Mobile Adaptive Menu
    const mobileBtn = document.getElementById('mobile-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileBtn) { 
        mobileBtn.onclick = () => navMenu.classList.toggle('active'); 
    }

    // 2. Adaptive Top Logo Scroll Animation
    window.onscroll = () => {
        const logo = document.getElementById('main-logo');
        if (logo) { logo.style.height = (window.scrollY > 80) ? '80px' : '160px'; }
    };

    // 3. Web3Forms AJAX Submission Configuration
    const form = document.getElementById('er-contact-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form && submitBtn) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = 'Sending Request... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Handshake Complete: Your localized staffing request has been securely dispatched to the alliance.");
                    form.reset();
                } else {
                    alert("Inbound Error: " + data.message);
                }
            } catch (error) {
                alert("Connection Interrupted: Critical network breakdown. Please verify link status and retry.");
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});