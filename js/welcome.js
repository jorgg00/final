/**
 * Módulo de pantalla de bienvenida
 * Maneja la transición desde la pantalla de bienvenida al reproductor
 */

class WelcomeScreen {
    constructor() {
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.startButton = document.getElementById('startButton');
        this.audioUI = document.querySelector('.audio-ui');
        this.isTransitioning = false;

        this.init();
    }

    init() {
        if (!this.welcomeScreen || !this.startButton || !this.audioUI) {
            console.warn('WelcomeScreen: faltan elementos necesarios en el DOM');
            return;
        }

        // Asegurar que el reproductor esté oculto inicialmente
        this.audioUI.classList.remove('visible');

        // Deshabilitar botón inicialmente
        this.startButton.disabled = true;

        // Event listener para el botón de iniciar
        this.startButton.addEventListener('click', () => this.startExperience());
        
        // También permitir iniciar con Enter
        this.startButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.startExperience();
            }
        });

        // Simular carga/preloader
        this.simulateLoading();
    }

    simulateLoading() {
        // Simular un tiempo mínimo de carga para la experiencia
        const minLoadTime = 1500; // 1.5 segundos
        const startTime = Date.now();

        // Verificar si los recursos están listos
        const checkResources = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minLoadTime - elapsed);

            setTimeout(() => {
                // Habilitar el botón después de la carga simulada
                this.startButton.disabled = false;
            }, remaining);
        };

        // Verificar si p5.js está cargado
        if (typeof p5 !== 'undefined') {
            checkResources();
        } else {
            window.addEventListener('load', checkResources);
        }
    }

    startExperience() {
        if (this.isTransitioning || this.startButton.disabled) return;
        
        this.isTransitioning = true;
        this.startButton.disabled = true;

        // Ocultar pantalla de bienvenida
        this.welcomeScreen.classList.add('hidden');

        // Mostrar reproductor después de un breve delay
        setTimeout(() => {
            this.audioUI.classList.add('visible');
            this.isTransitioning = false;

            // Enfocar el primer elemento interactivo del reproductor para accesibilidad
            const firstButton = this.audioUI.querySelector('button');
            if (firstButton) {
                firstButton.focus();
            }

            // Dispatch evento personalizado para notificar que la experiencia ha comenzado
            window.dispatchEvent(new CustomEvent('welcome:started'));
        }, 300);
    }

    // Método para regresar a la pantalla de bienvenida
    goBack() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;

        // Ocultar reproductor
        this.audioUI.classList.remove('visible');

        // Mostrar pantalla de bienvenida después de un breve delay
        setTimeout(() => {
            this.welcomeScreen.classList.remove('hidden');
            this.isTransitioning = false;

            // Re-habilitar el botón de iniciar
            this.startButton.disabled = false;

            // Enfocar el botón de iniciar para accesibilidad
            this.startButton.focus();

            // Dispatch evento personalizado para notificar que se regresó
            window.dispatchEvent(new CustomEvent('welcome:returned'));
        }, 300);
    }

    // Método para reiniciar la pantalla de bienvenida (útil para testing)
    reset() {
        this.welcomeScreen.classList.remove('hidden');
        this.audioUI.classList.remove('visible');
        this.isTransitioning = false;
        this.startButton.disabled = true;
        // Re-simular carga
        this.simulateLoading();
    }
}

// Inicializar cuando el DOM esté listo
let welcomeScreenInstance = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        welcomeScreenInstance = new WelcomeScreen();
        window.welcomeScreen = welcomeScreenInstance;
    });
} else {
    welcomeScreenInstance = new WelcomeScreen();
    window.welcomeScreen = welcomeScreenInstance;
}

