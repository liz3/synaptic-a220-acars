import AcarsService from "../common/AcarsService.mjs";
import SettingsDialog from "./SettingsDialog";

const getTime = () => {
  const d = SimVar.GetSimVarValue("E:ZULU TIME", "Seconds");
  const minutesTotal = d / 60;
  const hrs = Math.floor(minutesTotal / 60);
  const minutes = Math.floor(minutesTotal % 60);

  return `UTC ${hrs.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};
const acId = SimVar.GetSimVarValue("ATC ID", "String")
const SET1 = [
  ["TOP-LEVEL VERSION", "0315-100-454"],
  ["HMI SW VERSION", "6363-100-034"],
  ["CORE SW VERSION", "2550-100-453"],
  ["MSG LIB VERSION", "6854-100-453"],
  ["A/C REGISTRATION", () => {
    if (acId && acId.length)
      return `.${acId}`;
    return ".C-SYNC";
  }],
  ["RIU", "LEFT"],
  ["PRINTER", "UNAVAILABLE"],
  ["OPERATIONAL CONFIG", "ATN"],
];
const SET2 = [
  ["DLCA ACTIVE", "LEFT"],
  ["DLCA XSIDE", "NOT AVAIL"],
  ["CABINET SLOT", "1"],
  ["CABINET SIDE", "LEFT"],
  ["FMS", "CONN/RIGHT"],
  ["PM", "AVAIABLE"],
];
const SET4 = [
  ["CPDLC", "UNAVAILABLE"],
  ["LOGON", "SUCCESSFUL"],


];
const SystemInfo = ({}) => {
  const { OffsetBox, Button } = ui;
  const [time, setTime] = reactUtils.useState(getTime());
  const [failed, setFailed] = reactUtils.useState(AcarsService._client ? AcarsService._client.failed : null);
  const vOffset = 220;
  reactUtils.useEffect(() => {
    const interval = setInterval(() => setTime(getTime()), 30000);
    return () => clearInterval(interval);
  }, [setTime]);

  reactUtils.useEffect(() => {
    const listener = (state) => {
      setFailed(state.failed);
    };
    AcarsService.onStatus(listener);
    return () => AcarsService.offStatus(listener);
  }, [setFailed]);
  const SET3 = [
    ["CPDLC", "AVAILABLE"],
    [
      "LOGON",
      failed === null ? "-" : failed === true ? "FAILED" : "SUCCESSFUL",
    ],
    ["CM", "REGISTERED"],
  ];
  const od = reactUtils.popup();

  return (
    <>
      <text className="ContentText White" x={10} y={155}>
        SYSTEM INFO
      </text>

      <text className="LabelText White" x={10} y={240}>
        TIME
      </text>
      <text className="LabelText White" x={10 + vOffset} y={240}>
        {time}
      </text>

      <Button x={420} y={170} width={150} onClick={() => od(<SettingsDialog />)}>
        SETTINGS
      </Button>

      {SET1.map((entry, i) => (
        <OffsetBox key={entry[0]} x={10} y={300 + i * 45}>
          <text className="LabelText White" x={0} y={0}>
            {entry[0]}
          </text>
          <text className="LabelText White" x={vOffset} y={0}>
            {typeof entry[1] === "function" ? entry[1]() : entry[1]}
          </text>
        </OffsetBox>
      ))}
      {SET2.map((entry, i) => (
        <OffsetBox key={entry[0]} x={390} y={300 + i * 45}>
          <text className="LabelText White" x={0} y={0}>
            {entry[0]}
          </text>
          <text className="LabelText White" x={vOffset-20} y={0}>
            {typeof entry[1] === "function" ? entry[1]() : entry[1]}
          </text>
        </OffsetBox>
      ))}

      <text className="LabelText White" x={120} y={750}>
        ATN STATUS
      </text>
      {SET3.map((entry, i) => (
        <OffsetBox key={entry[0]} x={10} y={780 + i * 45}>
          <text className="LabelText White" x={0} y={0}>
            {entry[0]}
          </text>
          <text className="LabelText White" x={vOffset} y={0}>
            {typeof entry[1] === "function" ? entry[1]() : entry[1]}
          </text>
        </OffsetBox>
      ))}

      <text className="LabelText White" x={495} y={750}>
        FANS STATUS
      </text>
      {SET4.map((entry, i) => (
        <OffsetBox key={entry[0]} x={390} y={780 + i * 45}>
          <text className="LabelText White" x={0} y={0}>
            {entry[0]}
          </text>
          <text className="LabelText White" x={vOffset-20} y={0}>
            {typeof entry[1] === "function" ? entry[1]() : entry[1]}
          </text>
        </OffsetBox>
      ))}
    </>
  );
};

export default SystemInfo;
