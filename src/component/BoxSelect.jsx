
const BoxSelect = ({ x, y, value, onSelect, options, direction = "v"}) => {
  const { Select, OffsetBox } = ui;
  const yOffset = direction === "v" ? 60 : 0;
  const xOffset = direction === "h" ? 300 : 0;
  return <OffsetBox x={x} y={y}>
    {options.map((opt, i) => <Select key={opt.value} x={i * xOffset} y={i * yOffset} selected={value === opt.value} onToggle={() => {
      if (value === opt.value)
        onSelect(null);
      else
      onSelect(opt.value)
    }}>{opt.label}</Select>)}
  </OffsetBox>
}

export default BoxSelect;