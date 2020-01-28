/**
 * GPS NEO-6M GPS Sensor extension for calliope.
 * Serial interface
 * 
 * @author Raik Andritschke
 *
 */

enum GPS_Format {
    //% blockId="DEG_MIN" block="hddd.ddddd°"
    DEG_DEC,
    //% blockId="DEG_MIN_DEC" block="hddd° mm.mmm′"
    DEG_MIN_DEC,
    //% blockId="DEG_MIN_SEC" block="hddd° mm′ ss.ss″"
    DEG_MIN_SEC,
    //% blockId="SIGNED_DEG_DEC" block="±ddd.ddddd°"
    SIGNED_DEG_DEC
}

//% weight=20 color=#0fbc11 icon=""
namespace neo6mgps {

    let TX = SerialPin.C17;
    let RX = SerialPin.C16;
    let BAUD = BaudRate.BaudRate9600;
    let GPS_FORMAT = GPS_Format.DEG_DEC;
    let received = "";
    let gpgll = "";
    let gpgsv = "";
    let gpgga = "";
    let gpvtg = "";
    let gprmc = "";
    let DEG = "°";
    let MNS = "′";
    let SEC = "″";
    const DEC = ".";

    //% blockId="serial_buffersize" block="serial receive buffer size %size"
    //% shim=neo6mgps::setReceiveBufferSize
    export function setReceiveBufferSize(size: number): void {
        return;
    }

    //% blockId="init" block="Initialisiere Serielle Schnittstelle mit TX Pin %tx | RX Pin %rx | Baudrate %baud"
    //% tx.defl=SerialPin.C17
    //% rx.defl=SerialPin.C16
    //% baud.defl=BaudRate.BaudRate9600
    export function init(tx: SerialPin, rx: SerialPin, baud: BaudRate): void {
        // initialize serial port
        TX = tx;
        RX = rx;
        BAUD = baud;
        serial.redirect(TX, RX, BAUD);
        setReceiveBufferSize(100)
    }

    //% blockId="setUnits" block="Setze GPS Einheiten auf Grad: %deg | Minuten: %mns | Sekunden: %sec"
    //% expandableArgumentMode="toggle"
    export function setUnits(deg: string, mns: string, sec: string) {
        if (deg.length > 0) { DEG = deg.substr(0, 1) }
        if (mns.length > 0) { MNS = mns.substr(0, 1) }
        if (sec.length > 0) { SEC = sec.substr(0, 1) }
    }

    //% blockId="setFormat" block="Setze GPS Format auf %gpsFormat"
    export function setFormat(gpsFormat: GPS_Format) {
        GPS_FORMAT = gpsFormat;
    }

    // string => array of strings
    function string2array(s: string, delimiter: string): Array<string> {
        let line = "";
        let received_array: Array<string> = [];
        if (s.length > 0) {
            for (let i = 0; i <= s.length; i++) {
                if ((s.charAt(i) == delimiter) || (i == s.length)) {
                    received_array.push(line);
                    line = "";
                } else {
                    line = line + s.charAt(i);
                }
            }
        }
        return received_array;
    }

    // serial event handler 
    serial.onDataReceived(serial.delimiters(Delimiters.NewLine), () => {
        received = serial.readUntil(serial.delimiters(Delimiters.NewLine))
        if (received.length > 0) {
            if (received.substr(1, 5) == "GPGLL") {
                gpgll = received.substr(7, received.length - 7)
            }
            if (received.substr(1, 5) == "GPGSV") {
                gpgsv = received.substr(7, received.length - 7)
            }
            if (received.substr(1, 5) == "GPGGA") {
                gpgga = received.substr(7, received.length - 7)
            }
            if (received.substr(1, 5) == "GPVTG") {
                gpvtg = received.substr(7, received.length - 7)
            }
            if (received.substr(1, 5) == "GPRMC") {
                gprmc = received.substr(7, received.length - 7)
            }
        }
    })

    //% blockId="getReceived" block="Lese empfangene Zeichenkette"
    export function getReceived(): string {
        return received;
    }

