#include "pxt.h"

namespace NEO6M_GPS {
    //%
    void setReceiveBufferSize(int size) {
        uBit.serial.setRxBufferSize(size < 255 ? size : 254);
    }

    //%
    void writeBuffer(Buffer buffer) {
    if (!buffer) return;
    uBit.serial.send(buffer->data, buffer->length);
    }
}