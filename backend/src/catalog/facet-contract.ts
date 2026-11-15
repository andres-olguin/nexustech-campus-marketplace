// Claves admitidas por la API para los perfiles del catálogo. Ver test/catalog.test.cjs.
export const profiles = ["general","notebook","desktop","server","graphics","memory","cpu","motherboard","ssd","hdd","headphones","monitor","tv","phone","tablet","keyboard","mouse","network","microphone","fridge"] as const;
export const fields: Readonly<Record<string, "exact" | { mode: string; source: string }>> = {
  "brand": "exact",
  "series": "exact",
  "kind": "exact",
  "weightKg": {
    "mode": "max",
    "source": "weightKg"
  },
  "cpuBrand": "exact",
  "cpuLine": "exact",
  "cpuModel": "exact",
  "cores": {
    "mode": "min",
    "source": "cores"
  },
  "threads": {
    "mode": "min",
    "source": "threads"
  },
  "cpuClass": "exact",
  "cpuSocket": "exact",
  "cpuBoostGHz": {
    "mode": "min",
    "source": "cpuBoostGHz"
  },
  "ramGb": {
    "mode": "min",
    "source": "ramGb"
  },
  "ramCapacity": {
    "mode": "exact",
    "source": "ramGb"
  },
  "ramType": "exact",
  "ramChannels": "exact",
  "ramFormat": "exact",
  "ramModules": "exact",
  "ramSpeed": {
    "mode": "min",
    "source": "ramSpeed"
  },
  "ramClock": {
    "mode": "min",
    "source": "ramClock"
  },
  "ramVoltage": {
    "mode": "max",
    "source": "ramVoltage"
  },
  "ramCl": {
    "mode": "max",
    "source": "ramCl"
  },
  "ramEcc": "exact",
  "ramHeatsink": "exact",
  "ramFullBuffer": "exact",
  "displayInches": {
    "mode": "min",
    "source": "displayInches"
  },
  "panel": "exact",
  "displayShape": "exact",
  "resolution": {
    "mode": "min",
    "source": "resolution"
  },
  "refreshHz": {
    "mode": "min",
    "source": "refreshHz"
  },
  "touch": "exact",
  "rotating": "exact",
  "gpuType": "exact",
  "gpuBrand": "exact",
  "gpuLine": "exact",
  "gpuModel": "exact",
  "vramGb": {
    "mode": "min",
    "source": "vramGb"
  },
  "vramType": "exact",
  "vramBusBits": {
    "mode": "min",
    "source": "vramBusBits"
  },
  "gpuArchitecture": "exact",
  "gpuArchitectureFamily": "exact",
  "pcieVersion": "exact",
  "pcieLanes": {
    "mode": "min",
    "source": "pcieLanes"
  },
  "gpuProfile": "exact",
  "gpuCooling": "exact",
  "gpuSlots": {
    "mode": "max",
    "source": "gpuSlots"
  },
  "gpuLength": {
    "mode": "max",
    "source": "gpuLength"
  },
  "rgb": "exact",
  "gpuBenchmark": {
    "mode": "min",
    "source": "gpuBenchmark"
  },
  "storageGb": {
    "mode": "min",
    "source": "storageGb"
  },
  "storageType": "exact",
  "rpm": {
    "mode": "min",
    "source": "rpm"
  },
  "storageFormat": "exact",
  "storageInterface": "exact",
  "readMBps": {
    "mode": "min",
    "source": "readMBps"
  },
  "writeMBps": {
    "mode": "min",
    "source": "writeMBps"
  },
  "os": "exact",
  "osVersion": "exact",
  "keyboard": "exact",
  "fingerprint": "exact",
  "ports": "exact",
  "connection": "exact",
  "keySwitch": "exact",
  "keyLayout": "exact",
  "hotSwap": "exact",
  "dpi": {
    "mode": "min",
    "source": "dpi"
  },
  "noiseCancel": "exact",
  "boardChipset": "exact",
  "boardFormat": "exact",
  "networkSpeed": {
    "mode": "min",
    "source": "networkSpeed"
  },
  "networkPorts": {
    "mode": "min",
    "source": "networkPorts"
  },
  "poe": "exact",
  "volumeL": {
    "mode": "min",
    "source": "volumeL"
  },
  "energyClass": "exact"
};
