import { BASE } from "../common/AcarsMenus.mjs";
import AcarsService from "../common/AcarsService.mjs";
import AcarsFormPage from "../component/AcarsFormPage";
import AcarsMenuPage from "../component/AcarsMenuPage";
import AcarsMessagePage from "../component/AcarsMessage";
import AcarsMessageLog from "../component/AcarsMessageLog";

const Dlk = () => {
  const { Button, Arrow, DropdownMenu } = ui;

  const [Comp, setComp] = reactUtils.useState(() => AcarsMenuPage);
  const [form, setForm] = reactUtils.useState(BASE);
  const [latest, setLatest] = reactUtils.useState(null);
  const scratchPad = reactUtils.zustandUseState(
    reactUtils.scratchPad,
    (s) => s.text,
  );
  reactUtils.useEffect(() => {

    const onMessage = msg => {
      if (!msg.cpdlc && msg.type !== "send") {
        setLatest(msg);
      }
    }

    AcarsService.onMessage(onMessage)
    return () => {
      AcarsService.offMessage(onMessage)
    }
  }, [setLatest])

  const onSubmit = (key, arg, arg2) => {
    if (key === "formSubmit") {
      if (form) {
        const o = form.onSubmit(arg, arg2);
        if (o) {
          AcarsService.removeFormCache(form.key);
          onSubmit(o[0], o[1]);
        }
      }
      return;
    }
    if (key === "default") {
      setForm(BASE);
      setComp(() => AcarsMenuPage);
      return;
    }
    setForm(arg);
    if (key === "message") {
      setComp(() => AcarsMessagePage);
    }
    if (key === "log") {
      setComp(() => AcarsMessageLog);
    }
    if (key === "form") {
      setComp(() => AcarsFormPage);
    }
    if (key === "menu") {
      setComp(() => AcarsMenuPage);
    }
  };
  const onLatest = () => {
    onSubmit("message", latest);
    
    setLatest(null);
  }
  return (
    <>
      {form && Comp ? <Comp latest={latest} onLatest={onLatest} arg={form} onSubmit={onSubmit} /> : null}
      <rect fill={"#232323"} x={190} y={900} width={400} height={40} />
      <text className="ContentText White" x={200} y={930}>
        {scratchPad}
      </text>
    </>
  );
};
export default Dlk;