    //% blockId="getGPGLL" block="Lese GPGLL"
    export function getGPGLL(): Array<string> {
        return string2array(gpgll, ",");
    }

    //% blockId="getGPGSV" block="Lese GPGSV"
    export function getGPGSV(): Array<string> {
        return string2array(gpgsv, ",");
    }

    //% blockId="getGPGGA" block="Lese GPGGA"
    export function getGPGGA(): Array<string> {
        return string2array(gpgga, ",");
    }

    //% blockId="getGPGGAString" block="Lese GPGGA Zeichenkette"
    export function getGPGGAString(): string {
        return gpgga;
    }

    //% blockId="getGPVTG" block="Lese GPVTG"
    export function getGPVTG(): Array<string> {
        return string2array(gpvtg, ",");
    }

    //% blockId="getGPRMC" block="Lese GPRMC"
    export function getGPRMC(): Array<string> {
        return string2array(gprmc, ",");
    }

    //% blockId="getGPRMCString" block="Lese GPRMC Zeichenkette"
    export function getGPRMCString(): string {
        return gprmc;
    }

    //% blockId="getTime" block="Lese Uhrzeit"
    export function getTime(): string {
        if ((gpgga.length > 0) && (getGPGGA().length > 0) && (getGPGGA().get(0))) {
            return getGPGGA().get(0);
        } else {
            return "";
        }
    }

    //% blockId="getFix" block="Lese GPS Fix"
    export function getFix(): boolean {
        if ((gpgga.length > 0) && (getGPGGA().length > 0) && (getGPGGA().get(5))) {
            return (getGPGGA().get(5) == "1");
        } else {
            return false;
        }
    }

    //% blockId="getCountSat" block="Lese Anzahl der Satelliten"
    export function getCountSat(): number {
        if ((gpgga.length > 0) && (getGPGGA().length > 0) && (getGPGGA().get(6))) {
            return parseInt(getGPGGA().get(6));
        } else {
            return 0;
        }
    }

    //% blockId="getAltitude" block="Lese Höhe"
    export function getAltitude(): string {
        if ((gpgga.length > 0) && (getGPGGA().length > 0) && (getGPGGA().get(8))) {
            return getGPGGA().get(8);
        } else {
            return "";
        }
    }

    //% blockId="getSpeed" block="Lese Geschwindigkeit"
    export function getSpeed(): string {
        if ((gprmc.length > 0) && (getGPRMC().length > 0) && (getGPRMC().get(6))) {
            return getGPRMC().get(6);
        } else {
            return "";
        }
    }

    //% blockId="getTrackAngle" block="Lese Bewegungswinkel"
    export function getTrackAngle(): string {
        if ((gprmc.length > 0) && (getGPRMC().length > 0) && (getGPRMC().get(7))) {
            return getGPRMC().get(7);
        } else {
            return "";
        }
    }

    // Formatted GPS
    function getFormattedGPS(gpsFormat: GPS_Format, dir: string, deg: number, mns: number, sec: string): string {
        // complex calculation because of missing float type
        let ret = "";
        let seclen = sec.length;
        let secint = parseInt(sec);
        let shiftedmin = (mns * Math.pow(10, seclen) + secint) / 60;
        let shiftedminstr = shiftedmin.toString()
        if (shiftedminstr.length < 5) { shiftedminstr = "0" + shiftedminstr }
        switch (gpsFormat) {
            case GPS_Format.DEG_DEC: // (hddd.ddddd°)
                // mm.mmmmm / 60
                return dir + deg.toString() + DEC + shiftedminstr.substr(0, 5) + DEG;
            case GPS_Format.DEG_MIN_SEC: // (hddd° mm′ ss.ss″)
                // mmmmm * 60
                return dir + deg.toString() + DEG + mns.toString() + MNS + (secint * 60).toString().substr(0, 2) + DEC + (secint * 60).toString().substr(2, 5) + SEC;
            case GPS_Format.DEG_MIN_DEC: // (hddd° mm.mmm′)
                // only formatting
                return dir + deg.toString() + DEG + mns.toString() + DEC + sec.substr(0) + MNS;
            case GPS_Format.SIGNED_DEG_DEC: // (±ddd.ddddd°)
                // mm.mmmmm / 60
                ret = deg.toString() + DEC + shiftedminstr.substr(0, 5) + DEG;
                if (dir == "N") {
                    return "Lat=" + ret;
                } else if (dir == "S") {
                    return "Lat=-" + ret;
                } else if (dir == "E") {
                    return "Long=" + ret;
                } else if (dir == "W") {
                    return "Long=-" + ret;
                }
            default:
                return "";
        }
    }

