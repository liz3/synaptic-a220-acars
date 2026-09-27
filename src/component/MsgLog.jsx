import AcarsService from "../common/AcarsService.mjs";
import { convertUnixToHHMM } from "../common/Hoppie.mjs";
import { cloneArraySafe } from "../common/utils.mjs";
import UplinkArrow from "./Arrow";


const MessageListEntry = ({ x, y, msg, onOpen }) => {
  const [hover, setHover] = reactUtils.useState(false);
  const { OffsetBox } = ui;


  const bw = 700;
  const bh = 70;
  const stateStr = AcarsService.messageViewStr(msg);
  const m = msg.type === "send" || msg.viewed ? "White" : "Cyan";
  return <OffsetBox x={x} y={y} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onOpen()}>
    <UplinkArrow x={0} y={0} up={msg.type !== "send"} color={msg.type === "send" || msg.viewed ? "White" : reactUtils.colors.Cyan} />
    <text className={`ContentText ${m}`} x={14} y={20}>UTC  {convertUnixToHHMM(new Date(msg.ts))}-{msg.from.toUpperCase()}</text>
    <text className={`ContentText ${m}`} x={600 - (stateStr.length * 10)} y={20}>{stateStr}</text>
    <text className="ContentText White" x={2} y={44}>{msg.content.substr(0,23)}</text>

    <rect x={0} width={bw} y={0} height={bh} stroke={hover ? reactUtils.colors.Cyan : "transparent"} strokeWidth={2} fill="transparent" />
  </OffsetBox>
}
const MsgLog = ({onOpen, type}) => {
  const { Line, ScrollArea, DropdownSelect } = ui;
  const x = 4;
  const y = 185;
  const width = 716;
  const height = 885;
  const [listPos, setListPos] = reactUtils.useState(0);
  const [filter, setFilter] = reactUtils.useState(AcarsService.logFilter || "all")
  const [messages, setMessages] = reactUtils.useState([]);
  reactUtils.useEffect(() => {
    const list = AcarsService.messages.filter(e => {
      const t = (type === "atc" ? e.cpdlc : !e.cpdlc)
      if (!t)
        return false;
      if (filter === "all")
        return true;
      return filter === "recv" ? e.type !== "send" : e.type === "send";
    })
    setMessages(list);
    const onMessage = msg => {
      if ((msg.cpdlc && type === "atc") || (type !== "atc" && !msg.cpdlc)) {
        setMessages(messages => {
          messages.unshift(msg);
          return cloneArraySafe(messages);
        })
      }
    }
    const onUpdate = msg => {
      setMessages(messages => {
        let found = false;
        for (let i = 0; i < messages.length; i += 1){
          if (messages[i]._id === msg._id)
            messages[i] = msg;
          found = true;
          break;
        }
        if (found)
          return cloneArraySafe(messages);
        return messages;
      })
    }
    AcarsService.onMessage(onMessage)
    AcarsService.onMessageUpdate(onUpdate)
    return () => {
      AcarsService.offMessage(onMessage)
      AcarsService.offMessageUpdate(onUpdate)
    }
  }, [type, filter])
  return <>
    <Line x1={x} x2={x+width} y1={y} y2={y} />
    <Line x1={x} x2={x+width} y1={y+height} y2={y+height} />
    <Line x1={x} x2={x} y1={y} y2={y+height} />
    <Line x1={x + width} x2={x + width} y1={y} y2={y + height} />
    <text className="LabelText Gray" x={(x+width) - 265} y={160}>
      Filter
    </text>
    <DropdownSelect
      x={(x+width) - 190}
      y={125}
      value={filter}
      options={[
        { value: "all", label: "ALL" },
        { value: "recv", label: "RECV" },
        { value: "send", label: "SEND" },
      ]}
      width={130}
      height={50}
      onSelect={(v) => {
        AcarsService.logFilter = v;
        setFilter(v);
       
      }}
    />
    <ScrollArea x={x + 4} y={y + 4} width={width - 8} height={height - 8} position={listPos} onPositionChange={e => setListPos(e)} childCount={messages.length} childHeight={80} children={messages.map((e, i) => <MessageListEntry onOpen={() => onOpen(e)} x={x+4} y={(i * 80)} key={e._id} msg={e}  />)}  />
  </>
}
export default MsgLog;