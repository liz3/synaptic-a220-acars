
import { ATS } from "../common/AcarsMenus.mjs";
import AcarsService from "../common/AcarsService.mjs";
import { convertUnixToHHMM } from "../common/Hoppie.mjs";
import { cloneArraySafe } from "../common/utils.mjs";

const AcarsMessageLog = ({ onSubmit, latest, onLatest }) => {
  const { useMemo, useState, useEffect } = reactUtils;
  const { Button, OffsetBox } = ui;
  const [messages, setMessages] = useState([]);
  const pages = Math.floor( messages.length / 5)+1;
  const [activePage, setActivePage] = useState(0);
  const btnPressed = (s, r) => {
    if (s === "l" && r === 5) {
         onSubmit("menu", ATS);
      return;
    }
    if (s === "r" && r === 5) {
      if (latest) {
        onLatest();
      }
      return;
    }
    const message = messages[activePage * 5 + r];
    if(message)
    onSubmit("message", message);
  };
  reactUtils.useEffect(() => {
    const list = AcarsService.messages.filter(e => {
      if (e.cpdlc)
        return false;
      return (!e.subType || e.subType === "PDC");
    })
    setMessages(list);
    const onMessage = msg => {
      if (!msg.cpdlc && (!msg.subType ||  msg.subType === "PDC")) {
        setMessages(messages => {
          messages.unshift(msg);
          return cloneArraySafe(messages);
        })
      }
    }

    AcarsService.onMessage(onMessage)
    return () => {
      AcarsService.offMessage(onMessage)
    }
  }, [setMessages])
  return (
    <>
      <Button
        x={500}
        y={200}
        width={70}
        disabled={pages === 1}
        onClick={() => {
          if (activePage > 0) setActivePage(activePage - 1);
        }}
      >
        PREV
      </Button>
      <Button
        x={575}
        y={200}
        width={75}
        disabled={pages === 1}
        onClick={() => {
          if (activePage < pages - 1) setActivePage(activePage + 1);
        }}
      >
        NEXT
      </Button>
      {Array(6)
        .fill()
        .map((_, i) => {
          return (
            <Button
              key={i}
              x={80}
              y={335 + i * 100}
              width={90}
              onClick={() => {
                btnPressed("l", i);
              }}
            >
              {" "}
            </Button>
          );
        })}
      {Array(6)
        .fill()
        .map((_, i) => {
          return (
            <Button
              key={i}
              x={610}
              y={335 + i * 100}
              width={90}
              onClick={() => {
                btnPressed("r", i);
              }}
            >
              {" "}
            </Button>
          );
        })}
      <text className="ContentText White" x={240} y={290}>
        ATS -ATS LOG
      </text>

      <text className="ContentText White" x={450} y={290}>
        {activePage + 1}/{pages}
      </text>
      <text className="ContentText White" x={210} y={855}>{`<RETURN`}</text>
      {latest ? (
        <text className="ContentText LightBlue" x={520 - (AcarsService.aocMessageStr(latest)).length * 7.6} y={855}>{`${AcarsService.aocMessageStr(latest)}*`}</text>
      ) : null}
      {messages.slice(activePage * 5, activePage*5 + 5).map((msg, i) => {
        return (
          <OffsetBox x={220} y={350 + i * 100} key={i}>
            <text className="ContentText Lime" x={0} y={0}>
              {convertUnixToHHMM(new Date(msg.ts))} {msg.type === "send" ? "SEND" : AcarsService.messageViewStr(msg)}
            </text>
            <text className="ContentText White" x={0} y={25}>
              {`<${msg.content.split(" ")[0]}`}
            </text>
          </OffsetBox>
        );
      })}
    </>
  );
};
export default AcarsMessageLog;