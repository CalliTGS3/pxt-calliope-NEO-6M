#include "pxt.h"

namespace NEO6M_GPS {
    //%
    void setReceiveBufferSize(int size) {
        uBit.serial.setRxBufferSize(size < 255 ? size : 254);
    }

    //%
    void writeBuffer(Buffer buffer, int size) {
        if (!buffer) return;
        uBit.serial.send((uint8_t *)buffer, size);
    }    
}
