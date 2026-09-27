import AcarsService from "../common/AcarsService.mjs";
import { ATC } from "../common/Forms";
import FormPage from "../component/FormPage";
import MessagePage from "../component/MessagePage";
import MsgLog from "../component/MsgLog";
import StatusPage from "../component/StatusPage";
import SystemInfo from "../component/SystemInfo";

const Cpdlc = () => {
  const { Button, Arrow, DropdownMenu } = ui;
  const unread = AcarsService.messages.find(msg => msg.cpdlc && msg.type !== "send" && !msg.viewed);
  const [msg, setMessage] = reactUtils.useState(
    window.acarsRefreshMessage || unread || null,
  );
  const [form, setForm] = reactUtils.useState(null);
  const od = reactUtils.popup();

  // reactUtils.useEffect(() => {
  //   const state = reactUtils.state();
  //   AcarsService.maybeCreateClient(state.callsign);
  // }, [])
  return (
    <>
      <Button
        x={2}
        y={72}
        width={150}
        onClick={() => {
          if (msg) setMessage(null);
          if (form) setForm(null);
        }}
      >
        MSG LOG
      </Button>
      <Button
        x={154}
        y={72}
        width={180}
        onClick={() => {
          od(
            <DropdownMenu
              x={154}
              y={122}
              width={180}
              value={null}
              options={[
                { value: "LOGON", label: "LOGON" },
                { value: "SYS", label: "SYSTEM INFO" },
              ]}
              onSelect={(v) => {
                if (msg) setMessage(null);
                if (v === "SYS") setForm("INFO")
                else setForm("STATUS");
              }}
            />,
          );
        }}
      >
        SETTINGS{" "}
        <Arrow x={160} y={24} width={16} height={14} angle={180} />{" "}
      </Button>
      <Button
        x={154 + 180 + 4}
        y={72}
        width={145}
        onClick={() => {
          od(
            <DropdownMenu
              x={154 + 160 + 4}
              y={120}
              width={170}
              value={null}
              options={ATC.map((e, i) => ({
                value: i,
                label: e.menu ? e.menu : e.title,
              }))}
              onSelect={(v) => {
                if (msg) setMessage(null);

                setForm(ATC[v]);
              }}
            />,
          );
        }}
      >
        REQUEST <Arrow x={125} y={24} width={16} height={14} angle={180} />{" "}
      </Button>
      <Button
        x={154 + 180 + 145 + 8}
        y={72}
        width={145}
        onClick={() => { }}
        disabled={true}
      >
       REPORT <Arrow x={125} y={24} width={16} height={14} angle={180} />{" "}
      </Button>
      {msg ? (
        <MessagePage message={msg} />
      ) : form ? (
        form === "STATUS" ? (
          <StatusPage />
        ) : form === "INFO" ? <SystemInfo /> : (
          <FormPage
            title={form.title}
            formKey={form.key}
            dryRunFunc={form.dryRunFunc}
            fields={form.fields}
            yOffset={form.yOffset}
            onCancel={(v) => setForm(null)}
            onSubmit={(values) => {
              if (form.onSubmit(values)) {
                AcarsService.removeFormCache(form.key);
                setForm(null);
              }
            }}
          />
        )
      ) : (
        <MsgLog type={"atc"} onOpen={(msg) => setMessage(msg)} />
      )}
    </>
  );
};
export default Cpdlc;
