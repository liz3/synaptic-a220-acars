import AcarsService from "./AcarsService.mjs";
import { ATIS, FREETEXT, INIT, OCEANIC, PDC, WX } from "./Forms"

export const ATS = {
  title: "ATS -ATS MENU",
  grid: {
    "close": {

      cb: () => ["default", {}]
    },
    "l-0": {
      title: "ATIS",
      cb: () => {
        const last = AcarsService.messages.find(e => {
          return e.type !== "send" && e.subType === "ATIS";
        });
        if (last)
          return ["message", last];
        return ["form", ATIS];
      }
    },
    "r-0": {
      title: "ATS LOG",
      cb: () => ["log", {}]
    },
    "l-1": {
      title: "DEPART CLX",
      cb: () => {
        const last = AcarsService.messages.find(e => {
          return e.type !== "send" && e.subType === "PDC" && e.options;
        });
        if (last)
          return ["message", last];
        return ["form", PDC];
      }
    },
    "l-2": {
      title: "OCEANIC CLX",
      cb: () => ["form", OCEANIC]
    },
    "l-3": {
      title: "TWIP",
      cb: () => {
        const last = AcarsService.messages.find(e => {
          return e.type !== "send" && e.subType === "TWIP";
        });
        if (last)
          return ["message", last];
        return ["form", WX];
      }
    }
  }
}
export const AOC = {
  title: "AOC -AOC MENU",
  grid: {
    "close": {

      cb: () => ["default", {}]
    },
    "l-0": {
       title: "INIT DATA",
       cb: () => ["form", INIT]
     },
    "r-0": {
      title: "FREE TEXT",
      cb: () => ["form", FREETEXT]
    },
  }
}
export const BASE = {
  title: "DL -APPLICATION MENU",
  grid: {
    "r-2": {
      title: "ATS",
      cb: () => ["menu", ATS]
    },
    "r-1": {
      title: "AOC",
      cb: () => ["menu", AOC]
    }
  }
}