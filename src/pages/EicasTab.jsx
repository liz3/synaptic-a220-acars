import AcarsService from "../common/AcarsService.mjs";
import { convertUnixToHHMM } from "../common/Hoppie.mjs";
import UplinkArrow from "../component/Arrow";
import ReloadBtn from "../component/ReloadBtn";
const idxFromResp = (message) => {
  if (message.responseIndex === 0) return 0;
  if (message.responseIndex === 1) return 3;
  if (message.responseIndex === 2) return 1;
  return 0;
};
const Flag = ({}) => {
  const { OffsetBox } = ui;
  return (
    <OffsetBox y={0} x={360}>
      <rect
        width={105}
        height={38}
        stroke={"none"}
        fill={reactUtils.colors.Cyan}
        strokeLinejoin={"round"}
      />
      <text x={53} y={30} className="ContentText JustifyCenter" color="black">
        CPDLC
      </text>
    </OffsetBox>
  );
};
const FlagDlk = ({}) => {
  const { OffsetBox } = ui;
  return (
    <OffsetBox y={0} x={250}>
      <rect
        width={105}
        height={38}
        stroke={"none"}
        fill={reactUtils.colors.Cyan}
        strokeLinejoin={"round"}
      />
      <text x={53} y={30} className="ContentText JustifyCenter" color="black">
        DLK
      </text>
    </OffsetBox>
  );
};
const ButtonBlock = ({ x, y, w, h, active, children }) => {
  const { OffsetBox } = ui;

  return (
    <OffsetBox x={x} y={y}>
      <rect
        width={w}
        height={h}
        stroke={"none"}
        fill={active ? reactUtils.colors.Cyan : "transparent"}
        strokeLinejoin={"round"}
      />
      <text
        x={4}
        y={24}
        className="ContentText"
        color={active ? "black" : "#848484"}
      >
        {children}
      </text>
    </OffsetBox>
  );
};
const getNum = (message, list) => {
  const f = list.find((n) => n._id === message._id);
  return f ? list.indexOf(f) + 1 : 1;
};
const EicasTab = ({}) => {
  const { OffsetBox } = ui;
  const { useEffect, useState, useMemo } = reactUtils;
  const fmsOne = reactUtils.zustandUseState(
    reactUtils.fmsState,
    (state) => state.fms1,
  );
  const fmsTwo = reactUtils.zustandUseState(
    reactUtils.fmsState,
    (state) => state.fms2,
  );
  const [message, setMessage] = useState(null);
  const [anyUnread, setAnyUnread] = useState(false);
  const [dlkUnread, setDlkUnread] = useState(false);
  const [unread, setUnread] = useState([]);
  const [activeStation, setActiveStation] = useState(false);
  useEffect(() => {
    const listener = (msg) => {
      setAnyUnread(
        AcarsService.messages.some(
          (e) => e.type !== "send" && e.cpdlc && !e.viewed,
        ),
      );
      setDlkUnread(
        AcarsService.messages.some(
          (e) => e.type !== "send" && !e.cpdlc && !e.viewed,
        ),
      );
      if (message && msg._id === message._id) {
        const unread = AcarsService.messages.filter(
          (e) => e.type !== "send" && e.cpdlc && e.options && !e.respondSend,
        );

        setUnread(unread);
        setMessage(unread.length > 0 ? unread[0] : null);
      }
    };
    const statusListener = (state) => {
      setActiveStation(state.active);
    };

    const newMessageListener = (newMsg) => {
      setAnyUnread(
        (v) => v || (newMsg.type !== "send" && newMsg.cpdlc !== undefined),
      );
      setDlkUnread(
        (v) => v || (newMsg.type !== "send" && newMsg.cpdlc === undefined),
      );
      if (newMsg.cpdlc && newMsg.options && newMsg.type !== "send") {
        const unread = AcarsService.messages.filter(
          (e) => e.type !== "send" && e.cpdlc && e.options && !e.respondSend,
        );

        setUnread(unread);
        if (!message) setMessage(newMsg);
      }
    };

    AcarsService.onMessageUpdate(listener);
    AcarsService.onMessage(newMessageListener);
    AcarsService.onStatus(statusListener);
    return () => {
      AcarsService.offMessageUpdate(listener);
      AcarsService.offMessage(newMessageListener);
      AcarsService.offStatus(statusListener);
    };
  }, [message, setMessage, setDlkUnread]);
  useEffect(() => {
    AcarsService.currentView = {
      message,
      update: (msg, unr) => {
        setMessage(msg);
        setUnread(unr);
      },
    };
    return () => (AcarsService.currentView = null);
  }, [message]);
  const blocks = useMemo(() => {
    if (!message) return [];
    const textList = [];
    let current = [];
    const mwl = 42;
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

    return textList;
  }, [message]);
  if (!fmsOne && !fmsTwo) return null;
  if (!message && !activeStation) {
    return anyUnread || dlkUnread ? (
      <OffsetBox y={881} x={0}>
        {anyUnread ? <Flag /> : null}
        {dlkUnread ? <FlagDlk /> : null}
      </OffsetBox>
    ) : null;
  }
  if (!message)
    return (
      <OffsetBox y={881} x={0}>
        {anyUnread ? <Flag /> : null}
        {dlkUnread ? <FlagDlk /> : null}
        <text className="ContentText White" x={635} y={70}>
          NO MSG
        </text>
        {["ACPT", "STBY", "LOAD", "RJCT", ""].map((name, i) => {
          const active = false;
          if (name === "") {
            return (
              <ReloadBtn
                key={name}
                active={active}
                x={660}
                y={72 + i * 30}
                w={70}
                h={30}
              />
            );
          }
          return (
            <ButtonBlock
              key={name}
              active={active}
              x={660}
              y={72 + i * 30}
              w={70}
              h={30}
            >
              {name}
            </ButtonBlock>
          );
        })}
      </OffsetBox>
    );

  const count =
    (unread.some((e) => e._id === message._id) ? 0 : 1) + unread.length;
  const num = getNum(message, unread);

  return (
  <>
      <Flag />
      {dlkUnread ? <FlagDlk /> : null}
      <text className="ContentText Cyan" x={450} y={70}>
        NEW
      </text>
      <text className="ContentText White" x={550} y={70}>
        {num}
      </text>
      <text className="ContentText White" x={620} y={70}>
        OF
      </text>
      <text className="ContentText White" x={700} y={70}>
        {count}
      </text>
      <UplinkArrow
        x={10}
        y={50}
        up={message.type !== "send"}
        color={reactUtils.colors.Cyan}
      />

      <text className="ContentText Cyan" x={26} y={70}>
        UTC {convertUnixToHHMM(new Date(message.ts))}-{message.from}
      </text>
      {blocks.slice(0, 4).map((content, i) => (
        <text key={i} className="ContentText White" x={10} y={105 + i * 25}>
          {content}
          {i == 3 && blocks.length > 4 ? "..." : ""}
        </text>
      ))}

      {["ACPT", "STBY", "LOAD", "RJCT", ""].map((name, i) => {
        if (name === "") {
          return (
            <ReloadBtn
              key={name}
              active={count > 1}
              x={660}
              y={72 + i * 30}
              w={70}
              h={30}
            />
          );
        }
        const active = message.respondSend
          ? i === idxFromResp(message)
          : i !== 2
            ? message.options && !message.respondSend
            : false;
        return (
          <ButtonBlock
            key={name}
            active={active}
            x={660}
            y={72 + i * 30}
            w={70}
            h={30}
          >
            {name}
          </ButtonBlock>
        );
      })}
    </>
  );
};

const createEicasTab = (node, createRoot) => {
  if (!node || !createRoot) return;
  const root = node.children[0].children[0].instance;
  const n = document.createElementNS("http://www.w3.org/2000/svg", "g");
  n.setAttribute("transform", "translate(0, 881) rotate(0) scale(1)");
  root.parentNode.appendChild(n);
  const r = createRoot(n);
  r.render(<EicasTab />);
};

export default createEicasTab;
