const UplinkArrow = ({ x, y, length = 22, up = true, sLeng = 10, color }) => {
  const { OffsetBox } = ui;

  return (
    <OffsetBox x={x} y={y}>
      <line
        x1={6}
        x2={6}
        y1={0}
        y2={length}
        strokeLinejoin={"round"}
        strokeWidth={2}
        stroke={color}
      />
      <line
        x1={6}
        x2={0}
        y1={up ? 0 : length}
        y2={up ? sLeng : (length - sLeng)}
        strokeLinejoin={"round"}
        strokeWidth={2}
        stroke={color}
      />
      <line
        x1={6}
        x2={12}
        y1={up ? 0 : length}
        y2={up ? sLeng :( length - sLeng)}
        strokeLinejoin={"round"}
        strokeWidth={2}
        stroke={color}
      />
    </OffsetBox>
  );
};

export default UplinkArrow;
