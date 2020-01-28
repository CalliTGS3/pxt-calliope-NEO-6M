#include "pxt.h"

namespace neo6mgps {
    void setReceiveBufferSize(int size) {
        uBit.serial.setRxBufferSize(size < 255 ? size : 254);
    }
}