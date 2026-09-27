import { ATS } from "../common/AcarsMenus.mjs";
import AcarsService from "../common/AcarsService.mjs";
import { ATIS, PDC, WX } from "../common/Forms";
import { convertUnixToHHMM } from "../common/Hoppie.mjs";

const AcarsMessagePage = ({ arg: message, onSubmit }) => {
  const { useMemo, useState, useEffect } = reactUtils;
  const { Button, OffsetBox } = ui;
  const [activePage, setActivePage] = useState(0);
  const [pdcAccepted, setPdcAccepted] = useState(message.pdc && message.options && message.respondSend);
  const bpages = useMemo(() => {
    const textList = [];
    let current = [];
    const mwl = 26;
    for (const word of message.content.split(" ")) {
      current.push(word);
      const j = current.join(" ");
      if (j.length > mwl) {
        const l = current.pop();
        if (current.length) textList.push(current.join(" "));
        if (l.length >= mwl) {
          textList.push(l);
          current = [];
        } else {
          current = [l];
        }
      }
    }
    textList.push(current.join(" "));
    const pages = [];
    let page = [];
    for (const row of textList) {
      if (page.length === 0) {
        page.push([row]);
      } else {
        if (page.length > 1 && page[page.length - 1].length === 1) {
          page[page.length - 1].push(row);
          if (page.length === 4) {
            pages.push(page);
            page = [];
          }
        } else {
          page.push([row]);
        }
      }
    }
    if (page.length) pages.push(page);
    return pages;
  }, [message]);
  const btnPressed = (s, r) => {
    if (s === "l" && r === 4 && message.pdc && message.options && !message.respondSend) {
      AcarsService.sendMessageResponse(message, message.options[0], null);
      setPdcAccepted(true);
    }
    if (s === "l" && r === 5) {
      if (message.subType)
        onSubmit("menu", ATS)
        else
      onSubmit("log", {});
    }
    if (message.subType) {
      if (s === "r" && r === 4) {
        onSubmit("form", message.pdc ? PDC :  message.subType == "ATIS" ? ATIS : WX);
      }
    }
  };
  useEffect(() => {
    if(message)
    AcarsService.refreshReadState(message._id, true);
  }, [message]);
  return (
    <>
      <Button
        x={500}
        y={200}
        width={70}
        disabled={bpages.length < 2}
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
        disabled={bpages.length < 2}
        onClick={() => {
          if (activePage < bpages.length - 1) setActivePage(activePage + 1);
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
        {message.type === "send" ? "UL" : "DL"}
      </text>
      <text className="ContentText White" x={290} y={290}>
        {message.content.substr(0, 16)}
      </text>

      <text className="LabelText Lime" x={215} y={355}>
        {convertUnixToHHMM(new Date(message.ts))}
      </text>
      <text className="LabelText Lime" x={320} y={355}>
        {pdcAccepted ? "ACCEPTED" : "VIEWED"}
      </text>
      <text className="ContentText White" x={450} y={355}>
        {activePage + 1}/{bpages.length}
      </text>
      <text className="ContentText White" x={210} y={855}>{`<RETURN`}</text>
      {message.subType ? (
        <text className={`ContentText White`} x={528} y={765}>{`REQ>`}</text>
      ) : null}
      {message.pdc && message.options ? (
        <text className="ContentText White" x={200} y={360 + 4 * 100}>{pdcAccepted ? "ACCEPTED" : "*ACCEPT"}</text>
      ) : null}
      <text className="ContentText White" x={200} y={380}>
        {bpages[activePage][0][0]}
      </text>
      {bpages[activePage].slice(1).map((page, i) => {
        return (
          <OffsetBox x={200} y={450 + i * 100} key={i}>
            <text className="ContentText White" x={0} y={0}>
              {page[0]}
            </text>
            <text className="ContentText White" x={0} y={25}>
              {page[1] || ""}
            </text>
          </OffsetBox>
        );
      })}
    </>
  );
};
export default AcarsMessagePage;
