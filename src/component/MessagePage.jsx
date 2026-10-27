import AcarsService from "../common/AcarsService.mjs";
import { convertUnixToHHMM } from "../common/Hoppie.mjs";
import { cloneObjectSafe } from "../common/utils.mjs";
import UplinkArrow from "./Arrow";
import RejectField from "./RejectField";

const OPTS = ["ACCEPT", "STANDBY", "REJECT"];
const mapToCorrectOption = (opts, i) => {
  if (i == 2)
    return opts[1]
  if (i == 1)
    return opts[2]
  return opts[0]
}
const MessagePage = ({ message: messageIn }) => {
  const [message, setMessage] = reactUtils.useState(messageIn);
  const { useMemo, useEffect } = reactUtils;
  const { Button } = ui;
  useEffect(() => {
    AcarsService.refreshReadState(message._id, true);
    const listener = msg => {
      if (msg._id === message._id)
        setMessage(cloneObjectSafe(msg));
    }

    window.acarsRefreshMessage = null;
    AcarsService.onMessageUpdate(listener)
    return () => {
      AcarsService.offMessageUpdate(listener)
    }
  }, [message, setMessage])
  const blocks = useMemo(() => {
    const textList = [];
    let current = [];
    const mwl = 45;
    for (const word of message.content.split(" ")) {
      current.push(word);
      const j = current.join(" ");
      if (j.length > mwl) {
        const l = current.pop();
        if (current.length)
          textList.push(current.join(" "));
        if (l.length >= mwl) {
          textList.push(l);
          current = [];
        } else { 
          current = [l];
        }
      }
    }
    textList.push(current.join(" "))

    return textList;
  }, [message])
  const needsResponse = Array.isArray(message.options) && !message.respondSend;
  return <>
    <rect x={2} fill={"#232323"} y={130} height={25} width={730} />
    
    <UplinkArrow x={10} y={130} up={message.type !== "send"} color={!needsResponse && message.viewed ? "White" : reactUtils.colors.Cyan} />
    <text className={`ContentText ${needsResponse || !message.viewed ? "Cyan" : "White"}`} x={25} y={150}>UTC  {convertUnixToHHMM(new Date(message.ts))}-{message.from}</text>
    <text className={`ContentText ${needsResponse || !message.viewed ? "Cyan" : "White"}`} x={needsResponse ? 660 : 600} y={150}>{needsResponse ? "OPEN" : AcarsService.messageViewStr(message)}</text>
    {blocks.map((content, i) => <text key={i} className={`ContentText ${needsResponse ? "Lime" : "White"}`} x={10} y={180 + (i * 25)}>{content}</text>)}
    {message.respondSend ? <text className="ContentText White" x={10} y={180 + ((blocks.length + 2) * 25)}>RESPONSE HISTORY</text> : null}
    {message.respondSend ? <text className="ContentText White" x={10} y={180 + ((blocks.length + 3) * 25)}>{message.respondSend}</text> : null}
    {needsResponse ? message.options.map((option, i) => {
      if (i === 2)
        return null;
      return <Button key={option} x={560} y={660 + 60 * i} width={160} onClick={() => {
        AcarsService.sendMessageResponse(message, mapToCorrectOption(message.options, i));
      }}>{OPTS[i]}</Button>
    }) : null}
    {needsResponse ? <RejectField x={4} y={800} w={724} h={260} options={[{ value: "performance", label: "DUE TO A/C PERF" }, { value: "weather", label: "DUE TO WX" }]} onSubmit={(v) => {
      AcarsService.sendMessageResponse(message, mapToCorrectOption(message.options, 2), v);
    }} /> : null}
  </>
}
export default MessagePage;