let api = null;

/**
 * Initiates the device handshake verification for video briefing integration
 */
async function friendlyStart() {
    const gate = document.getElementById('er-friendly-gate');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        alert("PERMISSION_REQUIRED: Local environments require active camera/microphone device paths to authenticate link. Please try again.");
        return;
    }

    gate.style.opacity = '0';
    setTimeout(() => { gate.style.display = 'none'; }, 300);
    initJitsi();
}

/**
 * Configures and displays the secure external encrypted Jitsi meeting command module
 */
function initJitsi() {
    const domain = "8x8.vc";
    const options = {
        roomName: "vpaas-magic-cookie-3cdad222ce27409992f2b37f6b8d554e/Election_Runners_Command",
        parentNode: document.querySelector('#jaas-container'),
        width: "100%",
        height: "100%", // Controlled via video-wrapper aspect-ratio styles in style.css
        configOverwrite: {
            prejoinPageEnabled: false, 
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableThirdPartyRequests: true,
            disableDeepLinking: true,
            // Fluid responsive optimization rules for phone/tablet clients
            disableRemoteMute: false,
            disableProfile: true
        },
        interfaceConfigOverwrite: {
            SHOW_CHROME_EXTENSION_BANNER: false,
            DEFAULT_BACKGROUND: '#0B132B',
            MOBILE_APP_PROMO: false,
            CONNECTION_INDICATOR_DISABLED: true
        }
    };

    api = new JitsiMeetExternalAPI(domain, options);

    api.addEventListener('videoConferenceJoined', () => {
        const iframe = api.getIFrame();
        if (iframe) {
            iframe.setAttribute("allow", "camera *; microphone *; display-capture *; autoplay *; clipboard-write *; encrypted-media *");
        }
        const loading = document.getElementById('desktop-loading');
        if (loading) loading.style.display = 'none';
    });
}

/**
 * Main Web Event Handling & Setup Lifecycle
 */
document.addEventListener("DOMContentLoaded", function() {
    // 1. Mobile Adaptive Menu
    const mobileBtn = document.getElementById('mobile-btn');
    const navMenu = document.getElementById('nav-menu');
    if (mobileBtn) { 
        mobileBtn.onclick = () => navMenu.classList.toggle('active'); 
    }

    // 2. Comprehensive Fullscreen View Controller
    const fsBtn = document.getElementById('fullscreen-btn');
    const videoWrapper = document.getElementById('video-wrapper');
    if (fsBtn) {
        fsBtn.onclick = () => {
            if (!document.fullscreenElement) { videoWrapper.requestFullscreen(); }
            else { document.exitFullscreen(); }
        };
    }

    // 3. Adaptive Top Logo Scroll Animation
    window.onscroll = () => {
        const logo = document.getElementById('main-logo');
        if (logo) { logo.style.height = (window.scrollY > 80) ? '80px' : '160px'; }
    };

    // 4. Secure Web3Forms AJAX Data Ingestion Pipeline
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