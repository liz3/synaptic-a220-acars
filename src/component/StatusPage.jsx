import AcarsService from "../common/AcarsService.mjs";
import { convertUnixToHHMM } from "../common/Hoppie.mjs";

const depAirport = () => {
  const { active } = reactUtils.state.getState();
  if (active && active.origin && active.origin.airport) {
    const icao = active.origin.airport.ident;
    if (typeof icao === "string") return icao;
  }
  return "----";
}

const arrivalAirport = () => {
  const { active } = reactUtils.state.getState();
  if (active && active.destination && active.destination.airport) {
    const icao = active.destination.airport.ident;
    if (typeof icao === "string") return icao;
  }
  return "----";
}

const StatusPage = () => {
  const { TextField, Button, Line } = ui;
  const [facilty, setFacility] = reactUtils.useState("");

  const [activeFac, setActiveFac] = reactUtils.useState(
    AcarsService.centerState.active,
  );
  const [pendingFac, setPendingFac] = reactUtils.useState(
    AcarsService.centerState.pending,
  );
  const [notified, setNotified] = reactUtils.useState(null);
  reactUtils.useEffect(() => {
    const listener = (state) => {
      setActiveFac(state.active);
      setPendingFac(state.pending);
    };
    AcarsService.onStatus(listener);
    return () => AcarsService.offStatus(listener);
  }, [setActiveFac]);
  return (
    <>
      <text className="ContentText White" x={10} y={155}>
        LOGON/STATUS
      </text>

      
      <text className="LabelText Gray" x={30} y={200}>
        NETWORK
      </text>
      <text className="LargeText White" x={170} y={200}>
        LINK 2000+
      </text>
      
      
      <text className="LabelText Gray" x={30} y={260}>
        CDA
      </text>
      <text className="LargeText White" x={170} y={260}>
        {activeFac || "----"}
      </text>

      <text className="LabelText Gray" x={30} y={300}>
        NDA
      </text>
      <text className="LargeText White" x={170} y={300}>
        {pendingFac || "----"}
      </text>

      <text className="LabelText Gray" x={30} y={360}>
        DEPT
      </text>
      <text className="LargeText White" x={170} y={360}>
        {depAirport()}
      </text>

      <text className="LabelText Gray" x={30} y={400}>
        ARR
      </text>
      <text className="LargeText White" x={170} y={400}>
        {arrivalAirport()}
      </text>

      <text className="LabelText Gray" x={30} y={470}>
        FLT ID
      </text>
      <text className="LargeText White" x={170} y={470}>
        {AcarsService._client ? AcarsService._client.callsign : "----"}
      </text>

      <text className="LabelText Gray" x={30} y={575}>
        LOGON TO
      </text>
      <TextField
        width={120}
        size={8}
        regex={/[A-Z0-9]{4}/}
        x={180}
        y={550}
        value={facilty}
        onSubmit={(v) => {
          setFacility(v);
        }}
        onDelete={() => setFacility("")}
      />
      <text className="LargeText White" x={200} y={640}>
        {pendingFac && notified
          ? `${pendingFac} NOTIFIED ${convertUnixToHHMM(notified)}Z`
          : ""}
      </text>
      <Button
        x={20}
        y={680}
        disabled={(typeof activeFac !== "string" || activeFac.length === 0) && facilty.length === 0}
        width={220}
        onClick={() => {
          AcarsService.withClient((client) => {
            if (activeFac && activeFac.length) client.sendLogoffRequest();
            else {
              client.sendLogonRequest(facilty);
              setNotified(new Date());
            }
          });
        }}
      >
        {activeFac ? "LOGOFF" : pendingFac ? "NOTIFY AGAIN" : "SEND LOGON"}
      </Button>

    </>
  );
};
export default StatusPage;
