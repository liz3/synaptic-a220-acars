import AcarsService from "../common/AcarsService.mjs";

const SettingsDialog = ({}) => {
  const { Dialog, Button, DropdownSelect, TextField } = ui;
  const { useState, useEffect } = reactUtils;
  const networkValueRaw = Number.parseInt(GetStoredData("a220Acars.network"));
  const [network, setNetwork] = useState(
    !Number.isNaN(networkValueRaw) ? networkValueRaw : 0,
  );
  const [logon, setLogon] = useState(GetStoredData("a220Acars.logon"));
    const [cs, setCS] = useState(AcarsService._client ? AcarsService._client.callsign : "----");
  const [showCode, setShowCode] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    let iff = null;
    if (active) {
      iff = document.createElement("input");
      iff.style.position = "absolute";
      iff.style.opacity = 0;
      document.body.appendChild(iff);
      iff.focus();
      const id = `${Date.now()}--hoppie-input`;
      Coherent.trigger("FOCUS_INPUT_FIELD", id, "", "", "", false);
      let s = false;
      iff.addEventListener("input", () => {
        Coherent.trigger("UNFOCUS_INPUT_FIELD", id);
        setLogon(iff.value);
        setActive(false);
        s = true;
        SetStoredData("a220Acars.logon", iff.value);
        iff.remove();
        iff = null;
      });
      iff.addEventListener("blur", (event) => {
        if (s) return;
        event.target.remove();
        Coherent.trigger("UNFOCUS_INPUT_FIELD", id);
        setActive(false);
        iff.remove();
        iff = null;
      });
      return () => {
        if (iff) iff.remove();
      };
    }
  }, [setLogon, active]);
  return (
    <Dialog header={"CPDLC SETTINGS"} x={280} y={220} width={400} height={400}>
      <text className="LabelText Gray" x={20} y={55}>
        LOGON Code
      </text>
      <text className="ContentText White" x={20} y={85}>
        {logon && logon.length
          ? showCode
            ? logon
            : "*".repeat(logon.length)
          : ""}
      </text>
      <Button
        x={20}
        y={105}
        width={140}
        onClick={() => {
          if (active) return;
          setActive(true);
        }}
      >
        {active ? "PASTE NOW" : "SET NEW"}
      </Button>
      <Button
        x={190}
        y={105}
        width={160}
        onClick={() => {
          setShowCode(!showCode);
        }}
      >
        {showCode ? "HIDE CODE" : "SHOW CODE"}
      </Button>
      <DropdownSelect
        x={20}
        y={170}
        value={network}
        options={[
          { value: 0, label: "HOPPIE" },
          { value: 1, label: "SAYINTENTIONS.AI" },
          { value: 2, label: "BEYONDATC" },
        ]}
        width={320}
        height={50}
        onSelect={(v) => {
          setNetwork(v);
          SetStoredData("a220Acars.network", `${v}`);
        }}
      />

      <TextField value={cs} onSubmit={v => setCS(v)} width={150} x={20} y={255} size={8} regex={/[A-Z0-9]{1,7}/} />
      <Button
        x={220}
        y={250}
        width={120}
        onClick={() => {
          if (AcarsService._client) {
            AcarsService._client.dispose();
            AcarsService._client = null;
            setCS("");
            return;
          }
          const csc = cs;
          setCS("");
          setCS(csc);
          AcarsService.maybeCreateClient(cs);
        }}
      >
        {AcarsService._client && !AcarsService._client.failed ? "LOGOFF" : "LOGON"}
      </Button>
    </Dialog>
  );
};
export default SettingsDialog;
