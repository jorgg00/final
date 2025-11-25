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

const visualizerBridge = window.audioVisualizerBridge;

if (!titleEl || !statusEl || !controlPanel || !visualizerBridge) {
    console.warn("Audio controls: faltan elementos necesarios en el DOM.");
} else {
    let currentIndex = 0;
    let loadedTrackSrc = null;
    let loadingPromise = null;

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
                return;
            }

            setStatus("Lista para reproducir");
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
        } catch (error) {
            setStatus(`Error al reproducir: ${error.message}`);
        }
    };

    const pauseTrack = async () => {
        try {
            await visualizerBridge.pause();
            setStatus("Pausada");
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

    loadTrack(currentIndex);
}

