import { createClient } from "./Hoppie.mjs";

const Sv = SimVar.SetSimVarValue;
class AcarsService {
  constructor() {
    this.formCache = {};
    this.messageListeners = [];
    this.statusListeners = [];
    this.msgUpdateListeners = [];
    this.messages = [];
    this.centerState = {
      pending: "",
      active: "",
    };
    this.unread = {
      atc: false,
      aoc: false,
    };
  }

  async simbriefFetch() {
    try {
      const { id } = JSON.parse(GetStoredData("A22X::Simbrief User"));
      if (!id) return;
      const response = await fetch(
        `https://www.simbrief.com/api/xml.fetcher.php?json=1&userid=${id}`,
      );
      const json = await response.json();
      if (json.fetch && json.fetch.status === "Success") {
        const general = json.general;
        const atc = json.atc;
        const times = json.times;
        this.sbState = {
          fltNumber: general.flight_number,
          origin: json.origin ? json.origin.icao_code : "",
          arrival: json.destination ? json.destination.icao_code : "",
          airline:
            typeof general.icao_airline === "string"
              ? general.icao_airline
              : "",
          sched: new Date(Number.parseInt(times.sched_out) * 1000),
          schedOn: new Date(Number.parseInt(times.sched_in) * 1000),
          enroute: Number.parseInt(times.sched_time_enroute),
          callsign: atc ? atc.callsign : null
        };
        return this.sbState;
      }
    } catch (e) { }
    return null;
  }
  registerEventHandlers() {

    readyCallbacks.push(() => {
      console.log("readyCallbacks");
      reactUtils.tcasState.subscribe((active) => {
        if (active && active.id && active.id.length) {
          if (!this._client || this._client.callsign !== active.id) {
            
            this.maybeCreateClient(active.id);
          }
        }
      });

      reactUtils.state.subscribe(
        (st) => st.active,
        (active) => {
          if (active && active.origin && active.origin.airport) {
            const icao = active.origin.airport.ident;
            if (typeof icao === "string") {
              if (
                this.staIcao &&
                this.staIcao.length &&
                icao !== this.staIcao
              ) {
                this.messages = [];
              }
              this.staIcao = icao;
            }
          }
        },
      );
    });
    document.addEventListener("A220_FCU_CPDLC_ACPT", (ev) => {
      if (this.currentView) {
        const { message } = this.currentView;
        if (!message.respondSend && message.options)
          this.sendMessageResponse(message, message.options[0]);
      }
    });
    document.addEventListener("A220_FCU_CPDLC_STBY", (ev) => {
      if (this.currentView) {
        const { message } = this.currentView;
        if (!message.respondSend && message.options)
          this.sendMessageResponse(message, message.options[2]);
      }
    });
    document.addEventListener("A220_FCU_CPDLC_RJCT", (ev) => {
      if (this.currentView) {
        const { message } = this.currentView;
        if (!message.respondSend && message.options)
          this.sendMessageResponse(message, message.options[1]);
      }
    });
    document.addEventListener("A220_FCU_CPDLC_LOAD", (ev) => {});
    document.addEventListener("A220_FCU_CPDLC_REFRESH", (ev) => {
      const messages = this.messages.filter(
        (e) => e.cpdlc && e.type !== "send",
      );
      if (!messages.length) {
        if (this.currentView && this.currentView.message) {
          this.currentView.update(null, []);
        }
        return;
      }
      const unread = messages.filter(
        (e) => (!e.respondSend && e.options),
      );
      if (unread.length > 0) {
        if (this.currentView) {
          if (!this.currentView.message) {
            this.currentView.update(unread[0], unread);
          } else {
            const f = unread.find(
              (e) => e._id === this.currentView.message._id,
            );
            if (f) {
              const n = unread.indexOf(f) + 1;
              this.currentView.update(
                unread[n === unread.length ? 0 : n],
                unread,
              );
            } else {
              this.currentView.update(unread[0], unread);
            }
          }
        }
      } else {
        if (this.currentView && this.currentView.message) {
          this.currentView.update(null, []);
        }
      }
    });
  }
  withClient(cb) {
    if (this._client) {
      cb(this._client);
      return true;
    }
    return false;
  }
  withClientPs(cb) {
    if (this._client) {
      return cb(this._client);
    }
    return null;
  }
  formCacheEntry(key) {
    return this.formCache[key];
  }
  setFormCache(key, value) {
    this.formCache[key] = value;
  }
  removeFormCache(key) {
    delete this.formCache[key];
  }
  onMessage(listener) {
    this.messageListeners.push(listener);
  }
  offMessage(listener) {
    this.messageListeners = this.messageListeners.filter((e) => e !== listener);
  }
  onStatus(listener) {
    this.statusListeners.push(listener);
  }
  offStatus(listener) {
    this.statusListeners = this.statusListeners.filter((e) => e !== listener);
  }
  onMessageUpdate(listener) {
    this.msgUpdateListeners.push(listener);
  }
  offMessageUpdate(listener) {
    this.msgUpdateListeners = this.msgUpdateListeners.filter(
      (e) => e !== listener,
    );
  }

