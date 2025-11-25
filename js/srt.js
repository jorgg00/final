// @credits: https://github.com/fuermosi777/srtjs/blob/master/dist/built.js

export default class Srt {
    constructor(_string = "") {
        this.srtContent = _string
        this.lines = []
        this.parse()
    }

    parse() {
        // Normalizar line breaks: reemplazar \r\n con \n y luego dividir por bloques vacíos
        let normalized = this.srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        let blocks = normalized.split(/\n\n+/);
        
        for (let i = 0; i < blocks.length; i++) {
            let block = blocks[i].trim();
            if (!block) continue;
            
            let lines = block.split('\n');
            if (lines.length < 3) continue;
            
            // counter (primera línea)
            let counter = lines[0].trim();
            
            // time (segunda línea)
            let timeLine = lines[1].trim();
            let timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/);
            
            if (!timeMatch) continue;
            
            // Normalizar comas/puntos en los tiempos
            let startText = timeMatch[1].replace('.', ',');
            let endText = timeMatch[2].replace('.', ',');
            
            let startDate = this.stringToDate(startText);
            let endDate = this.stringToDate(endText);
            
            // subtitle (resto de líneas)
            let subtitle = '';
            for (let j = 2; j < lines.length; j++) {
                if (lines[j].trim()) {
                    subtitle += (subtitle ? '\n' : '') + lines[j].trim();
                }
            }
            
            if (subtitle) {
                // push to list
                this.lines.push({
                    counter: counter,
                    subtitle: subtitle,
                    start: this.dateToObject(startDate),
                    end: this.dateToObject(endDate)
                });
            }
        }
    }

    shift(delta, unit) {
        let time, get;
        switch (unit) {
            case 'hours': {
                time = 1000 * 60 * 60;

                break;
            }
            case 'minutes': {
                time = 1000 * 60;
                break;
            }
            case 'seconds': {
                time = 1000;
                break;
            }
            case 'milliseconds': {
                time = 1;
                break;
            }
        }
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            let newStartTime = new Date(line.start.time.getTime() + delta * time);
            let newEndTime = new Date(line.end.time.getTime() + delta * time);
            this.updateLineTime(i, newStartTime, newEndTime);
        }
        // update content
        this.updateSrtContent();
    }

    updateLineTime(n, newStartTime, newEndTime) {
        let line = this.lines[n];
        this.lines[n] = {
            counter: line.counter,
            subtitle: line.subtitle,
            start: this.dateToObject(newStartTime),
            end: this.dateToObject(newEndTime)
        }
    }

    updateSrtContent() {
        let srt = '';
        for (let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i];
            srt += line.counter + '\n' +
                line.start.text + ' --> ' + line.end.text + '\n' +
                line.subtitle + '\n\r\n';
        };
        this.srtContent = srt;
    }

    getSrtContent() {
        return this.srtContent;
    }
    // helper functions
    // not main methods
    // used to make everything simple
    stringToDate(string) {
        // turn string format like "00:12:42,321" to date
        let firstColonIndex = string.indexOf(':');
        let secondColonIndex = this.nthChar(string, ':', 2);
        let commaIndex = string.indexOf(',');
        let hour = string.substring(0, firstColonIndex);
        let minute = string.substring(firstColonIndex + 1, secondColonIndex);
        let second = string.substring(secondColonIndex + 1, commaIndex);
        let msecond = string.substring(commaIndex + 1);
        return new Date(1970, 1, 1, hour, minute, second, msecond);
    }
    dateToObject(date) {
        return {
            text: (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() + ',' + (date.getMilliseconds() < 10 ? '00' : '') + ((date.getMilliseconds() < 100 && date.getMilliseconds() >= 10) ? '0' : '') + date.getMilliseconds(),
            time: date,
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds(),
            milliseconds: date.getMilliseconds()
        }
    }
    nthChar(string, character, n) {
        // find the index of the nth char in string
        let count = 0,
            i = 0;
        while (count < n && (i = string.indexOf(character, i) + 1)) {
            count++;
        }
        if (count == n) return i - 1;
        return NaN;
    }

    /**
     * Convierte un tiempo en segundos a un objeto Date
     * @param {number} seconds - Tiempo en segundos
     * @returns {Date} Objeto Date correspondiente
     */
    secondsToDate(seconds) {
        const date = new Date(1970, 1, 1, 0, 0, 0, 0);
        const totalMs = seconds * 1000;
        date.setTime(totalMs);
        return date;
    }

    /**
     * Convierte un objeto Date a segundos
     * @param {Date} date - Objeto Date
     * @returns {number} Tiempo en segundos
     */
    dateToSeconds(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const milliseconds = date.getMilliseconds();
        return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }

    /**
     * Obtiene el subtítulo activo para un tiempo dado en segundos
     * @param {number} currentTime - Tiempo actual en segundos
     * @returns {Object|null} Objeto con la información del subtítulo o null si no hay subtítulo activo
     */
    getSubtitleAtTime(currentTime) {
        const currentDate = this.secondsToDate(currentTime);
        
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            const startTime = this.dateToSeconds(line.start.time);
            const endTime = this.dateToSeconds(line.end.time);
            
            if (currentTime >= startTime && currentTime <= endTime) {
                return {
                    ...line,
                    index: i,
                    startSeconds: startTime,
                    endSeconds: endTime,
                    text: line.subtitle.trim()
                };
            }
        }
        
        return null;
    }

    /**
     * Obtiene todos los subtítulos
     * @returns {Array} Array de todos los subtítulos
     */
    getAllSubtitles() {
        return this.lines.map((line, index) => ({
            ...line,
            index: index,
            startSeconds: this.dateToSeconds(line.start.time),
            endSeconds: this.dateToSeconds(line.end.time),
            text: line.subtitle.trim()
        }));
    }

    /**
     * Obtiene el siguiente subtítulo después de un tiempo dado
     * @param {number} currentTime - Tiempo actual en segundos
     * @returns {Object|null} Siguiente subtítulo o null
     */
    getNextSubtitle(currentTime) {
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            const startTime = this.dateToSeconds(line.start.time);
            
            if (startTime > currentTime) {
                return {
                    ...line,
                    index: i,
                    startSeconds: startTime,
                    endSeconds: this.dateToSeconds(line.end.time),
                    text: line.subtitle.trim()
                };
            }
        }
        
        return null;
    }
}