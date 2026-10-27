import { ATS, AOC as ACARSAOC } from "./AcarsMenus.mjs";
import AcarsService from "./AcarsService.mjs";
import { convertUnixToHHMM } from "./Hoppie.mjs";
import { cloneObjectSafe } from "./utils.mjs";

export const concatFreeText = (fields, count = 4) => {
  let arr = [];
  for (let i = 0; i < count; i += 1) arr.push(fields[`FREETEXT${i}`]);
  return arr.filter((e) => typeof e === "string" && e.length > 0).join(" ");
};

export const concatFreeText2 = (fields) => {
  let arr = [];
  for (let i = 0; i < 2; i += 1) arr.push(fields[`FREETEXT${i}`]);
  for (let i = 0; i < 3; i += 1) arr.push(fields[`FREETEXT_T${i}`]);
  return arr.filter((e) => typeof e === "string" && e.length > 0).join(" ");
};

export const PDC = {
  key: "PDC",
  title: "DEPART CLX RQ",
  onSubmit: (values) => {
    const out = AcarsService.withClient((cl) =>
      cl.sendPdc(
        values.STATION,
        values.CALLSIGN,
        values.FROM,
        values.TO,
        values.STAND,
        values.ATIS,
        values.EOB,
        concatFreeText(values),
      ),
    );
    return out ? ["menu", ATS] : null;
  },
  asyncFetch: (setFields) => {
    const code = AcarsService.staIcao;
    if (code && code.length) {
      AcarsService.tryFetchDepAtis(code)
        .then((response) => {
          if (response)
            setFields((fields) => {
              const c = cloneObjectSafe(fields);
              c.ATIS = response;
              return c;
            });
        })
        .catch(() => null);
    }
  },
  fields: [
    [
      {
        left: {
          type: "default",
          key: "CALLSIGN",
          title: "ATS FLT ID",
          width: 130,
          size: 7,
          defaultValue: () =>
            AcarsService._client ? AcarsService._client.callsign : "",
          regex: /[A-Z0-9]{1,7}/,
        },
        right: {
          type: "default",
          key: "STATION",
          title: "FACILTY",
          width: 130,
          defaultValue: "----",
          size: 4,
          regex: /[A-Z0-9]{4}/,
        },
      },
      {
        left: {
          type: "default",
          key: "ACTYPE",
          title: "AC TYPE",
          width: 60,
          defaultValue: () => "BCS3",
          size: 4,
          regex: /[A-Z0-9]{4}/,
        },
        right: {
          type: "default",
          key: "ATIS",
          title: "ATIS",
          width: 60,
          defaultValue: "-",
          size: 1,
          regex: /[A-Z]{1}/,
        },
      },
      {
        left: {
          type: "default",
          key: "FROM",
          title: "ORIG STA",
          size: 4,
          defaultValue: () => {
            const { active } = reactUtils.state.getState();
            if (active && active.origin && active.origin.airport) {
              const icao = active.origin.airport.ident;
              if (typeof icao === "string") return icao;
            }
            return "";
          },
          width: 130,

          regex: /[A-Z0-9]{4}/,
        },
        right: {
          type: "default",
          key: "TO",
          title: "DEST STA",
          size: 4,
          width: 130,
          defaultValue: () => {
            const { active } = reactUtils.state.getState();
            if (active && active.destination && active.destination.airport) {
              const icao = active.destination.airport.ident;
              if (typeof icao === "string") return icao;
            }
            return "";
          },
          regex: /[A-Z0-9]{4}/,
        },
      },
      {
        left: {
          type: "default",
          key: "STAND",
          title: "GATE",
          width: 80,
          defaultValue: "---",
          size: 3,
          regex: /[A-Z0-9]{1,6}/,
        },
        right: {
          type: "default",
          key: "EOB",
          title: "EOB",
          width: 100,
          defaultValue: () => convertUnixToHHMM(new Date()),
          size: 4,
          alter: (v) =>
            v.length === 4 ? `${v.substr(0, 2)}:${v.substr(2)}` : v,
          regex: /[\:0-9]{4}/,
        },
      },
    ],
    [
      {
        left: {
          type: "freetext",
          key: "FREETEXT",
          title: "REMARKS",
          defaultValue: "",
          width: 400,
          size: 24,
          rows: 3,
        },
      },
    ],
  ],
};
const formatTime = (d) => {
  const minutesTotal = d / 60;
  const hrs = Math.floor(minutesTotal / 60);
  const minutes = Math.floor(minutesTotal % 60);
  return `${hrs.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};
export const INIT = {
  key: "INIT",
  title: "INIT DATA",
  send: "INIT REQ",
  parent: "AOC",
  noConnection: true,
  alwaysValid: true,
  onSubmit: (values, setFields) => {
    AcarsService.simbriefFetch().then(res => {
      if (res) {
        const cs = res.callsign ? res.callsign : res.airline + res.fltNumber;
        reactUtils.tcasSetState({ type: "SetAtcId", id: cs });

        setFields(fields => {
          const c = cloneObjectSafe(fields);
          c.FLTNUM = res.fltNumber;
          c.DATE = res.sched.getDate().toString().padStart(2, "0")
          c.FROM = res.origin;
          c.TO = res.arrival;
          c.ETF = convertUnixToHHMM(res.sched)
          c.ETE = formatTime(res.enroute)
          c.AIRLINEID = res.airline;
          c.ATSFLTID = cs;
          return c;
        })
      }
    })
    return null;
  },
  fields: [
    [
      {
        left: {
          type: "default",
          key: "FLTNUM",
          title: "FLT NUM",
          width: 130,
          size: 4,
          // defaultValue: () =>
          //   AcarsService.sbState ? AcarsService.sbState.fltNumber : "",
          regex: /[A-Z0-9]{1,8}/,
        },
        right: {
          type: "default",
          key: "DATE",
          title: "SCHED DATE",
          width: 130,
          size: 4,
          alter: (v) => v.padStart(2, "0"),
          // defaultValue: () =>
          //   AcarsService.sbState
          //     ? `${AcarsService.sbState.sched.getDate()}`.padStart(2, "0")
          //     : `${new Date().getDate()}`.padStart(2, "0"),
          regex: /[0-9]{1,2}/,
        },
      },
      {
        left: {
          type: "default",
          key: "FROM",
          title: "ORIG STA",
          size: 4,
          // defaultValue: () => {
          //   const { active } = reactUtils.state.getState();
          //   if (active && active.origin && active.origin.airport) {
          //     const icao = active.origin.airport.ident;
          //     if (typeof icao === "string") return icao;
          //   }
          //   return "";
          // },
          width: 130,

          regex: /[A-Z0-9]{4}/,
        },
        right: {
          type: "default",
          key: "TO",
          title: "DEST STA",
          size: 4,
          width: 130,
          // defaultValue: () => {
          //   const { active } = reactUtils.state.getState();
          //   if (active && active.destination && active.destination.airport) {
          //     const icao = active.destination.airport.ident;
          //     if (typeof icao === "string") return icao;
          //   }
          //   return "";
          // },
          regex: /[A-Z0-9]{4}/,
        },
      },
      {
        left: {
          type: "default",
          key: "ETF",
          title: "ETD",
          width: 100,
          // defaultValue: () =>
          //   AcarsService.sbState
          //     ? `${AcarsService.sbState.sched.getHours().toString().padStart(2, "0")}:${AcarsService.sbState.sched.getMinutes().toString().padStart(2, "0")}`
          //     : convertUnixToHHMM(new Date()),
          size: 4,
          alter: (v) =>
            v.length === 4 ? `${v.substr(0, 2)}:${v.substr(2)}` : v,
          regex: /[\:0-9]{4}/,
        },
        right: {
          type: "default",
          key: "ETE",
          title: "ETE",
          width: 100,
          // defaultValue: () =>
          //   AcarsService.sbState
          //     ? `${AcarsService.sbState.schedOn.getHours().toString().padStart(2, "0")}:${AcarsService.sbState.schedOn.getMinutes().toString().padStart(2, "0")}`
          //     : convertUnixToHHMM(new Date()),
          size: 4,
          alter: (v) =>
            v.length === 4 ? `${v.substr(0, 2)}:${v.substr(2)}` : v,
          regex: /[\:0-9]{4}/,
        },
      },
      {
        left: {
          type: "default",
          key: "AIRLINEID",
          title: "AIRLINE ID",
          size: 3,
          // defaultValue: () =>
          //   AcarsService.sbState ? AcarsService.sbState.airline : "",
        },
        right: {
          type: "default",
          key: "ATSFLTID",
          title: "ATS FLT ID",
          size: 6,
          // defaultValue: () =>
          //   (AcarsService.sbState ? AcarsService.sbState.airline : "") +
          //   (AcarsService.sbState ? AcarsService.sbState.fltNumber : ""),
          regex: /[A-Z0-9]{5,8}/,
        },
      },
    ],
  ],
};

export const WX = {
  key: "WX",
  title: "TWIP RQ",
  onSubmit: (values) => {
    const out = AcarsService.withClient((cl) =>
      cl.atisRequest(values.FACILITY, values.TYPE),
    );
    return out ? ["menu", ATS] : null;
  },
  fields: [
    [
      {
        left: {
          type: "default",
          key: "FACILITY",
          title: "AIRPORT",
          width: 130,
          size: 4,
          defaultValue: "----",
          regex: /[A-Z0-9]{4}/,
        },
      },
      {
        left: {
          type: "select",
          key: "TYPE",
          title: "SERVICE TYPE",
          width: 130,
          defaultValue: () => "METAR",
          options: [
            { value: "METAR", label: "METAR" },
            { value: "TAF", label: "TAF" },
          ],
        },
      },
    ],
  ],
};
export const ATIS = {
  key: "ATIS",
  title: "ATIS RQ",
  onSubmit: (values) => {
    const out = AcarsService.withClient((cl) =>
      cl.atisRequest(values.FACILITY, "ATIS", values.TYPE),
    );
    return out ? ["menu", ATS] : null;
  },
  fields: [
    [
      {
        left: {
          type: "default",
          key: "FACILITY",
          title: "AIRPORT",
          width: 130,
          size: 4,
          defaultValue: () => {
            const st = reactUtils.state.getState();
            if (st.active) {
              const active = st.active;
              const airborne = !SimVar.GetSimVarValue("SIM ON GROUND", "bool");
              const target = airborne ? "destination" : "origin";
              if (active && active[target] && active[target].airport) {
                const icao = active[target].airport.ident;
                return icao;
              }
            }
            return "----";
          },
          regex: /[A-Z0-9]{4}/,
        },
      },
      {
        left: {
          type: "select",
          key: "TYPE",
          title: "SERVICE TYPE",
          width: 130,
          defaultValue: () => "D",
          options: [
            { value: "D", label: "DEPARTURE ATIS" },
            { value: "A", label: "ARRIVAL ATIS" },
          ],
        },
      },
    ],
  ],
};
export const FREETEXT = {
  key: "FREETEXT",
  title: "TEXT MESSAGE",
  parent: "AOC",
  onSubmit: (values) => {
    const out = AcarsService.withClient((cl) =>
      cl.sendTelex(values.STATION, concatFreeText2(values)),
    );
    return out ? ["menu", ATS] : null;
  },
  fields: [
    [
      {
        left: {
          type: "default",
          key: "STATION",
          title: "FACILITY",
          width: 130,
          size: 7,
          defaultValue: () => "",
          regex: /[A-Z0-9]{4,8}/,
        },
      },
      {
        left: {
          type: "freetext",
          key: "FREETEXT",
          title: "REMARKS",
          defaultValue: "",
          width: 400,
          size: 24,
          rows: 2,
        },
      },
    ],
    [
      {
        left: {
          type: "freetext",
          key: "FREETEXT_T",
          title: "REMARKS",
          defaultValue: "",
          width: 400,
          size: 24,
          rows: 3,
        },
      },
    ],
  ],
};

export const OCEANIC = {
  key: "OCEANIC",
  title: "OCEANIC CLX RQ",
  onSubmit: (values) => {
    const out = AcarsService.withClient((cl) =>
      cl.sendOceanicClearance(
        values.CALLSIGN,
        values.STATION,
        values.WAYPOINT,
        values.ETA,
        values.LVL,
        values.SPD,
        concatFreeText(values, 4),
      ),
    );
    return out ? ["menu", ATS] : null;
  },
  fields: [
    [
      {
        left: {
          type: "default",
          key: "CALLSIGN",
          title: "CALLSIGN",
          width: 130,
          size: 7,
          defaultValue: () =>
            AcarsService._client ? AcarsService._client.callsign : "",
          regex: /[A-Z0-9]{1,7}/,
        },
        right: {
          type: "default",
          key: "STATION",
          title: "FACILITY",
          width: 130,
          size: 4,
          defaultValue: "",
          regex: /[A-Z0-9]{4}/,
        },
      },
      {
        left: {
          type: "default",
          key: "WAYPOINT",
          title: "WAYPOINT",
          width: 130,
          size: 5,
          defaultValue: () => {
            const { active } = reactUtils.state.getState();
            if (active && active.legs && active.legs.length) {
              const filtered = active.legs.filter((e) => !e.discontinuity);
              if (filtered.length > 0) return filtered[0].ident;
            }

            return "";
          },
          regex: /[A-Z0-9]{3,5}/,
        },
        right: {
          type: "default",
          key: "ETA",
          title: "AT TIME",
          width: 100,
          defaultValue: () => convertUnixToHHMM(new Date()),
          size: 4,
          alter: (v) =>
            v.length === 4 ? `${v.substr(0, 2)}:${v.substr(2)}` : v,
          regex: /[\:0-9]{4}/,
        },
      },
      {
        left: {
          type: "default",
          key: "SPD",
          title: "MACH",
          width: 130,
          size: 4,
          defaultValue: "----",
          alter: (v) => (!v.startsWith("M.") ? `M.${v}` : v),
          regex: /[M\.0-9]{1,5}/,
        },
        right: {
          type: "default",
          key: "LVL",
          title: "FLT LVL",
          width: 100,
          size: 3,
          defaultValue: "---",
          alter: (v) => (v.startsWith("FL") ? v : `FL${v}`),
          regex: /[FL0-9]{2,5}/,
        },
      },
    ],
    [
      {
        left: {
          type: "freetext",
          key: "FREETEXT",
          title: "REMARKS",
          defaultValue: "",
          width: 399,
          size: 23,
          rows: 3,
        },
      },
    ],
  ],
};

const POSREPORT = {
  key: "POSREPORT",
  menu: "POS REPORT",
  title: "POSITION REPORT",
  yOffset: 100,
  onSubmit: (values) => {
    return AcarsService.withClient((cl) =>
      cl.sendPositionReport(
        values.LVL,
        values.SPD,
        values.OVHD,
        values.OVHDETA,
        values.TO,
        values.TOETA,
        values.NEXT,
      ),
    );
  },
  fields: [
    [
      {
        type: "default",
        key: "OVHD",
        title: "OVHD WP",
        width: 130,
        defaultValue: () => {
          const { active } = reactUtils.state.getState();
          if (
            active &&
            active.from &&
            typeof active.from.ident === "string" &&
            active.from.ident.length > 0
          ) {
            return active.from.ident;
          }

          return "-----";
        },
        regex: /[A-Z0-9]{3,5}/,
      },
      {
        type: "default",
        key: "OVHDETA",
        title: "OVHD ETA",
        width: 100,
        defaultValue: () => convertUnixToHHMM(new Date()),
        size: 4,
        alter: (v) => (v.length === 4 ? `${v.substr(0, 2)}:${v.substr(2)}` : v),
        regex: /[\:0-9]{4}/,
      },
      {
        type: "default",
        key: "LVL",
        title: "FL",
        width: 100,
        size: 5,
        defaultValue: "---",
        alter: (v) => (v.startsWith("FL") ? v : `FL${v}`),
        regex: /[FL0-9]{2,5}/,
      },
      {
        type: "default",
        key: "SPD",
        title: "MACH",
        width: 130,
        size: 4,
        defaultValue: "----",
        alter: (v) => (!v.startsWith("M.") ? `M.${v}` : v),
        regex: /[M\.0-9]{1,5}/,
      },
    ],
    [
      {
        type: "default",
        key: "TO",
        title: "TO WP",
        width: 130,
        defaultValue: () => {
          const { active } = reactUtils.state.getState();
          if (active && active.legs && active.legs.length) {
            const filtered = active.legs.filter((e) => !e.discontinuity);
            if (filtered.length > 0) return filtered[0].ident;
          }

          return "-----";
        },
        regex: /[A-Z0-9]{3,5}/,
      },

      {
        type: "default",
        key: "TOETA",
        title: "TO ETA",
        width: 100,
        defaultValue: "----",
        size: 4,
        alter: (v) => (v.length === 4 ? `${v.substr(0, 2)}:${v.substr(2)}` : v),
        regex: /[\:0-9]{4}/,
      },
    ],
    [
      {
        type: "default",
        key: "NEXT",
        title: "NEXT WP",
        width: 130,
        defaultValue: () => {
          const { active } = reactUtils.state.getState();
          if (active && active.legs && active.legs.length) {
            const filtered = active.legs.filter((e) => !e.discontinuity);
            if (filtered.length > 1) return filtered[1].ident;
          }

          return "-----";
        },
        regex: /[A-Z0-9]{3,5}/,
      },
    ],
  ],
};

//   state.sendLevelChange = async (lvl, climb, reason, freeText) => {

const LVLCHG = {
  key: "LVLCHG",
  menu: "ALTITUDE",
  title: "ALTITUDE REQUEST",
  onSubmit: (values) => {
    return AcarsService.withClient((cl) =>
      cl.sendLevelChange(
        values.LVL,

        values.REASON,
        concatFreeText(values, 4),
      ),
    );
  },
  dryRunFunc: (values) => {
    return AcarsService.withClientPs((cl) =>
      cl.sendLevelChange(
        values.LVL,
        values.REASON,
        concatFreeText(values, 4),
        true,
      ),
    );
  },
  fields: [
    [
      {
        type: "default",
        key: "LVL",
        title: "ALT/ALT BLOCK",
        width: 100,
        size: 5,
        defaultValue: "---",
        regex: /(FL)?[0-9]{2,5}/,
        inline: true,
        xOffset: 180,
      },
    ],
    null,
    null,
    null,
    [
      {
        type: "select",
        key: "REASON",
        title: "DUE TO",
        width: 200,
        defaultValue: null,
        options: [
          { value: "performance", label: "A/C PERF" },
          { value: "weather", label: "WX" },
        ],
      },
    ],
  ],
};

const OFFSET = {
  key: "OFFSET",
  menu: "OFFSET",
  title: "OFFSET REQUEST",
  onSubmit: (values) => {
    return AcarsService.withClient((cl) =>
      cl.sendOffsetRequest(values.OFFSET, values.REASON, ""),
    );
  },
  dryRunFunc: (values) => {
    return AcarsService.withClientPs((cl) =>
      cl.sendOffsetRequest(values.OFFSET, values.REASON, "", true),
    );
  },
  fields: [
    [
      {
        type: "default",
        key: "OFFSET",
        title: "OFFSET",
        inline: true,
        xOffset: 80,
        regex: /[LR]{1}[0-9]{1,2}/,
        size: 3,
        defaultValue: "\u25AF".repeat(3),
        width: 70,
      },
    ],
    null,
    null,
    null,
    [
      {
        type: "select",
        key: "REASON",
        title: "DUE TO",
        width: 200,
        defaultValue: null,
        options: [
          { value: "performance", label: "A/C PERF" },
          { value: "weather", label: "WX" },
          { value: "traffic", label: "TRAFFIC" },
        ],
      },
    ],
  ],
};

const SPDCHG = {
  key: "SPDCHG",
  menu: "SPEED",
  title: "SPEED REQUEST",
  onSubmit: (values) => {
    if (!values || typeof values.SPD !== "string") return false;
    const isMach =
      values.SPD.startsWith("M") ||
      values.SPD.includes(".") ||
      values.SPD.startsWith("0");
    return AcarsService.withClient((cl) =>
      cl.sendSpeedChange(
        values.SPD.startsWith("M") ? values.SPD.substr(1) : values.SPD,
        isMach ? "mach" : "knots",
        values.REASON,
        concatFreeText(values, 4),
      ),
    );
  },
  dryRunFunc: (values) => {
    if (!values || typeof values.SPD !== "string") return Promise.resolve(null);
    const isMach =
      values.SPD.startsWith("M") ||
      values.SPD.includes(".") ||
      values.SPD.startsWith("0");
    return AcarsService.withClientPs((cl) =>
      cl.sendSpeedChange(
        values.SPD.startsWith("M") ? values.SPD.substr(1) : values.SPD,
        isMach ? "mach" : "knots",
        values.REASON,
        concatFreeText(values, 4),
        true,
      ),
    );
  },
  fields: [
    [
      {
        type: "default",
        key: "SPD",
        title: "SPEED",
        width: 110,
        size: 4,
        inline: true,
        xOffset: 85,
        defaultValue: "----",
        regex: /[M\.0-9]{1,6}/,
      },
    ],

    null,
    null,
    null,
    [
      {
        type: "select",
        key: "REASON",
        title: "DUE TO",
        width: 200,
        defaultValue: null,
        options: [
          { value: "performance", label: "A/C PERF" },
          { value: "weather", label: "WX" },
        ],
      },
    ],
  ],
};
const dtoPages = {
  none: [[]],
  navaid: [
    [
      {
        type: "default",
        key: "VALUE",
        title: "",
        width: 90,
        size: 4,
        inline: true,
        xOffset: 200,
        defaultValue: "---",
        regex: /[A-Z]{3}/,
      },
    ],
  ],
  airport: [
    [
      {
        type: "default",
        key: "VALUE",
        title: "",
        width: 100,
        size: 4,
        inline: true,
        xOffset: 200,
        defaultValue: "----",
        regex: /[A-Z]{4}/,
      },
    ],
  ],
  fix: [
    [
      {
        type: "default",
        key: "VALUE",
        title: "",
        width: 130,
        size: 5,
        inline: true,
        xOffset: 200,
        defaultValue: "-----",
        regex: /[A-Z0-9]{3,8}/,
      },
    ],
  ],
  latlon: [
    [
      {
        key: "----",
        width: 140,
      },
      {
        type: "default",
        key: "LAT",
        title: "LAT",
        width: 160,
        size: 6,
        inline: true,
        xOffset: 45,
        alter: (v) => v.substr(0, 3) + "°" + v.substr(3),
        defaultValue: () => "---°--.--",
        regex: /[NS]{1}[0-9]{4}\.[0-9]{2}/,
      },
    ],
    [
      {
        key: "----",
        width: 140,
      },
      {
        type: "default",
        key: "LON",
        title: "LON",
        width: 160,
        size: 7,
        inline: true,
        xOffset: 45,
        alter: (v) => v.substr(0, 4) + "°" + v.substr(4),
        defaultValue: () => "----°--.--",
        regex: /[EW]{1}[0-9]{5}\.[0-9]{2}/,
      },
    ],
  ],
};
const DIRTO = {
  key: "DIRTO",
  menu: "ROUTE",
  title: "ROUTE REQUEST",
  onSubmit: (values) => {
    return AcarsService.withClient((cl) =>
      cl.sendDirectTo(values, values.REASON, concatFreeText(values, 4)),
    );
  },
  dryRunFunc: (values) => {
    return AcarsService.withClientPs((cl) =>
      cl.sendDirectTo(values, values.REASON, concatFreeText(values, 4), true),
    );
  },
  fields: [
    [
      {
        type: "dselect",
        key: "TYPE",
        title: "DIRECT TO POS",
        width: 200,
        inline: true,
        xOffset: 200,
        defaultValue: null,
        pages: dtoPages,
        regex: /[a-z]{1,15}/,
        options: [
          { value: "", label: "NONE" },
          { value: "navaid", label: "NAVAID" },
          { value: "airport", label: "AIRPORT" },
          { value: "fix", label: "FIX" },
          { value: "latlon", label: "LAT/LON" },
        ],
      },
    ],
    [
      {
        type: "subPageResolver",
        key: "TYPE_RES",
        resolveKey: "TYPE",
        pages: dtoPages,
      },
    ],

    null,
    null,
    [
      {
        type: "select",
        key: "REASON",
        title: "DUE TO",
        width: 200,
        defaultValue: null,
        options: [
          { value: "performance", label: "A/C PERF" },
          { value: "weather", label: "WX" },
        ],
      },
    ],
  ],
};

export const AOC = [PDC, OCEANIC, WX, FREETEXT];
export const ATC = [LVLCHG, OFFSET, SPDCHG, DIRTO, POSREPORT];