    //% blockId="getLatitude" block="Lese Geographische Länge"
    //% expandableArgumentMode="toggle"
    export function getLatitude(gpsFormat?: GPS_Format): string {
        if (!gpsFormat) { gpsFormat = GPS_FORMAT }
        if ((gpgga.length > 0) && (getGPGGA().length > 0) && (getGPGGA().get(1)) && (getGPGGA().get(2))) {
            // (1) ddmm.mmmmm
            // (2) N/S
            let lat = getGPGGA().get(1);
            let dir = getGPGGA().get(2);
            let deg = 0;
            let mns = 0;
            let sec = "";
            let splitted = string2array(lat, '.');
            switch (splitted.get(0).length) {
                case 4:
                    deg = parseInt(splitted.get(0).substr(0, 2));
                    mns = parseInt(splitted.get(0).substr(2));
                    break;
                case 3:
                    deg = parseInt(splitted.get(0).substr(0, 1));
                    mns = parseInt(splitted.get(0).substr(1));
                    break;
                default:
                    deg = 0;
                    mns = 0;
            }
            sec = splitted.get(1);
            return getFormattedGPS(gpsFormat, dir, deg, mns, sec);
        } else {
            return "";
        }
    }

    //% blockId="getLongitude" block="Lese Geographische Breite"
    //% expandableArgumentMode="toggle"
    export function getLongitude(gpsFormat?: GPS_Format): string {
        if (!gpsFormat) { gpsFormat = GPS_FORMAT }
        if ((gpgga.length > 0) && (getGPGGA().length > 0) && (getGPGGA().get(3)) && (getGPGGA().get(4))) {
            // (3) ddmm.mmmmm
            // (4) E/W
            let long = getGPGGA().get(3);
            let dir = getGPGGA().get(4);
            let deg = 0;
            let mns = 0;
            let sec = "";
            let splitted = string2array(long, '.');
            switch (splitted.get(0).length) {
                case 5:
                    deg = parseInt(splitted.get(0).substr(0, 3));
                    mns = parseInt(splitted.get(0).substr(3));
                    break;
                case 4:
                    deg = parseInt(splitted.get(0).substr(0, 2));
                    mns = parseInt(splitted.get(0).substr(2));
                    break;
                case 3:
                    deg = parseInt(splitted.get(0).substr(0, 1));
                    mns = parseInt(splitted.get(0).substr(1));
                    break;
                default:
                    deg = 0;
                    mns = 0;
            }
            sec = splitted.get(1);
            return getFormattedGPS(gpsFormat, dir, deg, mns, sec);
        } else {
            return "";
        }
    }

    //% blockId="getGoogleDMS" block="Lese Google Koordinaten im Format GMS"
    export function getGoogleDMS(): string {
        // gg°mm'ss.ss"h gg°mm'ss.ss"h
        let latitude = getLatitude(GPS_Format.DEG_MIN_SEC);
        let longitude = getLongitude(GPS_Format.DEG_MIN_SEC);
        if (latitude && longitude) {
            return latitude.substr(1) + latitude.substr(0, 1) + " " + longitude.substr(1) + longitude.substr(0, 1);
        }
        return "";
    }

    //% blockId="getGoogleDD" block="Lese Google Koordinaten im Format G"
    export function getGoogleDD(): string {
        // gg.ddddd, gg.ddddd
        let latitude = getLatitude(GPS_Format.DEG_DEC);
        let longitude = getLongitude(GPS_Format.DEG_DEC);
        if (latitude && longitude) {
            return latitude.substr(1) + ", " + longitude.substr(1);
        }
        return "";
    }

}
