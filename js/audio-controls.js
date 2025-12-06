const makeTrack = (title, baseName) => {
    const audioPath = `../audio/${baseName}.mp3`;
    const subtitlePath = `../audio/${baseName}.srt`;
    return {
        title,
        src: new URL(audioPath, import.meta.url).href,
        subtitle: new URL(subtitlePath, import.meta.url).href
    };
};

const tracks = [
    makeTrack("Crush", "crush"),
    makeTrack("Girlboss", "girlboss"),
    makeTrack("Sushi", "sushi"),
    makeTrack("What I Want", "whatiwant")
];

const titleEl = document.getElementById("trackTitle");
const statusEl = document.getElementById("trackStatus");
const controlPanel = document.querySelector(".audio-ui__controls");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeControl = document.getElementById("volumeControl");
const volumeValue = document.getElementById("volumeValue");

const visualizerBridge = window.audioVisualizerBridge;

if (!titleEl || !statusEl || !controlPanel || !visualizerBridge) {
    console.warn("Audio controls: faltan elementos necesarios en el DOM.");
} else {
    let currentIndex = 0;
    let loadedTrackSrc = null;
    let loadingPromise = null;
    let progressUpdateInterval = null;

    const formatTime = (seconds) => {
        if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const updateProgress = () => {
        if (!visualizerBridge.ready) return;
        
        const currentTime = visualizerBridge.getCurrentTime();
        const duration = visualizerBridge.getDuration();
        
        if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            progressFill.style.width = `${progress}%`;
            progressBar.setAttribute("aria-valuenow", progress);
            currentTimeEl.textContent = formatTime(currentTime);
            durationEl.textContent = formatTime(duration);
        } else {
            progressFill.style.width = "0%";
            currentTimeEl.textContent = "0:00";
            durationEl.textContent = "0:00";
        }
    };

    const startProgressUpdates = () => {
        if (progressUpdateInterval) return;
        progressUpdateInterval = setInterval(updateProgress, 100);
    };

    const stopProgressUpdates = () => {
        if (progressUpdateInterval) {
            clearInterval(progressUpdateInterval);
            progressUpdateInterval = null;
        }
    };

    const setStatus = (message) => {
        statusEl.textContent = message;
    };

    const updateTrackSource = async (track) => {
        if (track.src === loadedTrackSrc) {
            return;
        }

        if (loadingPromise) {
            await loadingPromise;
            if (track.src === loadedTrackSrc) {
                return;
            }
        }

        loadingPromise = visualizerBridge
            .setTrack({ src: track.src, title: track.title, subtitle: track.subtitle })
            .then(() => {
                loadedTrackSrc = track.src;
            })
            .finally(() => {
                loadingPromise = null;
            });

        await loadingPromise;
    };

    const loadTrack = async (index, { autoplay = false } = {}) => {
        currentIndex = (index + tracks.length) % tracks.length;
        const track = tracks[currentIndex];
        titleEl.textContent = track.title;
        setStatus("Analizando pista...");

        try {
            await updateTrackSource(track);

            if (autoplay) {
                await visualizerBridge.play();
                setStatus("Reproduciendo");
                startProgressUpdates();
                return;
            }

            setStatus("Lista para reproducir");
            updateProgress();
        } catch (error) {
            setStatus(`Error al cargar: ${error.message}`);
        }
    };

    const playTrack = async () => {
        try {
            setStatus("Analizando pista...");
            await updateTrackSource(tracks[currentIndex]);
            await visualizerBridge.play();
            setStatus("Reproduciendo");
            startProgressUpdates();
        } catch (error) {
            setStatus(`Error al reproducir: ${error.message}`);
        }
    };

    const pauseTrack = async () => {
        try {
            await visualizerBridge.pause();
            setStatus("Pausada");
            stopProgressUpdates();
        } catch (error) {
            setStatus(`Error al pausar: ${error.message}`);
        }
    };

    const handleAction = async (action) => {
        switch (action) {
            case "prev":
                await loadTrack(currentIndex - 1, { autoplay: true });
                break;
            case "next":
                await loadTrack(currentIndex + 1, { autoplay: true });
                break;
            case "play":
                await playTrack();
                break;
            case "pause":
                await pauseTrack();
                break;
            default:
                break;
        }
    };

    controlPanel.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) {
            return;
        }
        handleAction(button.dataset.action);
    });

    window.addEventListener("visualizer:track-ended", () => {
        loadTrack(currentIndex + 1, { autoplay: true });
    });

    // Inicializar volumen cuando el bridge esté listo
    const initVolume = () => {
        if (volumeControl && volumeValue && visualizerBridge.ready) {
            const volume = parseInt(volumeControl.value, 10);
            visualizerBridge.setVolume(volume);
        }
    };

    // Verificar periódicamente si el bridge está listo
    const checkBridgeReady = setInterval(() => {
        if (visualizerBridge.ready) {
            initVolume();
            clearInterval(checkBridgeReady);
        }
    }, 100);

    // Control de volumen
    if (volumeControl && volumeValue) {
        // Inicializar volumen al 100%
        const initialVolume = 100;
        volumeControl.value = initialVolume;
        volumeValue.textContent = `${initialVolume}%`;
        if (visualizerBridge.ready) {
            visualizerBridge.setVolume(initialVolume);
        }
        
        volumeControl.addEventListener("input", (e) => {
            const volume = parseInt(e.target.value, 10);
            volumeValue.textContent = `${volume}%`;
            if (visualizerBridge.ready) {
                visualizerBridge.setVolume(volume);
            }
        });
    }

    // Barra de progreso - click para saltar
    if (progressBar) {
        progressBar.addEventListener("click", (e) => {
            if (!visualizerBridge.ready) return;
            
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            const duration = visualizerBridge.getDuration();
            
            if (duration > 0) {
                const newTime = percentage * duration;
                visualizerBridge.setPosition(newTime);
                updateProgress();
            }
        });

        // Soporte para teclado (accesibilidad)
        progressBar.addEventListener("keydown", (e) => {
            if (!visualizerBridge.ready) return;
            
            const duration = visualizerBridge.getDuration();
            if (duration <= 0) return;
            
            let newTime = visualizerBridge.getCurrentTime();
            const step = 5; // 5 segundos
            
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                newTime = Math.max(0, newTime - step);
            } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                newTime = Math.min(duration, newTime + step);
            } else if (e.key === "Home") {
                newTime = 0;
            } else if (e.key === "End") {
                newTime = duration;
            } else {
                return;
            }
            
            e.preventDefault();
            visualizerBridge.setPosition(newTime);
            updateProgress();
        });
    }

    // Botón de regresar
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            // Pausar el audio si está reproduciéndose
            if (visualizerBridge.ready) {
                visualizerBridge.pause().catch(() => {});
            }
            stopProgressUpdates();
            
            // Regresar a la pantalla de bienvenida
            if (window.welcomeScreen && typeof window.welcomeScreen.goBack === 'function') {
                window.welcomeScreen.goBack();
            }
        });
    }

    loadTrack(currentIndex);
}