  tryFetchDepAtis(icao) {
    return new Promise((resolve) => {
      const isCl = this.withClient(cl => {
        cl.atisRequestDirect(icao, "ATIS", "D").then((resp) => {
          const [success, list] = resp;
          if(success && list.length === 1) {
            const out = list[0].content.match(/ ([A-Z]{1}) /)
            if (out) {
              resolve(out[1])
            } else {
              resolve(null);
            }
          }
        })
      })
      if (!isCl)
        resolve(null);
    })
  }
  aocMessageStr(message) {
    if (message.pdc && message.options) {
      return "DEP CLX";
    }
    if (message.subType === "ATIS")
      return "ATIS";
    return "MESSAGE";
  }
  sendMessageResponse(message, opt, v) {
    if (!message.options.includes(opt)) return;
    const orig = this.messages.find((e) => e._id === message._id);
    if (!orig) return;
    this.refreshReadState(orig._id);
    orig.response(opt, v).then(() => {
      this.msgUpdateListeners.forEach((l) => l(orig));
    });
  }
  refreshReadState(id, update = false) {
    if (typeof id === "number") {
      const m = this.messages.find((e) => e._id === id);
      if (m && !m.viewed) {
        m.viewed = true;
        if (update)
          this.msgUpdateListeners.forEach((l) => l(m));

          
      }
    }
    this.unread = {
      atc: this.messages.some(
        (msg) => msg.type !== "send" && msg.cpdlc && !msg.viewed,
      ),
      aoc: this.messages.some(
        (msg) => msg.type !== "send" && !msg.cpdlc && !msg.viewed,
      ),
    };
  }
  maybeCreateClient(callsign) {
    if (!callsign || callsign.length === 0) {
      if (this._client) {
        this._client.dispose();
        this._client = null;
      }
      return;
    }
    const networkValueRaw = Number.parseInt(GetStoredData("a220Acars.network"));
    this.init(
      GetStoredData("a220Acars.logon"),
      callsign,
      "BCS3",
      !Number.isNaN(networkValueRaw) ? networkValueRaw : 0,
    );
  }
  messageViewStr(msg) {
    if (msg.respondSend) {
      const opts = ["ACCEPTED", "REJECTED", "STANDBY"];
      return typeof msg.responseIndex === "number"
        ? opts[msg.responseIndex]
        : message.respondSend;
    }
    if (msg.options) return "NEEDS RESPONSE";
    return msg.viewed || msg.type === "send" ? "CLOSED" : "NEW";
  }
  init(logon, callsign, acType = "BCS3", networkNumber = 0) {
    const s = ["hoppie", "sayintentions", "beyondatc"];
    if (this._client) {
      this._client.dispose();
      this._client = null;
    }
    this._client = createClient(
      logon,
      callsign,
      acType,
      (msg) => {
        if (msg.cpdlc && msg.type !== "send") {
          Sv("L:LIZ3_A22X_ACS_NOTIF", "Number", 1);
          if (this.soundTm) clearTimeout(this.soundTm);
          this.soundTm = setTimeout(() => {
            Sv("L:LIZ3_A22X_ACS_NOTIF", "Number", 0);
            this.soundTm = 0;
          }, 700);
        }
        msg.viewed = false;
        this.messages.unshift(msg);
        this.messageListeners.forEach((l) => l(msg));
        this.refreshReadState(null);
      },
      s[networkNumber],
    );
    this._client._stationCallback = (state) => {
      this.centerState = state;
      this.statusListeners.forEach((l) => l(state));
    };
  }
}
export default new AcarsService();
