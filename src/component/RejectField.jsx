import BoxSelect from "./BoxSelect";


const RejectField = ({ x,y,w,h, onSubmit, options }) => {
  const { Button, OffsetBox } = ui;
  const [selected, setSelected] = reactUtils.useState(null);
  
  return <OffsetBox x={x} y={y}>
    <rect x={0} width={w} y={0} height={h} stroke={"#7f8082"} strokeWidth={2} fill="transparent" />
    {options ? <BoxSelect options={options} x={20} y={20} direction="h" onSelect={v => setSelected(v)} value={selected} /> : null}
    <Button x={w-170} y={h - 60} width={160} onClick={() => onSubmit(selected)}>REJECT</Button>
  </OffsetBox>
}
export default RejectField;